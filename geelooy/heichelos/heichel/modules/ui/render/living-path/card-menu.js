// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathCardMenu
 * @description
 * The Awtsmoos creates each hidden command with the card yet lifts it beyond the card when called;
 * Awtsmoos.com portals the living panel above clipping ancestors, then returns it when the command veil has fallen.
 */

import { socialActionBlueprints } from '../social-actions.js';
import {
	bookmarkAction,
	commentsAction,
	followAction,
	manageAction,
	openAction,
	shareAction
} from './card-menu-actions.js';
import { installCardMenuLifecycle } from './card-menu-lifecycle.js';
import {
	closeCardMenuPortal,
	isCardMenuPortalTarget,
	openCardMenuPortal
} from './card-menu-portal.js';

/** Builds one compact action trigger while keeping the heavy panel dormant. */
export function cardMenuBlueprint(data, sourceItem, navigator, appState) {
	installCardMenuLifecycle(closeCardMenus, isCardMenuPortalTarget);
	const panelId = `living-card-menu-${safeId(data.id)}`;
	const close = () => closeCardMenus();
	const actions = [
		openAction(data, sourceItem, navigator, appState, close),
		followAction(data, appState, close),
		bookmarkAction(data, sourceItem, appState, close),
		shareAction(data, navigator, appState, close),
		commentsAction(data, appState, close),
		manageAction(data, navigator, appState, close),
		...postSocialActions(data, sourceItem, appState)
	].filter(Boolean);
	return {
		tag: 'div',
		attr: { class: 'card-menu-spark', 'data-card-menu': data.id },
		events: { click: stop },
		children: [triggerBlueprint(data, panelId), panelBlueprint(panelId, actions)]
	};
}

/** Closes every open card action panel except an explicitly preserved menu. */
export function closeCardMenus(except = null) {
	document.querySelectorAll('.card-menu-spark.open').forEach(menu => {
		if (menu === except) return;
		menu.classList.remove('open');
		menu.querySelector('.card-menu-trigger')?.setAttribute('aria-expanded', 'false');
		closeCardMenuPortal(menu);
	});
}

function triggerBlueprint(data, panelId) {
	return {
		tag: 'button',
		attr: {
			type: 'button',
			class: 'card-menu-trigger',
			'aria-label': `More actions for ${data.title}`,
			'aria-expanded': 'false',
			'aria-controls': panelId
		},
		children: ['⋮'],
		events: { click: toggleMenu }
	};
}

function panelBlueprint(panelId, actions) {
	return {
		tag: 'div',
		attr: { id: panelId, class: 'card-menu-panel', role: 'menu' },
		children: actions
	};
}

function postSocialActions(data, sourceItem, appState) {
	if (data.type !== 'post') return [];
	return socialActionBlueprints({ ...sourceItem, id: data.id, title: data.title }, appState);
}

function toggleMenu(event) {
	stop(event);
	const trigger = event.currentTarget;
	const menu = trigger.closest('.card-menu-spark');
	const shouldOpen = !menu.classList.contains('open');
	closeCardMenus(menu);
	menu.classList.toggle('open', shouldOpen);
	trigger.setAttribute('aria-expanded', String(shouldOpen));
	if (shouldOpen) openCardMenuPortal(menu, trigger);
	else closeCardMenuPortal(menu);
}

function stop(event) {
	event.preventDefault();
	event.stopPropagation();
}

function safeId(value) {
	return String(value).replace(/[^a-z0-9_-]/gi, '-');
}
