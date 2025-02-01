import '../pages/index.css';
import { createCard, onLikeFnc } from '../components/card.js';
import { openPopup, closePopup } from '../components/modal.js';
import { enableValidation, clearValidation, validationConfig } from '../components/validation.js';
import { getUserInfo, getInitialCards, editUserInfo, addNewCard, addNewAvatar, removeCard } from '../components/api.js';

const cardPlaceList = document.querySelector('.places__list');
const profileEditBtn = document.querySelector('.profile__edit-button');
const profileAddBtn = document.querySelector('.profile__add-button');
const profilePopupEdit = document.querySelector('.popup_type_edit');
const popupTypeNewCard = document.querySelector('.popup_type_new-card');
const popupTypeImage = document.querySelector('.popup_type_image');
const popupImage = document.querySelector('.popup__image');
const popupTypeImageCaption = document.querySelector('.popup__caption');
const popupCloseBtns = document.querySelectorAll('.popup__close');
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImg = document.querySelector('.profile__image');
const formNewCardElement = document.forms['new-place'];
const newCardSaveBtn = formNewCardElement.querySelector('.popup__button');
const formElementEditProfile = document.forms['edit-profile'];
const editProfileSaveBtn = formElementEditProfile.querySelector('.popup__button');
const nameInput = document.querySelector('.popup__input_type_name');
const jobInput = document.querySelector('.popup__input_type_description');
const cardNameInput = document.querySelector('.popup__input_type_card-name');
const cardInputUrl = document.querySelector('.popup__input_type_url');

// Аватар
const popupChangeAvatar = document.querySelector('.popup_type_change-avatar');
const avatarOpenBtn = document.querySelector('.profile__image');
const avatarForm = popupChangeAvatar.querySelector('.popup__form');
const inputAvatarForm = avatarForm.querySelector('.popup__input_type_url');
const avatarSaveButton = avatarForm.querySelector('.popup__button');

enableValidation(validationConfig);

let userId;

// @todo: Функция удаления карточки
function cardDelete(element, cardId) {
  const removeCardPopup = document.querySelector('.popup_type_remove-card');
  openPopup(removeCardPopup);
  const removeButton = removeCardPopup.querySelector('.popup__button');

  removeButton.onclick = () => {
    removeCard(cardId)
      .then(() => {
        element.remove();
        closePopup(removeCardPopup);
      })
      .catch((err) => {
        console.error("Ошибка при удалении карточки:", err);
      });
  };
}

// @todo: Вывести карточки на страницу
function getInfoUserAndCards() {
  return Promise.all([getUserInfo(), getInitialCards()])
    .then(([userData, cardsData]) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      profileImg.style.backgroundImage = `url(${userData.avatar})`;

      userId = userData._id;

      cardsData.forEach((element) => {
        const newCard = createCard(element, userId, onLikeFnc, openImageClick, cardDelete);
        cardPlaceList.append(newCard);
      });
    })
    .catch((err) => {
      console.error("Ошибка при загрузке данных:", err);
    });
}

getInfoUserAndCards();

// Функция открытия попапа с картинкой
function openImageClick(item) {
  popupImage.src = item.link;
  popupImage.alt = item.name;
  popupTypeImageCaption.textContent = item.name;
  openPopup(popupTypeImage);
}

// Открытие попапа смены аватара
avatarOpenBtn.addEventListener('click', () => {
  openPopup(popupChangeAvatar);
  inputAvatarForm.value = '';
  clearValidation(popupChangeAvatar, validationConfig);
});

// Функция смены аватара
avatarForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  changeBtnText(avatarSaveButton, true);

  addNewAvatar(inputAvatarForm.value)
    .then((res) => {
      console.log("Аватар обновлен:", res);
      avatarOpenBtn.style.backgroundImage = `url(${res.avatar})`;
      closePopup(popupChangeAvatar);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении аватара:", err);
    })
    .finally(() => {
      changeBtnText(avatarSaveButton, false);
    });
});

// Обработчик открытия модалки редактирования профиля
profileEditBtn.addEventListener('click', () => {
  openPopup(profilePopupEdit);
  clearValidation(profilePopupEdit, validationConfig);

  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDescription.textContent;
});

// Функция «отправки» формы редактирования профиля
function handleFormSubmitProfile(evt) {
  evt.preventDefault();
  changeBtnText(editProfileSaveBtn, true);

  editUserInfo(nameInput.value, jobInput.value)
    .then((data) => {
      console.log("Данные профиля обновлены:", data);
      profileTitle.textContent = data.name;
      profileDescription.textContent = data.about;
      closePopup(profilePopupEdit);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении профиля:", err);
    })
    .finally(() => {
      changeBtnText(editProfileSaveBtn, false);
    });
}

formElementEditProfile.addEventListener('submit', handleFormSubmitProfile);

// Обработчик открытия модалки добавления карточки
profileAddBtn.addEventListener('click', () => {
  openPopup(popupTypeNewCard);
  clearValidation(popupTypeNewCard, validationConfig);
});

// Функция добавления новой карточки
function createNewCard(evt) {
  evt.preventDefault();
  changeBtnText(newCardSaveBtn, true);

  const element = {
    name: cardNameInput.value.trim(),
    link: cardInputUrl.value.trim(),
  };

  console.log("Отправка данных на сервер:", element);

  addNewCard(element)
    .then((data) => {
      console.log("Ответ сервера:", data);
      const newPopupCard = createCard(data, userId, onLikeFnc, openImageClick, cardDelete);
      cardPlaceList.prepend(newPopupCard);
      closePopup(popupTypeNewCard);
      evt.target.reset();
    })
    .catch((err) => {
      console.error("Ошибка при добавлении карточки:", err);
    })
    .finally(() => {
      changeBtnText(newCardSaveBtn, false);
    });
}

formNewCardElement.addEventListener('submit', createNewCard);

// Обработчик закрытия по кнопке (крестику)
popupCloseBtns.forEach(event => {
  const popup = event.closest('.popup');
  event.addEventListener('click', () => {
    closePopup(popup);
  });
});

// Функция смены статуса кнопки
function changeBtnText(buttonElement, status) {
  buttonElement.textContent = status ? 'Сохранение...' : 'Сохранить';
}
