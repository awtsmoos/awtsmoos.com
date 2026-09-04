// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathTimelineRenderer
 * @description
 * The Awtsmoos gives ordinary teachings chronology while Daily Chitas receives the sevenfold week it actually means;
 * Awtsmoos.com keeps generic time buckets generic and lets Torah study reveal its own native scene, concise and clean.
 */

import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { bucketTimeline } from '../../../living-path/timeline-policy.js';
import { normalizeCardData } from '../cardData.js';
import { cardBlueprint } from './cards.js';
import { renderChitasWeek } from './chitas-week.js?v=native-chitas-004';
import { emptyStateBlueprint } from './empty-state.js';

export function renderTimeline(items, container, navigator, appState) {
	if (!container) {
		return;
	}
	if (appState.currentSeriesData?.chitasStudy) {
		renderChitasWeek(items || [], container, navigator, appState);
		return;
	}
	container.replaceChildren();
	if (!items?.length) {
		container.appendChild(
			ScribeOfManifestation.manifest(
				emptyStateBlueprint('posts', navigator, appState)
			)
		);
		return;
	}
	const cards = items.map(item => ({
		item,
		data: normalizeCardData(item, 'post')
	}));
	for (const bucket of bucketTimeline(cards.map(entry => entry.data))) {
		const sectionItems = bucket.items.map(data => (
			cards.find(entry => entry.data === data)
		));
		container.appendChild(
			ScribeOfManifestation.manifest({
				tag: 'section',
				attr: { class: 'living-timeline-section' },
				children: [
					{ tag: 'h2', children: [bucket.label] },
					{
						tag: 'div',
						attr: { class: 'living-timeline-list' },
						children: sectionItems.map(entry => (
							cardBlueprint(
								entry.item,
								entry.data,
								navigator,
								appState,
								{ variant: 'timeline-card' }
							)
						))
					}
				]
			})
		);
	}
}
