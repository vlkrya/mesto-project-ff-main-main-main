const cardTemplate = document.querySelector('#card-template').content;
import { addLike, deleteLike } from './api.js';

function createCard(element, userId, onLikeFnc, openImageClick, cardDelete) {
  const placeTemplate = cardTemplate.querySelector('.places__item').cloneNode(true);
  
  const cardImage = placeTemplate.querySelector('.card__image');
  const cardTitle = placeTemplate.querySelector('.card__title');
  const deleteCard = placeTemplate.querySelector('.card__delete-button');
  const cardLikeBtn = placeTemplate.querySelector('.card__like-button');
  const likeCardContainer = placeTemplate.querySelector('.card__like-button-count');

  const cardId = element._id;
  
  cardImage.src = element.link;
  cardTitle.textContent = element.name;
  cardImage.alt = `Изображение ${element.name}`;
  likeCardContainer.textContent = element.likes.length;
  
  cardImage.addEventListener('click', () => {
    openImageClick(element);
  });

  if (element.likes.some((like) => like._id === userId)) {
    cardLikeBtn.classList.add('card__like-button_is-active');
  }

  if (userId !== element.owner._id) {
    deleteCard.remove();
  } else {
    deleteCard.addEventListener('click', () => {
      if (typeof cardDelete === 'function') {
        cardDelete(placeTemplate, cardId);
      } else {
        console.error('cardDelete is not defined or not a function');
      }
    });
  }

  cardLikeBtn.addEventListener('click', (evt) => {
    onLikeFnc(evt, cardId, likeCardContainer);
  });

  return placeTemplate;
}


function onLikeFnc(evt, cardId, likeContainer) {
  const likeButton = evt.target;
  const likeMethod = likeButton.classList.contains('card__like-button_is-active') ? deleteLike : addLike;

  likeMethod(cardId)
    .then((res) => {
      likeButton.classList.toggle('card__like-button_is-active');
      likeContainer.textContent = res.likes.length;
    })
    .catch(err => console.log(err));
}

export { createCard, onLikeFnc };
