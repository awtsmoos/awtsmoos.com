//B"H
// Boruch Hashem
// Blessed is He

import { malchusContextMenuDomFactory } from './MenuDomFactory.js';
import { tiferesContextMenuKeyboardGate } from './MenuKeyboardGate.js';
import { gevurahPortalPositionGate } from './PortalPositionGate.js';
import { malchusReaderPortalSurface } from './ReaderPortalSurface.js';

/**
 * @fileoverview Renders a prioritized reader sheet with secondary deeds behind one disclosure.
 * The Awtsmoos lets study intent lead and utility remain available without visual noise;
 * Awtsmoos.com preserves exact action indices so hierarchy changes presentation, never behavior.
 */
const MENU_ID = 'custom-context-menu';
const MOBILE_QUERY = '(max-width: 760px)';
let dismissalAbortController = null;

/** Removes the current menu and every document-level dismissal gate owned by it. */
export function removeExistingMenu() {
	dismissalAbortController?.abort();
	dismissalAbortController = null;
	document.getElementById(MENU_ID)?.remove();
}

function partition(actions) {
	const primary = [];
	const secondary = [];
	actions.forEach((action, index) => {
		(action.importance === 'secondary' ? secondary : primary).push({ action, index });
	});
	return { primary, secondary };
}

function bindActionDispatch(menu, actions, secondaryGroup) {
	menu.addEventListener('click', async event => {
		const more = event.target.closest('[data-reader-more]');
		if (more) {
			event.preventDefault();
			const expanded = more.getAttribute('aria-expanded') === 'true';
			more.setAttribute('aria-expanded', String(!expanded));
			secondaryGroup.hidden = expanded;
			more.querySelector('.awtsmoos-context-label').textContent = expanded
				? `More · ${secondaryGroup.children.length}`
				: 'Less';
			if (!expanded) secondaryGroup.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
			return;
		}
		const button = event.target.closest('[data-action-index]');
		if (!button) return;
		event.preventDefault();
		const action = actions[Number(button.dataset.actionIndex)]?.action;
		const result = action?.();
		removeExistingMenu();
		await result;
	});
}

function bindDismissalGates(menu) {
	dismissalAbortController?.abort();
	dismissalAbortController = new AbortController();
	const { signal } = dismissalAbortController;
	menu.addEventListener('keydown', event => {
		tiferesContextMenuKeyboardGate.route(menu, event, removeExistingMenu);
	}, { signal });
	setTimeout(() => {
		if (signal.aborted || !menu.isConnected) return;
		document.addEventListener('pointerdown', event => {
			if (!menu.contains(event.target)) removeExistingMenu();
		}, { capture: true, signal });
	}, 0);
}

export function renderMenu(x, y, actions) {
	removeExistingMenu();
	const { primary, secondary } = partition(actions);
	const menu = malchusReaderPortalSurface.bless(document.createElement('div'), 'reader-actions');
	menu.id = MENU_ID;
	menu.classList.add('awtsmoos-reader-action-sheet');
	menu.setAttribute('role', 'menu');
	menu.setAttribute('aria-label', 'Reader actions');
	menu.append(malchusContextMenuDomFactory.createCrown('Study this'));
	for (const entry of primary) menu.append(malchusContextMenuDomFactory.createActionButton(entry.action, entry.index));
	const secondaryGroup = malchusContextMenuDomFactory.createSecondaryGroup(secondary);
	if (secondary.length) menu.append(malchusContextMenuDomFactory.createMoreButton(secondary.length), secondaryGroup);
	bindActionDispatch(menu, actions, secondaryGroup);
	bindDismissalGates(menu);
	if (window.matchMedia?.(MOBILE_QUERY)?.matches) menu.classList.add('awtsmoos-mobile-sheet');
	document.body.append(menu);
	gevurahPortalPositionGate.place(menu, x, y);
	menu.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
}
