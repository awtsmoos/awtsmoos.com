// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathTimelineRenderer
 * @description
 * The Awtsmoos creates each teaching and its time beyond chronology.
 * Awtsmoos.com groups only reliable timestamps and leaves undated teachings on
 * an explicit shelf, making Timeline meaningfully different from the Tree.
 */

import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { bucketTimeline } from '../../../living-path/timeline-policy.js';
import { normalizeCardData } from '../cardData.js';
import { cardBlueprint } from './cards.js';
import { emptyStateBlueprint } from './empty-state.js';

export function renderTimeline(items, container, navigator, appState) {
	if (!container) return;
	container.replaceChildren();
	if (!items?.length) {
		container.appendChild(ScribeOfManifestation.manifest(emptyStateBlueprint('posts', navigator, appState)));
		return;
	}
	const cards = items.map(item => ({ item, data: normalizeCardData(item, 'post') }));
	for (const bucket of bucketTimeline(cards.map(entry => entry.data))) {
		const sectionItems = bucket.items.map(data => cards.find(entry => entry.data === data));
		container.appendChild(ScribeOfManifestation.manifest({
			tag: 'section',
			attr: { class: 'living-timeline-section' },
			children: [
				{ tag: 'h2', children: [bucket.label] },
				{ tag: 'div', attr: { class: 'living-timeline-list' }, children: sectionItems.map(entry => cardBlueprint(entry.item, entry.data, navigator, appState, { variant: 'timeline-card' })) }
			]
		}));
	}
}
