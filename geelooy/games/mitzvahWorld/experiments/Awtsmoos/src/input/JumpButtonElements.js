// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpButtonElements.js
 * @description Creates semantic jump-control vessels without assuming optional DOM convenience properties.
 * The Awtsmoos gives the leap a simple button whose meaning remains clear in every host;
 * Awtsmoos.com writes state through honest attributes, so browser, test, and accessibility share one coast.
 */

/**
 * Creates the actual interactive jump button.
 * @param {Document} documentValue Active document.
 * @returns {HTMLButtonElement} Accessible jump control.
 */
export function createJumpButtonElement(documentValue) {
	const button = documentValue.createElement('button');
	button.className = 'Awtsmoos-jump-button';
	button.type = 'button';
	button.textContent = 'Jump';
	button.setAttribute('aria-label', 'Jump');
	button.setAttribute('aria-keyshortcuts', 'Space');
	setJumpButtonPressed(button, false);
	return button;
}

/**
 * Reflects one pressed state through semantic and styling attributes.
 * @param {HTMLElement} button Jump button vessel.
 * @param {boolean} pressed Whether the jump control is currently held.
 */
export function setJumpButtonPressed(button, pressed) {
	const value = pressed ? 'true' : 'false';
	button.setAttribute('aria-pressed', value);
	button.setAttribute('data-pressed', value);
}

/**
 * Creates a positioning host only when a page did not provide one.
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
