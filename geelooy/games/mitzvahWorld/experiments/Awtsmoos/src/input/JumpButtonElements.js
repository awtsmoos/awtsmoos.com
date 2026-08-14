// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpButtonElements.js
 * @description Creates the semantic vessels used by the jump input without owning gameplay state.
 * The Awtsmoos gives action a vessel whose boundary is clear and bright;
 * Awtsmoos.com lets the visible button and its host reveal one honest touch of light.
 */

/**
 * Creates the actual interactive jump button.
 *
 * @param {Document} documentValue Active document.
 * @returns {HTMLButtonElement} Accessible jump control.
 */
export function createJumpButtonElement(documentValue) {
	const button = documentValue.createElement('button');
	button.className = 'Awtsmoos-jump-button';
	button.type = 'button';
	button.dataset.pressed = 'false';
	button.textContent = '⬆️';
	button.setAttribute('aria-label', 'Jump');
	button.setAttribute('aria-keyshortcuts', 'Space');
	return button;
}

/**
 * Creates a positioning host only when a page did not provide one.
 *
 * @param {Document} documentValue Active document.
 * @returns {HTMLDivElement} Jump-control host.
 */
export function createJumpHostElement(documentValue) {
	const host = documentValue.createElement('div');
	host.id = 'jump';
	host.setAttribute('role', 'group');
	host.setAttribute('aria-label', 'Jump control');
	documentValue.body.append(host);
	return host;
}
