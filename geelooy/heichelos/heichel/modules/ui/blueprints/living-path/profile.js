// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathProfileBlueprint
 * @description
 * The Awtsmoos creates Heichel identity and Torah content in one present.
 * Awtsmoos.com keeps seal, name, and the Heichel's own description visible
 * in the hero — a Heichel is known by its description, so it never hides —
 * while counters and actions rest inside a native disclosure that never
 * blocks learning.
 */

import { box, button, link } from '../layout-primitives.js';
import { pendingHeichelIdentity } from '../pending-route-context.js';

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
			addAction(),
			details(actions),
			profileTabs()
		]
	};
}

function identity() {
	const pending = pendingHeichelIdentity();
	return box('heichel-profile-identity', [
		{ tag: 'div', attr: { class: 'heichel-seal', 'aria-hidden': 'true' }, children: ['ב״ה'] },
		box('heichel-profile-copy', [
			box('heichel-profile-title-row', [
				{ tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle', children: [pending.title] },
				{ tag: 'span', attr: { class: 'heichel-verification', title: 'Verified Heichel' }, children: ['✓'] }
			]),
			{ tag: 'p', attr: { class: 'heichel-profile-compact-context' }, ref: 'profileCompactContext', children: [pending.context] },
			{ tag: 'p', attr: { class: 'hero-description' }, ref: 'heichelDescription' }
		])
	]);
}

function addAction() {
	// B"H 2026-11-26 (owner-aware upload): the add action stands OUTSIDE
	// the details disclosure, visible at first light — never buried. It
	// renders in a safe generic state that already carries the Heichel
	// and the series the visitor is standing in; the living-path
	// add-action resolver then upgrades it in place once verified
	// identity + destination access resolve: owner (Add, posting as the
	// Heichel's own alias), contributor (Submit for review), signed-out
	// (Sign in, returning to this page). One composer, one entrance.
	const heichelId = pendingHeichelIdentity().heichelId;
	const openSeries = (location.pathname.match(/\/series\/([^/]+)/) || [])[1] || 'root';
	const composerHref = heichelId
		? `/social-composer/?heichel=${encodeURIComponent(heichelId)}&series=${encodeURIComponent(openSeries)}`
		: '/social-composer/';
	return {
		tag: 'a',
		attr: {
			id: 'heichelAddAction',
			class: 'heichel-add-action',
			href: composerHref,
			'data-state': 'generic'
		},
		children: ['＋ Create post']
	};
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
	// B"H 2026-11-26 (owner-aware upload): no second create entry hides
	// in this row — the prominent add action above the disclosure is
	// the single entrance to the one composer (see addAction()).
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
