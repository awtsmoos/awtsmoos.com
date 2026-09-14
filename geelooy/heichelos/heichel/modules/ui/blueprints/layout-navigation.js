// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLayoutNavigation
 * @description
 * Quick links, drawer routes, and the mobile dock remain one navigation vessel.
 */

import {
	box,
	button,
	link
} from './layout-primitives.js';

export function quickLinks() {
	return {
		tag: 'details',
		attr: { class: 'topbar-notification-menu' },
		children: [
			{
				tag: 'summary',
				attr: {
					class: 'topbar-icon',
					'aria-label': 'Open quick links'
				},
				children: ['✨']
			},
			box('topbar-menu-panel', [
				link('/', '🏡 Home'),
				link('/heichelos', '🪐 Heichelos'),
				link('/heichelos/ikar?view=series', '📚 Sefarim'),
				link('/profile', '👤 Profile')
			])
		]
	};
}

export function drawer() {
	return {
		tag: 'aside',
		attr: {
			class: 'geelooy-mobile-drawer',
			hidden: 'hidden'
		},
		children: [
			link('/', '🏡 Home'),
			link('/heichelos', '🪐 Heichelos'),
			link('/heichelos/ikar?view=series', '📚 Series'),
			link('/email', '✉️ Messages'),
			link('/profile', '👤 Profile')
		]
	};
}

export function bottomNav(actions) {
	return {
		tag: 'nav',
		attr: {
			class: 'geelooy-bottom-nav',
			'aria-label': 'Primary mobile navigation'
		},
		children: isIkarRoute()
			? ikarBottomNav(actions)
			: standardBottomNav(actions)
	};
}

/** Keeps Ikar mobile navigation centered on learning rather than publishing. */
function ikarBottomNav(actions) {
	return [
		link('/', '🏡 Home'),
		button('📚 Torah', null, actions.openTree),
		link('#living-path-search', '🔎 Search'),
		link('/profile', '👤 Profile')
	];
}

/** Preserves the full creator dock for ordinary Heichelos. */
function standardBottomNav(actions) {
	return [
		link('/', '🏡 Home'),
		button('🌳 Tree', null, actions.openTree),
		link(createHref(), '✍️ Create', 'is-create'),
		button('✉️ Inbox', null, actions.openMiniMail),
		link('/profile', '👤 Profile')
	];
}

function isIkarRoute() {
	return location.pathname === '/heichelos/ikar'
		|| location.pathname.startsWith('/heichelos/ikar/');
}

function createHref() {
	const id = location.pathname.match(/\/heichelos\/([^/?#]+)/)?.[1] || '';
	const query = new URLSearchParams({
		returnURL: location.pathname + location.search
	});
	if (id) query.set('heichel', decodeURIComponent(id));
	return `/heichelos/submit?${query}`;
}
