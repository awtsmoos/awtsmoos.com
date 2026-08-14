// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReaderMenuRenderer
 * @description
 * The Awtsmoos gives deliberate reader actions one bounded, focus-safe vessel;
 * at Awtsmoos.com pointer and keyboard may enter, travel, and leave without HTML-string shadows.
 */
const MENU_ID = 'custom-context-menu';
const MOBILE_QUERY = '(max-width: 760px)';

function clamp(value, minimum, maximum) {
	return Math.min(Math.max(value, minimum), maximum);
}

export function removeExistingMenu() {
	document.getElementById(MENU_ID)?.remove();
}

function place(menu, x, y) {
	if (window.matchMedia?.(MOBILE_QUERY)?.matches) {
		menu.classList.add('awtsmoos-mobile-sheet');
		document.body.append(menu);
		return;
	}
	document.body.append(menu);
	const rectangle = menu.getBoundingClientRect();
	menu.style.left = `${clamp(x + 10, 12, window.innerWidth - rectangle.width - 12)}px`;
	menu.style.top = `${clamp(y + 10, 12, window.innerHeight - rectangle.height - 12)}px`;
}

function actionButton({ label, icon }, index) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'awtsmoos-context-menu-item';
	button.dataset.actionIndex = String(index);
	button.setAttribute('role', 'menuitem');
	const glyph = document.createElement('span');
	glyph.className = 'awtsmoos-context-icon';
	glyph.textContent = icon;
	glyph.setAttribute('aria-hidden', 'true');
	const text = document.createElement('span');
	text.textContent = label;
	button.append(glyph, text);
	return button;
}

function crown() {
	const element = document.createElement('div');
	element.className = 'awtsmoos-context-crown';
	element.textContent = 'Reader Actions';
	return element;
}

function keyboardNavigation(menu, event) {
	const items = [...menu.querySelectorAll('[role="menuitem"]')];
	const index = Math.max(0, items.indexOf(document.activeElement));
	if (event.key === 'Escape') {
		event.preventDefault();
		removeExistingMenu();
		return;
	}
	if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
		return;
	}
	event.preventDefault();
	const next = event.key === 'Home'
		? 0
		: event.key === 'End'
			? items.length - 1
			: (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
	items[next]?.focus();
}

export function renderMenu(x, y, actions) {
	removeExistingMenu();
	const menu = document.createElement('div');
	menu.id = MENU_ID;
	menu.className = 'awtsmoos-reader-action-sheet';
	menu.setAttribute('role', 'menu');
	menu.setAttribute('aria-label', 'Reader actions');
	menu.append(crown(), ...actions.map(actionButton));
	menu.addEventListener('keydown', event => keyboardNavigation(menu, event));
	menu.addEventListener('click', async event => {
		const button = event.target.closest('[data-action-index]');
		if (!button) return;
		event.preventDefault();
		const action = actions[Number(button.dataset.actionIndex)]?.action;
		removeExistingMenu();
		await action?.();
	});
	place(menu, x, y);
	menu.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
	setTimeout(() => {
		document.addEventListener('pointerdown', event => {
			if (!menu.contains(event.target)) removeExistingMenu();
		}, { once: true, capture: true });
	}, 0);
}
