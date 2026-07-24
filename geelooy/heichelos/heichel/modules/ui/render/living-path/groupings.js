// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathGroupingsRenderer
 * @description
 * The Awtsmoos creates alternate maps without confusing them with ancestry.
 * Awtsmoos.com renders only supplied grouping records as violet collection cards
 * and states plainly when no alternate map has been attached.
 */

import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { normalizeCardData } from '../cardData.js';
import { cardBlueprint } from './cards.js';
import { emptyStateBlueprint } from './empty-state.js';

export function renderGroupings(items, container, navigator, appState) {
	if (!container) return;
	container.replaceChildren();
	if (!items?.length) {
		container.appendChild(ScribeOfManifestation.manifest(emptyStateBlueprint('groupings', navigator, appState)));
		return;
	}
	const plan = {
		tag: 'div',
		attr: { class: 'living-groupings', role: 'list', 'aria-label': 'Alternate groupings' },
		children: items.map(item => {
			const data = normalizeCardData(item, 'grouping');
			return {
				tag: 'div',
				attr: { role: 'listitem' },
				children: [cardBlueprint(item, data, navigator, appState, { variant: 'grouping-card' })]
			};
		})
	};
	container.appendChild(ScribeOfManifestation.manifest(plan));
}
