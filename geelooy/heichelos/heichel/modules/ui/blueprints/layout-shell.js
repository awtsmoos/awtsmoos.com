// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelLayoutShell
 * @description
 * The Awtsmoos gathers Heichel identity into one compact profile vessel while
 * live title, description, counters, actions, and section paths retain ownership.
 */
import { box, link } from './layout-primitives.js';
export { topbar } from './layout-roof.js';

export function hero() {
	return {
		tag: 'section',
		attr: {
			class: 'geelooy-heichel-hero cosmic-heichel-profile',
			'aria-labelledby': 'heichel-main-title',
			'data-heichel-profile': 'true'
		},
		children: [
			{ tag: 'div', attr: { class: 'heichel-profile-cover', 'aria-hidden': 'true' } },
			identity(),
			stats(),
			actions(),
			profileTabs()
		]
	};
}

function identity() {
	return box('heichel-profile-identity', [
		{ tag: 'div', attr: { class: 'heichel-seal', 'aria-hidden': 'true' }, children: ['ב״ה'] },
		box('heichel-profile-copy', [
			{ tag: 'p', attr: { class: 'hero-kicker' }, children: ['Living Heichel'] },
			box('heichel-profile-title-row', [
				{ tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle' },
				{ tag: 'span', attr: { class: 'heichel-verification', title: 'Verified Heichel' }, children: ['✓'] }
			]),
			{ tag: 'p', attr: { class: 'hero-description' }, ref: 'heichelDescription' }
		])
	]);
}

function stats() {
	return box('hero-stats heichel-profile-stats', [
		heroStat('posts', 'Teachings'),
		heroStat('series', 'Series'),
		heroStat('followers', 'Followers')
	], { attr: { 'aria-label': 'Heichel statistics' } });
}

function heroStat(key, label) {
	return {
		tag: 'span',
		attr: { class: 'heichel-profile-stat' },
		children: [
			{ tag: 'strong', attr: { 'data-heichel-profile-count': key }, children: ['0'] },
			{ tag: 'small', children: [label] }
		]
	};
}

function actions() {
	return box('heichel-profile-actions', [
		link('#postsList', 'Follow', 'heichel-profile-action heichel-profile-action--primary'),
		link('/email', 'Message', 'heichel-profile-action')
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
