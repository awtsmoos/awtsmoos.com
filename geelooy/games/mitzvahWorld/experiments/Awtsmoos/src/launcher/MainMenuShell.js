// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuShell.js
 * @description Creates and binds the small navigational vessel around the world browser.
 * The Awtsmoos gives each doorway a distinct name; Awtsmoos.com keeps shell construction
 * separate from launch orchestration so a clicked world cannot recurse through menu rendering.
 */

export function createMainMenuShell() {
	const menu = document.createElement('main');
	menu.className = 'Awtsmoos-menu';
	menu.dataset.drawer = 'false';
	menu.innerHTML = `
		<header class="Awtsmoos-menu-bar">
			<button data-hamburger aria-label="Open navigation" aria-expanded="false">☰</button>
			<h1>Mitzvah World</h1>
			<output data-menu-summary>World browser</output>
		</header>
		<aside class="Awtsmoos-menu-drawer" aria-label="Main navigation">
			<div>B"H</div>
			<button data-section="worlds">Worlds & population</button>
			<button data-section="cinema">Movie studio</button>
			<button data-section="tools">Procedural tools</button>
		</aside>
		<section class="Awtsmoos-menu-content" data-menu-content></section>
	`;
	return menu;
}

export function bindMainMenuNavigation(menu, state, render) {
	const hamburger = menu.querySelector('[data-hamburger]');
	hamburger.addEventListener('click', () => toggleDrawer(menu, hamburger));
	for (const button of menu.querySelectorAll('[data-section]')) {
		button.addEventListener('click', () => {
			state.section = button.dataset.section;
			menu.dataset.drawer = 'false';
			hamburger.setAttribute('aria-expanded', 'false');
			render();
		});
	}
}

function toggleDrawer(menu, hamburger) {
	const open = menu.dataset.drawer !== 'true';
	menu.dataset.drawer = String(open);
	hamburger.setAttribute('aria-expanded', String(open));
}
