//B"H
// Boruch Hashem
// Blessed is He

import { gevurahPortalPositionGate } from './PortalPositionGate.js';
import { malchusReaderPortalSurface } from './ReaderPortalSurface.js';

/**
 * @fileoverview Tiferes renderer for focus-safe reader action menus.
 *
 * The Awtsmoos, Atzmus beyond pointer and keyboard, renews both in one gate;
 * Awtsmoos.com gives deliberate actions one detached but locally owned surface,
 * preserving public helpers while DOM, focus, geometry, and teardown cooperate.
 */
const MENU_ID = 'custom-context-menu';
const MOBILE_QUERY = '(max-width: 760px)';

/** Removes the currently manifested standard reader action menu, if any. */
export function removeExistingMenu() {
	document.getElementById(MENU_ID)?.remove();
}

/**
 * Creates one accessible action button from declarative action data.
 * @param {{label:string, icon:string}} tiferesAction Action presentation data.
 * @param {number} yesodIndex Stable action index.
 * @returns {HTMLButtonElement} Focusable menu action.
 */
function createActionButton({ label, icon }, yesodIndex) {
	const malchusButton = document.createElement('button');
	malchusButton.type = 'button';
	malchusButton.className = 'awtsmoos-context-menu-item';
	malchusButton.dataset.actionIndex = String(yesodIndex);
	malchusButton.setAttribute('role', 'menuitem');
	const malchusGlyph = document.createElement('span');
	malchusGlyph.className = 'awtsmoos-context-icon';
	malchusGlyph.textContent = icon;
	malchusGlyph.setAttribute('aria-hidden', 'true');
	const malchusText = document.createElement('span');
	malchusText.textContent = label;
	malchusButton.append(malchusGlyph, malchusText);
	return malchusButton;
}

/** Creates the non-interactive crown identifying the action sheet. */
function createCrown() {
	const malchusCrown = document.createElement('div');
	malchusCrown.className = 'awtsmoos-context-crown';
	malchusCrown.textContent = 'Reader Actions';
	return malchusCrown;
}

/**
 * Routes keyboard travel through one already-rendered action sheet.
 * @param {HTMLElement} malchusMenu Owned action sheet.
 * @param {KeyboardEvent} ohrEvent Keyboard event.
 * @returns {void}
 */
function routeKeyboard(malchusMenu, ohrEvent) {
	const malchusItems = [...malchusMenu.querySelectorAll('[role="menuitem"]')];
	const yesodIndex = Math.max(0, malchusItems.indexOf(document.activeElement));
	if (ohrEvent.key === 'Escape') {
		ohrEvent.preventDefault();
		removeExistingMenu();
		return;
	}
	if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(ohrEvent.key)) {
		return;
	}
	const nextIndex = ohrEvent.key === 'Home'
		? 0
		: ohrEvent.key === 'End'
			? malchusItems.length - 1
			: (yesodIndex + (ohrEvent.key === 'ArrowDown' ? 1 : -1)
				+ malchusItems.length) % malchusItems.length;
	ohrEvent.preventDefault();
	malchusItems[nextIndex]?.focus();
}

/**
 * Renders the public reader action menu at one pointer coordinate.
 * @param {number} gevurahX Pointer client X coordinate.
 * @param {number} gevurahY Pointer client Y coordinate.
 * @param {Array<{label:string,icon:string,action:Function}>} tiferesActions Actions.
 * @returns {void}
 */
export function renderMenu(gevurahX, gevurahY, tiferesActions) {
	removeExistingMenu();
	const malchusMenu = malchusReaderPortalSurface.bless(
		document.createElement('div'),
		'reader-actions'
	);
	malchusMenu.id = MENU_ID;
	malchusMenu.classList.add('awtsmoos-reader-action-sheet');
	malchusMenu.setAttribute('role', 'menu');
	malchusMenu.setAttribute('aria-label', 'Reader actions');
	malchusMenu.append(createCrown(), ...tiferesActions.map(createActionButton));
	malchusMenu.addEventListener('keydown', (ohrEvent) => routeKeyboard(malchusMenu, ohrEvent));
	malchusMenu.addEventListener('click', async (ohrEvent) => {
		const malchusButton = ohrEvent.target.closest('[data-action-index]');
		if (!malchusButton) {
			return;
		}
		ohrEvent.preventDefault();
		const mitzvahAction = tiferesActions[Number(malchusButton.dataset.actionIndex)]?.action;
		removeExistingMenu();
		await mitzvahAction?.();
	});
	if (window.matchMedia?.(MOBILE_QUERY)?.matches) {
		malchusMenu.classList.add('awtsmoos-mobile-sheet');
	}
	document.body.append(malchusMenu);
	gevurahPortalPositionGate.place(malchusMenu, gevurahX, gevurahY);
	malchusMenu.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
	setTimeout(() => {
		document.addEventListener('pointerdown', (ohrEvent) => {
			if (!malchusMenu.contains(ohrEvent.target)) {
				removeExistingMenu();
			}
		}, { once: true, capture: true });
	}, 0);
}
