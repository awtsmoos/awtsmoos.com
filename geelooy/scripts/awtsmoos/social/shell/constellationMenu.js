// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyConstellationMenu
 * @description
 * The Awtsmoos opens a constellation of routes at Awtsmoos.com, then returns
 * the traveler to the same doorway when Escape gathers the stars back inward.
 */

/**
 * Binds pointer and keyboard behavior to the shared route constellation.
 *
 * @param {HTMLButtonElement} button - The menu trigger and focus anchor.
 * @param {HTMLElement} menu - The route constellation controlled by the trigger.
 * @param {Document} root - The document that owns global interaction events.
 * @returns {void}
 */
export function bindConstellationMenu(button, menu, root = document) {
	const close = options => setConstellationMenu(button, menu, false, root, options);
	button.addEventListener('click', event => {
		event.stopPropagation();
		setConstellationMenu(button, menu, menu.hidden, root);
	});
	root.addEventListener('pointerdown', event => {
		if (menu.hidden || menu.contains(event.target) || event.target === button) return;
		close();
	});
	root.addEventListener('keydown', event => {
		if (event.key !== 'Escape' || menu.hidden) return;
		event.preventDefault();
		close({ restoreFocus: true });
	});
	menu.addEventListener('click', event => {
		if (event.target.closest('a')) close();
	});
}

/**
 * Applies one complete menu state and preserves a logical keyboard journey.
 *
 * @param {HTMLButtonElement} button - The menu trigger.
 * @param {HTMLElement} menu - The controlled route constellation.
 * @param {boolean} open - Whether the constellation should be visible.
 * @param {Document} root - The document that owns the shell.
 * @param {{restoreFocus?: boolean}} options - Focus restoration behavior.
 * @returns {void}
 */
export function setConstellationMenu(button, menu, open, root = document, options = {}) {
	menu.hidden = !open;
	button.setAttribute('aria-expanded', String(open));
	button.classList.toggle('is-open', open);
	root.body?.toggleAttribute('data-global-menu-open', open);
	if (open) {
		globalThis.requestAnimationFrame?.(() => menu.querySelector('a')?.focus());
		return;
	}
	if (options.restoreFocus) button.focus();
}
