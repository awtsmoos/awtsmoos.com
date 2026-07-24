// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathProfileBlueprint
 * @description
 * The Awtsmoos creates Heichel identity and Torah content in one present.
 * Awtsmoos.com keeps seal, name, and essential actions visible while placing
 * description and counters inside a native disclosure that never blocks learning.
 */

import { box, button, link } from '../layout-primitives.js';

export function profileBlueprint(actions) {
	return {
		tag: 'section',
		attr: {
			class: 'geelooy-heichel-hero cosmic-heichel-profile living-path-profile',
			'aria-labelledby': 'heichel-main-title',
			'data-heichel-profile': 'true'
		},
		children: [
			{ tag: 'div', attr: { class: 'heichel-profile-cover', 'aria-hidden': 'true' } },
			identity(),
			details(actions),
			profileTabs()
		]
	};
}

function identity() {
	return box('heichel-profile-identity', [
		{ tag: 'div', attr: { class: 'heichel-seal', 'aria-hidden': 'true' }, children: ['ב״ה'] },
		box('heichel-profile-copy', [
			box('heichel-profile-title-row', [
				{ tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle' },
				{ tag: 'span', attr: { class: 'heichel-verification', title: 'Verified Heichel' }, children: ['✓'] }
			]),
			{ tag: 'p', attr: { class: 'heichel-profile-compact-context' }, ref: 'profileCompactContext', children: ['Living Heichel'] }
		])
	]);
}

function details(actions) {
	return {
		tag: 'details',
		attr: { class: 'heichel-profile-details' },
		ref: 'profileDetails',
		events: { toggle: actions.profileDisclosureChanged },
		children: [
			{ tag: 'summary', children: ['View Heichel details'] },
			box('heichel-profile-details-body', [
				{ tag: 'p', attr: { class: 'hero-description' }, ref: 'heichelDescription' },
				stats(),
				actionsRow(actions)
			])
		]
	};
}

function stats() {
	return box('hero-stats heichel-profile-stats', [
		stat('posts', 'Teachings'),
		stat('series', 'Series'),
		stat('followers', 'Followers')
	], { attr: { 'aria-label': 'Heichel statistics' } });
}

function stat(key, label) {
	return box('heichel-profile-stat', [
		{ tag: 'strong', attr: { 'data-heichel-profile-count': key }, children: ['0'] },
		{ tag: 'small', children: [label] }
	], { tag: 'span' });
}

function actionsRow(actions) {
	return box('heichel-profile-actions', [
		button('Follow', 'Follow this Heichel', actions.toggleHeichelFollow, {
			class: 'heichel-profile-action heichel-profile-action--primary'
		}, 'heichelFollowButton'),
		link('/email', 'Message', 'heichel-profile-action'),
		button('•••', 'More Heichel actions', actions.openHeichelMenu, {
			class: 'heichel-profile-action heichel-profile-action--more'
		})
	]);
}

function profileTabs() {
	return {
		tag: 'nav',
		attr: { class: 'heichel-profile-tabs', 'aria-label': 'Heichel profile sections' },
		children: [
			link('#postsList', 'Posts'),
			link('#seriesList', 'Sources'),
			link('#seriesNameAndInfo', 'Series'),
			link('#heichel-world', 'About')
		]
	};
}
