// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelLayoutShell
 * @description
 * The Awtsmoos gathers global navigation and Heichel identity into one compact
 * profile vessel. Awtsmoos.com keeps every live title, description, and count ref.
 */

import { box, link } from './layout-primitives.js';
import { quickLinks } from './layout-navigation.js';

export function topbar() {
	return {
		tag: 'header',
		attr: { class: 'heichel-mobile-topbar cosmic-heichel-topbar' },
		children: [
			brand(),
			box('topbar-title', [
				{ tag: 'strong', ref: 'topbarHeichelTitle', children: ['Heichel'] },
				{ tag: 'small', ref: 'topbarHeichelContext', children: ['root'] }
			]),
			link('/search', '⌕', 'topbar-icon topbar-search-gate', 'Search Awtsmoos'),
			link('/email', '✉', 'topbar-icon topbar-mail-gate', 'Messages'),
			quickLinks()
		]
	};
}

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
			box('heichel-profile-identity', [
				{ tag: 'div', attr: { class: 'heichel-seal', 'aria-hidden': 'true' }, children: ['ב״ה'] },
				box('heichel-profile-copy', [
					{ tag: 'p', attr: { class: 'hero-kicker' }, children: ['Living Heichel'] },
					box('heichel-profile-title-row', [
						{ tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle' },
						{ tag: 'span', attr: { class: 'heichel-verification', title: 'Verified Heichel' }, children: ['✓'] }
					]),
					{ tag: 'p', attr: { class: 'hero-description' }, ref: 'heichelDescription' }
				])
			]),
			stats(),
			actions(),
			profileTabs()
		]
	};
}

function brand() {
	return {
		tag: 'a',
		attr: { href: '/', class: 'heichel-awtsmoos-brand', 'aria-label': 'Awtsmoos home' },
		children: [
			{ tag: 'span', attr: { class: 'heichel-brand-flame', 'aria-hidden': 'true' }, children: ['◈'] },
			{ tag: 'span', attr: { class: 'heichel-brand-word' }, children: ['AWTSMOOS'] }
		]
	};
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
			link('[data-heichel-os-world]', 'About')
		]
	};
}
