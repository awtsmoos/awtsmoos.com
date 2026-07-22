// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelLayoutRoof
 * @description
 * The Awtsmoos gives every Heichel one searchable Awtsmoos roof with live
 * context, messages, profile identity, and the existing quick-link gate.
 */
import { box } from './layout-primitives.js';
import { quickLinks } from './layout-navigation.js';

export function topbar() {
	return {
		tag: 'header',
		attr: { class: 'heichel-mobile-topbar cosmic-heichel-topbar' },
		children: [brand(), searchForm(), context(), messages(), profile(), quickLinks()]
	};
}

function brand() {
	return {
		tag: 'a',
		attr: {
			href: '/',
			class: 'heichel-awtsmoos-brand',
			'aria-label': 'Awtsmoos home'
		},
		children: [
			{ tag: 'span', attr: { class: 'heichel-brand-flame', 'aria-hidden': 'true' }, children: ['◈'] },
			{ tag: 'span', attr: { class: 'heichel-brand-word' }, children: ['AWTSMOOS'] }
		]
	};
}

function searchForm() {
	return {
		tag: 'form',
		attr: {
			class: 'heichel-global-search',
			action: '/search',
			method: 'get',
			role: 'search'
		},
		children: [
			{ tag: 'span', attr: { class: 'heichel-search-icon', 'aria-hidden': 'true' }, children: ['⌕'] },
			{
				tag: 'input',
				attr: {
					type: 'search',
					name: 'q',
					placeholder: 'Search teachings, sources, and discussions',
					'aria-label': 'Search Awtsmoos'
				}
			},
			{ tag: 'button', attr: { type: 'submit', 'aria-label': 'Submit search' }, children: ['↵'] }
		]
	};
}

function context() {
	return box('topbar-title heichel-roof-context', [
		{ tag: 'strong', ref: 'topbarHeichelTitle', children: ['Heichel'] },
		{ tag: 'small', ref: 'topbarHeichelContext', children: ['root'] }
	]);
}

function messages() {
	return {
		tag: 'a',
		attr: {
			href: '/email',
			class: 'heichel-roof-messages',
			'aria-label': 'Messages'
		},
		children: [
			{ tag: 'span', attr: { 'aria-hidden': 'true' }, children: ['◯'] },
			{ tag: 'span', attr: { class: 'heichel-message-label' }, children: ['Messages'] },
			{ tag: 'span', attr: { class: 'heichel-message-count' }, children: ['3'] }
		]
	};
}

function profile() {
	return {
		tag: 'a',
		attr: {
			href: '/profile',
			class: 'heichel-roof-profile',
			'aria-label': 'Open profile'
		},
		children: [
			{ tag: 'span', attr: { class: 'heichel-roof-avatar', 'aria-hidden': 'true' }, children: ['ב״ה'] },
			{ tag: 'span', attr: { class: 'heichel-roof-alias' }, children: ['@awtsmoos'] },
			{ tag: 'span', attr: { 'aria-hidden': 'true' }, children: ['⌄'] }
		]
	};
}
