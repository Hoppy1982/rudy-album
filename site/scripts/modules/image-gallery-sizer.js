/*
 * Makes cards clickable
 *
 * @param {string} cardsContainerClass. Css class of element containing resized cards
 * @param {string} cardsClass. Css class of each resized card element
 */
function initSelectableCards(cardsContainerClass, cardsClass) {
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
		selectedCardContainer.addEventListener( 'click', () => closeSelected() );
	}

	/*  */
	function cardClickHandlers() {
		cards.forEach(card => {
			card.addEventListener('click', function() {
				let imgUrl = this.querySelector('img').getAttribute('src');
				selectedCardImg.setAttribute('src', imgUrl);
				selectedCardContainer.classList.add('selected-of-rudy-cards--active');
				document.addEventListener('keydown', handleKeyDownEsc);
			}, false);
		});
	}

	/*  */
	function handleKeyDownEsc(evt) {
		if (evt.code === 'Escape') closeSelected();
	}

	/*  */
	function closeSelected() {
		selectedCardImg.setAttribute('src', '');
		selectedCardContainer.classList.remove('selected-of-rudy-cards--active');
		document.removeEventListener('keydown', handleKeyDownEsc);
	}
}



export { initSelectableCards };