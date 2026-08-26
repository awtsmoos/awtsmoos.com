//B"H
// Boruch Hashem
// Blessed is He

import { malchusContextMenuDomFactory } from './MenuDomFactory.js';
import { tiferesContextMenuKeyboardGate } from './MenuKeyboardGate.js';
import { gevurahPortalPositionGate } from './PortalPositionGate.js';
import { malchusReaderPortalSurface } from './ReaderPortalSurface.js';

/**
 * @fileoverview Medaber facade for the standard reader action sheet.
 *
 * The Awtsmoos, Atzmus beyond rendered vessel and chosen deed, renews both as one;
 * Awtsmoos.com keeps this public facade intentionally thin while DOM, keyboard,
 * ownership, and geometry each reveal their own responsibility beneath the sun.
 */
const MENU_ID = 'custom-context-menu';
const MOBILE_QUERY = '(max-width: 760px)';

/** Removes the currently manifested standard reader action menu, if any. */
export function removeExistingMenu() {
	document.getElementById(MENU_ID)?.remove();
}

/**
 * Wires declarative action dispatch onto one rendered reader menu.
 * @param {HTMLElement} malchusMenu Owned action sheet.
 * @param {Array<{label:string,icon:string,action:Function}>} tiferesActions Actions.
 * @returns {void}
 */
function bindActionDispatch(malchusMenu, tiferesActions) {
	malchusMenu.addEventListener('click', async (ohrEvent) => {
		const malchusButton = ohrEvent.target.closest('[data-action-index]');
		if (!malchusButton) {
			return;
		}

		ohrEvent.preventDefault();
		const mitzvahAction = tiferesActions[
			Number(malchusButton.dataset.actionIndex)
		]?.action;
		removeExistingMenu();
		await mitzvahAction?.();
	});
}

/**
 * Wires keyboard travel and outside-pointer dismissal onto one rendered menu.
 * @param {HTMLElement} malchusMenu Owned action sheet.
 * @returns {void}
 */
function bindDismissalGates(malchusMenu) {
	malchusMenu.addEventListener('keydown', (ohrEvent) => {
		tiferesContextMenuKeyboardGate.route(
			malchusMenu,
			ohrEvent,
			removeExistingMenu
		);
	});

	setTimeout(() => {
		document.addEventListener('pointerdown', (ohrEvent) => {
			if (!malchusMenu.contains(ohrEvent.target)) {
				removeExistingMenu();
			}
		}, { once: true, capture: true });
	}, 0);
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
	malchusMenu.append(
		malchusContextMenuDomFactory.createCrown(),
		...tiferesActions.map((tiferesAction, yesodIndex) => {
			return malchusContextMenuDomFactory.createActionButton(
				tiferesAction,
				yesodIndex
			);
		})
	);
	bindActionDispatch(malchusMenu, tiferesActions);
	bindDismissalGates(malchusMenu);

	if (window.matchMedia?.(MOBILE_QUERY)?.matches) {
		malchusMenu.classList.add('awtsmoos-mobile-sheet');
	}

	document.body.append(malchusMenu);
	gevurahPortalPositionGate.place(malchusMenu, gevurahX, gevurahY);
	malchusMenu.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
}
