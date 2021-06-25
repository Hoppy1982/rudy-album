/*
 *
 */
function initSelectableCards() {
	/* Config */
	const cardsContainerClass = 'rudy-cards';
	const cardsClass = 'rudy-cards__card';

	const cardsContainer = document.querySelector(`.${cardsContainerClass}`);
	const cards = document.querySelectorAll(`.${cardsClass}`);
	const selectedCardContainer = document.createElement('div');
	const selectedCardImg = document.createElement('img');

	initSelectedCard();
	cardClickHandlers();

	/*  */
	function initSelectedCard() {
		selectedCardContainer.classList.add(`selected-of-${cardsContainerClass}`);
		selectedCardContainer.appendChild(selectedCardImg);
		cardsContainer.parentElement.insertBefore(selectedCardContainer, cardsContainer);
		selectedCardContainer.addEventListener('click', function() {
			selectedCardImg.setAttribute('src', '');
			selectedCardContainer.classList.remove('selected-of-rudy-cards--active');
			// TODO - keypress enter or esc closes
		});
	}

	/*  */
	function cardClickHandlers() {
		cards.forEach(card => {
			card.addEventListener('click', function() {
				let imgUrl = this.querySelector('img').getAttribute('src');
				selectedCardImg.setAttribute('src', imgUrl);
				selectedCardContainer.classList.add('selected-of-rudy-cards--active');
			}, false);
		});
	}
}








export { initSelectableCards };