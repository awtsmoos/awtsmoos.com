//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file MainMenuShell.js
 * @description
 * Creates and binds the accessible navigation vessel around the world browser.
 * Drawer state is reflected in layout, focusability, and ARIA together so a visual
 * off-canvas transition can never leave invisible controls reachable by keyboard.
 */

const DRAWER_ID = 'Awtsmoos-main-menu-drawer';

/**
 * Creates the semantic world-browser shell in its safely closed initial state.
 * @returns {HTMLElement} Detached main menu ready for navigation binding and render.
 */
export function createMainMenuShell() {
	const menu = document.createElement('main');
	menu.className = 'Awtsmoos-menu';
	menu.dataset.drawer = 'false';
	menu.innerHTML = `
		<header class="Awtsmoos-menu-bar">
			<button data-hamburger aria-label="Open navigation" aria-controls="${DRAWER_ID}" aria-expanded="false">☰</button>
			<h1>Mitzvah World</h1>
			<output data-menu-summary>World browser</output>
		</header>
		<aside id="${DRAWER_ID}" class="Awtsmoos-menu-drawer" aria-label="Main navigation" aria-hidden="true" inert>
			<div>B"H</div>
			<button data-section="worlds">Worlds & population</button>
			<button data-section="cinema">Movie studio</button>
			<button data-section="tools">Procedural tools</button>
		</aside>
		<section class="Awtsmoos-menu-content" data-menu-content></section>
	`;
	return menu;
}

/**
 * Binds drawer, section, and keyboard behavior without owning section rendering.
 * @param {HTMLElement} menu Menu shell returned by {@link createMainMenuShell}.
 * @param {{section:string}} state Mutable launcher navigation state.
 * @param {() => void} render Renders the selected section after navigation changes.
 * @returns {void}
 */
export function bindMainMenuNavigation(menu, state, render) {
	const hamburger = menu.querySelector('[data-hamburger]');
	hamburger.addEventListener('click', () => {
		setDrawerOpen(menu, hamburger, menu.dataset.drawer !== 'true');
	});
	menu.addEventListener('keydown', event => handleMenuKeydown(event, menu, hamburger));
	for (const button of menu.querySelectorAll('[data-section]')) {
		button.addEventListener('click', () => {
			state.section = button.dataset.section;
			setDrawerOpen(menu, hamburger, false, true);
			render();
		});
	}
}

/**
 * Synchronizes visual, accessibility, and focus state for one drawer transition.
 * @param {HTMLElement} menu Root menu element carrying the finite drawer state.
 * @param {HTMLButtonElement} hamburger Drawer disclosure control.
 * @param {boolean} open Desired drawer state.
 * @param {boolean} [restoreFocus=false] Whether closing returns focus to disclosure.
 * @returns {void}
 */
function setDrawerOpen(menu, hamburger, open, restoreFocus = false) {
	const drawer = menu.querySelector(`#${DRAWER_ID}`);
	menu.dataset.drawer = String(open);
	hamburger.setAttribute('aria-expanded', String(open));
	hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
	drawer.setAttribute('aria-hidden', String(!open));
	drawer.inert = !open;
	if (!open && restoreFocus) {
		hamburger.focus();
	}
}

/**
 * Closes an open navigation drawer when Escape is pressed anywhere inside the menu.
 * @param {KeyboardEvent} event Menu keyboard event.
 * @param {HTMLElement} menu Menu root.
 * @param {HTMLButtonElement} hamburger Disclosure control receiving restored focus.
 * @returns {void}
 */
function handleMenuKeydown(event, menu, hamburger) {
	if (event.key !== 'Escape' || menu.dataset.drawer !== 'true') {
		return;
	}
	event.preventDefault();
	setDrawerOpen(menu, hamburger, false, true);
}
