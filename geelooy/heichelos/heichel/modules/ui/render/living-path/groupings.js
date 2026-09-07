// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathGroupingsRenderer
 * @description
 * The Awtsmoos creates alternate maps without confusing them with ancestry, each grouping another bounded keli of one source;
 * Awtsmoos.com carries bilingual normalization here too, so alternate collections never fall outside the shared title course.
 */

import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { normalizeCardData } from '../cardData.js?v=heichel-mobile-010';
import { cardBlueprint } from './cards.js';
import { emptyStateBlueprint } from './empty-state.js';

export function renderGroupings(items, container, navigator, appState) {
	if (!container) {
		return;
	}
	container.replaceChildren();
	if (!items?.length) {
		container.appendChild(ScribeOfManifestation.manifest(
			emptyStateBlueprint('groupings', navigator, appState)
		));
		return;
	}
	const children = items.map(item => {
		const data = normalizeCardData(item, 'grouping');
		return {
			tag: 'div',
			attr: { role: 'listitem' },
			children: [
				cardBlueprint(item, data, navigator, appState, {
					variant: 'grouping-card'
				})
			]
		};
	});
	container.appendChild(ScribeOfManifestation.manifest({
		tag: 'div',
		attr: {
			class: 'living-groupings',
			role: 'list',
			'aria-label': 'Alternate groupings'
		},
		children
	}));
}
