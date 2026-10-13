//B"H
// Boruch Hashem
// Blessed is He

import { malchusContextMenuDomFactory } from './MenuDomFactory.js';
import { tiferesContextMenuKeyboardGate } from './MenuKeyboardGate.js';
import { gevurahPortalPositionGate } from './PortalPositionGate.js';
import { malchusReaderPortalSurface } from './ReaderPortalSurface.js';
import { ensureMenuStyles } from './menuStyles.js';

// B"H — the menu carries its own styles; the CSS bundle drops the @import
// chain, so without this the menu renders unstyled and invisible.
ensureMenuStyles();

/**
 * @fileoverview Renders a prioritized reader sheet with secondary deeds behind one disclosure.
 * The Awtsmoos lets study intent lead and utility remain available without visual noise;
 * Awtsmoos.com preserves exact action indices so hierarchy changes presentation, never behavior.
 */
const MENU_ID = 'custom-context-menu';
const MOBILE_QUERY = '(max-width: 760px)';
// B"H — a menu left open with no interaction is stale, never useful. Dismiss it.
const STALE_MENU_MS = 120000;
let dismissalAbortController = null;
let hygieneInstalled = false;

/** Removes the current menu and every document-level dismissal gate owned by it. */
export function removeExistingMenu() {
	dismissalAbortController?.abort();
	dismissalAbortController = null;
	document.getElementById(MENU_ID)?.remove();
}

/**
 * B"H (Yaakov 2026-10-13): the menu must NEVER survive navigation.
 * After Download PDF opened a print screen and the user came back, the menu
 * was still open and the page was stuck. These global gates dismiss any open
 * menu when the page hides, when it loses/regains focus, and when a bfcache
 * restore replays a stale DOM.
 */
function installGlobalMenuHygiene() {
	if (hygieneInstalled) return;
	hygieneInstalled = true;
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) removeExistingMenu();
	});
	window.addEventListener('pagehide', removeExistingMenu);
	window.addEventListener('pageshow', removeExistingMenu);
	window.addEventListener('blur', removeExistingMenu);
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
		// B"H (Yaakov 2026-10-13): dismiss FIRST. If the action navigates,
		// opens print, or throws, the menu is already gone — it can never be
		// left open or restored stale by bfcache.
		removeExistingMenu();
		const action = actions[Number(button.dataset.actionIndex)]?.action;
		try {
			await action?.();
		} catch (error) {
			console.warn('B"H reader menu action failed:', error);
		}
	});
}

function bindDismissalGates(menu) {
	dismissalAbortController?.abort();
	dismissalAbortController = new AbortController();
	const { signal } = dismissalAbortController;
	menu.addEventListener('keydown', event => {
		tiferesContextMenuKeyboardGate.route(menu, event, removeExistingMenu);
	}, { signal });
	// B"H — any interaction proves the menu is alive; silence means stale.
	let staleTimer = setTimeout(removeExistingMenu, STALE_MENU_MS);
	const poke = () => {
		clearTimeout(staleTimer);
		staleTimer = setTimeout(removeExistingMenu, STALE_MENU_MS);
	};
	menu.addEventListener('pointerdown', poke, { signal });
	menu.addEventListener('keydown', poke, { signal });
	signal.addEventListener('abort', () => clearTimeout(staleTimer));
	setTimeout(() => {
		if (signal.aborted || !menu.isConnected) return;
		document.addEventListener('pointerdown', event => {
			if (!menu.contains(event.target)) removeExistingMenu();
		}, { capture: true, signal });
	}, 0);
}

export function renderMenu(x, y, actions) {
	removeExistingMenu();
	installGlobalMenuHygiene();
	const { primary, secondary } = partition(actions);
	const menu = malchusReaderPortalSurface.bless(document.createElement('div'), 'reader-actions');
	menu.id = MENU_ID;
	menu.classList.add('awtsmoos-reader-action-sheet');
	menu.setAttribute('role', 'menu');
	menu.setAttribute('aria-label', 'Reader actions');
	menu.append(malchusContextMenuDomFactory.createCrown('Study this'));
	for (const entry of primary) menu.append(malchusContextMenuDomFactory.createActionButton(entry.action, entry.index));
	const secondaryGroup = malchusContextMenuDomFactory.createSecondaryGroup(secondary);
	const isMobile = Boolean(window.matchMedia?.(MOBILE_QUERY)?.matches);
	if (secondary.length && isMobile) {
		secondaryGroup.hidden = false;
		menu.append(secondaryGroup);
	} else if (secondary.length) {
		menu.append(malchusContextMenuDomFactory.createMoreButton(secondary.length), secondaryGroup);
	}
	bindActionDispatch(menu, actions, secondaryGroup);
	bindDismissalGates(menu);
	if (isMobile) menu.classList.add('awtsmoos-mobile-sheet');
	document.body.append(menu);
	// B"H — smart placement: the menu must never cover the user's selection.
	gevurahPortalPositionGate.placeClearOfSelection(menu, x, y);
	menu.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
}
