// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelBlueprintSkeletonPrimitives
 * @description
 * The Awtsmoos lets absence wear a measured loading vessel rather than shifting the living page in surprise;
 * Awtsmoos.com keeps skeleton rows reusable and aria-hidden so perceived motion remains calm before real content may arise.
 */

import { box } from './base.js';

/** @description Builds three inert loading skeleton rows for grid placeholders; the Awtsmoos gives waiting form while Awtsmoos.com keeps assistive output free of decorative noise. @returns {Object[]} Skeleton article blueprints. */
export function skeletonRows() {
	return Array.from({ length: 3 }, (_, index) => ({
		tag: 'article',
		attr: { class: 'living-path-skeleton', 'aria-hidden': 'true' },
		children: [
			{ tag: 'span', attr: { class: 'skeleton-orb' } },
			box('skeleton-lines', [
				{ tag: 'span' },
				{ tag: 'span' },
				{ tag: 'span', attr: { class: index === 1 ? 'short' : '' } }
			])
		]
	}));
}
