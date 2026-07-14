// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLayoutShell
 * @description
 * The topbar and identity hero form one readable shell above navigation and content.
 */

import {
	box,
	link
} from './layout-primitives.js';
import { quickLinks } from './layout-navigation.js';

export function topbar() {
	return {
		tag: 'header',
		attr: { class: 'heichel-mobile-topbar' },
		children: [
			link('/', '🏡', 'topbar-icon topbar-home-gate', 'Home'),
			box('topbar-title', [
				{
					tag: 'strong',
					ref: 'topbarHeichelTitle',
					children: ['📚 Browse']
				},
				{
					tag: 'small',
					ref: 'topbarHeichelContext',
					children: ['Choose a series']
				}
			]),
			quickLinks()
		]
	};
}

export function hero() {
	return {
		tag: 'section',
		attr: {
			class: 'geelooy-heichel-hero',
			'aria-labelledby': 'heichel-main-title'
		},
		children: [
			box('heichel-hero-copy', [
				{
					tag: 'div',
					attr: {
						class: 'heichel-seal',
						'aria-hidden': 'true'
					},
					children: ['🏛️']
				},
				{
					tag: 'p',
					attr: { class: 'hero-kicker' },
					children: ['Current Heichel']
				},
				{
					tag: 'h1',
					attr: { id: 'heichel-main-title' },
					ref: 'mainTitle'
				},
				{
					tag: 'p',
					attr: { class: 'hero-description' },
					ref: 'heichelDescription'
				}
			]),
			box(
				'hero-stats',
				['About', 'Heichelos', 'Series', 'Posts'].map(label => ({
					tag: 'span',
					children: [label]
				})),
				{
					attr: { 'aria-label': 'Collection areas' }
				}
			)
		]
	};
}
