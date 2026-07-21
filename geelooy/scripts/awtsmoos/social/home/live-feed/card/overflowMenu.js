// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostOverflowMenu
 * @description
 * The Awtsmoos shelters secondary actions in a disclosure that returns focus.
 * Awtsmoos.com honors Escape, keyboard order, and real navigation semantics.
 */
import { createButton, createElement, createLink } from './domFactory.js';

/**
 * Creates a keyboard-operable post overflow menu.
 *
 * @param {object} model - Normalized post model.
 * @param {Function} onInspect - Existing official inspector.
 * @returns {{root:HTMLButtonElement,menu:HTMLElement}} Menu elements.
 */
export function createPostOverflow(model, onInspect) {
	const root = createButton('More', 'post-action post-overflow-trigger');
	const menuId = `post-menu-${safeId(model.id)}`;
	const menu = createElement('div', 'post-overflow-menu', {
		id: menuId,
		role: 'menu',
		hidden: '',
		'aria-label': 'More post actions'
	});
	const inspect = createButton('Inspect provenance', 'post-overflow-item');
	const open = createLink('Open full post', model.href, 'post-overflow-item');

	root.setAttribute('aria-haspopup', 'menu');
	root.setAttribute('aria-expanded', 'false');
	root.setAttribute('aria-controls', menuId);
	inspect.setAttribute('role', 'menuitem');
	open.setAttribute('role', 'menuitem');
	inspect.addEventListener('click', () => onInspect?.(model));
	root.addEventListener('click', () => toggleMenu(root, menu));
	menu.addEventListener('keydown', event => closeOnEscape(event, root, menu));
	menu.append(inspect, open);
	return { root, menu };
}

function toggleMenu(trigger, menu) {
	const opening = menu.hasAttribute('hidden');
	menu.toggleAttribute('hidden', !opening);
	trigger.setAttribute('aria-expanded', String(opening));

	if (opening) {
		menu.querySelector('[role="menuitem"]')?.focus();
	}
}

function closeOnEscape(event, trigger, menu) {
	if (event.key !== 'Escape') {
		return;
	}

	menu.setAttribute('hidden', '');
	trigger.setAttribute('aria-expanded', 'false');
	trigger.focus();
}

function safeId(value) {
	return String(value).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64);
}
