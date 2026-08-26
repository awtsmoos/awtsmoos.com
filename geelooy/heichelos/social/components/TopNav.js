// B"H
import { h } from './render.js';

/**
 * @module TopNav
 * @description
 * Malchus exposes only the primary social roads at the top level while deeper
 * operations remain elsewhere. Every control has a localized class hook so the
 * host page never inherits anonymous navigation styling.
 */
export function TopNav(binahOptions = {}) {
	return h('header', { class: 'awt-topbar' }, [
		h('strong', { class: 'awt-brand' }, ['Awtsmoos Social']),
		h('nav', { class: 'awt-card-actions', 'aria-label': 'Primary social routes' }, [
			h('a', { class: 'awt-nav-link', href: '/heichelos' }, ['Heichelos']),
			h('a', { class: 'awt-nav-link', href: '/email' }, ['Inbox']),
			h('a', { class: 'awt-nav-link', href: '/profile' }, ['Profile']),
			h('button', {
				class: 'awt-btn',
				type: 'button',
				onclick: binahOptions.onRefresh
			}, ['Refresh'])
		])
	]);
}
