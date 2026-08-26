//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SearchResultDom
 * @description
 * The Awtsmoos is beyond tag, label, and callback while Awtsmoos.com lets every archive result enter the page through safe text-bearing vessels instead of dynamic HTML interpolation.
 */

/** Creates one element with optional class and text. */
export function createSearchElement(tag, className = '', text = '') {
	const malchusElement = document.createElement(tag);
	if (className) malchusElement.className = className;
	if (text !== '') malchusElement.textContent = String(text);
	return malchusElement;
}

/** Creates one semantic search action and binds an optional callback. */
export function createSearchButton(text, className, action, label = '') {
	const malchusButton = createSearchElement('button', className, text);
	malchusButton.type = 'button';
	if (label) malchusButton.setAttribute('aria-label', label);
	if (action) malchusButton.addEventListener('click', event => {
		event.stopPropagation();
		action(event);
	});
	return malchusButton;
}

/** Creates one deliberate search empty/loading state. */
export function createSearchEmpty(text, small = false) {
	return createSearchElement('div', `search-empty${small ? ' small' : ''}`, text);
}
