// B"H
import { h } from './render.js';
import { TopNav } from './TopNav.js';
import { NotificationDigest } from './NotificationDigest.js';

/**
 * @module AppShell
 * @description
 * Malchus places the social experience inside one explicit `.awtsmoos-social-root`
 * boundary. The shell owns layout composition only; navigation and notification
 * renderers remain independent so neither can leak styling or lifecycle concerns.
 */
export function AppShell(malchusMainChildren = [], binahOptions = {}) {
	return h('div', { class: 'awtsmoos-social-root' }, [
		h('div', { class: 'awt-shell' }, [
			TopNav(binahOptions),
			h('div', { class: 'awt-grid awt-layout' }, [
				leftRail(binahOptions),
				h('main', { class: 'awt-main' }, malchusMainChildren),
				rightRail(binahOptions)
			])
		])
	]);
}

/** @param {object} binahOptions @returns {object} Primary local navigation rail. */
function leftRail(binahOptions = {}) {
	return h('aside', { class: 'awt-rail left', 'aria-label': 'Social navigation' }, [
		h('a', { class: 'awt-chip', href: '#feed' }, ['Feed']),
		h('a', { class: 'awt-chip', href: '#composer' }, ['Create']),
		h('a', { class: 'awt-chip', href: '/heichelos' }, ['Heichelos']),
		h('button', {
			class: 'awt-chip awt-link-button',
			type: 'button',
			onclick: binahOptions.onRefresh
		}, ['Refresh'])
	]);
}

/** @param {object} binahOptions @returns {object} Notification rail. */
function rightRail(binahOptions = {}) {
	return h('aside', { class: 'awt-rail right', 'aria-label': 'Social signals' }, [
		NotificationDigest(binahOptions.notifications || {})
	]);
}
