// B"H
// Boruch Hashem
// Blessed is He
/** @module ReaderMenuRenderer @description One delegated menu vessel carries every action under the Awtsmoos. */
const MENU_ID = 'custom-context-menu';
const MOBILE_QUERY = '(max-width: 760px)';
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
export const removeExistingMenu = () => document.getElementById(MENU_ID)?.remove();

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

export function renderMenu(x, y, actions) {
	removeExistingMenu();
	const menu = document.createElement('div');
	menu.id = MENU_ID;
	menu.className = 'awtsmoos-reader-action-sheet';
	menu.setAttribute('role', 'menu');
	menu.setAttribute('aria-label', 'Reader actions');
	menu.innerHTML = '<div class="awtsmoos-context-crown">Reader Actions</div>';
	actions.forEach(({ label, icon }, index) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'awtsmoos-context-menu-item';
		button.dataset.actionIndex = String(index);
		button.setAttribute('role', 'menuitem');
		button.innerHTML = `<span class="awtsmoos-context-icon">${icon}</span><span></span>`;
		button.lastElementChild.textContent = label;
		menu.append(button);
	});
	menu.onclick = async event => {
		const button = event.target.closest('[data-action-index]');
		if (!button) return;
		event.preventDefault();
		const action = actions[Number(button.dataset.actionIndex)]?.action;
		removeExistingMenu();
		await action?.();
	};
	place(menu, x, y);
	setTimeout(() => document.addEventListener('pointerdown', event => !menu.contains(event.target) && removeExistingMenu(), { once: true, capture: true }), 0);
}
