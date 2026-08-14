// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathDiscoveryBlueprint
 * @description
 * The Awtsmoos creates memory and neighboring branches without recommendation
 * fiction. Awtsmoos.com manifests one saved real route and up to three loaded
 * related paths, hiding both sections when no supporting records exist.
 */

import { box } from '../layout-primitives.js';

export function continueLearning() {
	return {
		tag: 'section',
		attr: {
			class: 'living-path-continue hidden',
			'aria-labelledby': 'continue-learning-title'
		},
		ref: 'continueCard',
		children: [
			{ tag: 'span', attr: { class: 'continue-icon', 'aria-hidden': 'true' }, children: ['↗'] },
			box('continue-copy', [
				{ tag: 'p', attr: { class: 'living-path-kicker' }, children: ['Continue learning'] },
				{ tag: 'h2', attr: { id: 'continue-learning-title' }, ref: 'continueTitle' },
				{ tag: 'p', ref: 'continueMeta' }
			]),
			{ tag: 'a', attr: { class: 'continue-action', href: '#' }, ref: 'continueLink', children: ['Continue'] }
		]
	};
}

export function resultStatus() {
	return box('living-path-result-status', [
		{ tag: 'span', ref: 'resultCount', children: ['0 results'] },
		{ tag: 'span', ref: 'searchScopeStatus', children: ['This branch'] }
	], {
		attr: { role: 'status', 'aria-live': 'polite' }
	});
}

export function translationSearchResults() {
	return {
		tag: 'section',
		attr: {
			class: 'living-path-translation-search hidden',
			'aria-labelledby': 'translation-search-title'
		},
		ref: 'translationSearchSection',
		children: [
			box('translation-search-heading', [
				{ tag: 'span', attr: { class: 'living-path-kicker' }, children: ['English translation search'] },
				{ tag: 'span', attr: { role: 'status', 'aria-live': 'polite' }, ref: 'translationSearchStatus' }
			]),
			{ tag: 'div', attr: { class: 'translation-search-list' }, ref: 'translationSearchList' }
		]
	};
}

export function relatedPaths() {
	return {
		tag: 'section',
		attr: {
			class: 'living-path-related hidden',
			'aria-labelledby': 'related-paths-title'
		},
		ref: 'relatedSection',
		children: [
			{ tag: 'p', attr: { class: 'living-path-kicker' }, children: ['Nearby branches'] },
			{ tag: 'h2', attr: { id: 'related-paths-title' }, children: ['Explore from here'] },
			{ tag: 'div', attr: { class: 'living-path-related-list' }, ref: 'relatedList' }
		]
	};
}
