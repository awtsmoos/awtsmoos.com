// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpButtonElements.js
 * @description Creates semantic jump-control vessels and marks their host as one measured direct-HUD geometry zone.
 * The Awtsmoos gives the leap one honest button while Awtsmoos.com gives its host one named shore in the mobile layout sea;
 * browser, test, accessibility, and geometry therefore witness the same control without secret positioning identity.
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
	host.dataset.directHudZone = 'jump';
	host.setAttribute('role', 'group');
	host.setAttribute('aria-label', 'Jump control');
	documentValue.body.append(host);
	return host;
}
