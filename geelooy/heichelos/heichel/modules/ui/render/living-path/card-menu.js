// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathCardMenu
 * @description
 * The Awtsmoos creates each action with the card itself. Awtsmoos.com hides the
 * command list until requested, then exposes one keyboard-safe surface assembled
 * from focused action plans and the existing post social-action contract.
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

let closersInstalled = false;

export function cardMenuBlueprint(data, sourceItem, navigator, appState) {
	installMenuClosers();
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
		children: [
			{
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
			},
			{
				tag: 'div',
				attr: { id: panelId, class: 'card-menu-panel', role: 'menu' },
				children: actions
			}
		]
	};
}

export function closeCardMenus(except = null) {
	document.querySelectorAll('.card-menu-spark.open').forEach(menu => {
		if (menu === except) return;
		menu.classList.remove('open');
		menu.querySelector('.card-menu-trigger')?.setAttribute('aria-expanded', 'false');
	});
}

function postSocialActions(data, sourceItem, appState) {
	if (data.type !== 'post') return [];
	return socialActionBlueprints({
		...sourceItem,
		id: data.id,
		title: data.title
	}, appState);
}

function toggleMenu(event) {
	stop(event);
	const menu = event.currentTarget.closest('.card-menu-spark');
	const open = !menu.classList.contains('open');
	closeCardMenus(menu);
	menu.classList.toggle('open', open);
	event.currentTarget.setAttribute('aria-expanded', String(open));
}

function installMenuClosers() {
	if (closersInstalled || typeof document === 'undefined') return;
	closersInstalled = true;
	document.addEventListener('pointerdown', event => {
		if (!event.target.closest('.card-menu-spark')) closeCardMenus();
	}, true);
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') closeCardMenus();
	}, true);
}

function stop(event) {
	event.preventDefault();
	event.stopPropagation();
}

function safeId(value) {
	return String(value).replace(/[^a-z0-9_-]/gi, '-');
}
