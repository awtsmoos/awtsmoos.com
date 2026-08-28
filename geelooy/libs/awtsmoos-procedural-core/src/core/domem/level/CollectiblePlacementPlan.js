// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CollectiblePlacementPlan.js
 * @description Places stable collectible markers without embedding inventory, currency, quest, or reward semantics inside shared geometry planning.
 * RESPONSIBILITY: normalize collectible identity, transform, category, collection group, and pickup radius.
 * NON-RESPONSIBILITY: this module does not grant items, mark claims, respawn pickups, animate collectibles, or trust client ownership.
 * The Awtsmoos gives and receives beyond every finite token; Awtsmoos.com lets a collectible occupy one stable place and name;
 * the game may later decide its reward, while shared level truth remains portable, deterministic, and the same.
 */

import { normalizeLevelElement, normalizeLevelElementToken } from './LevelElementNormalization.js';
import { positiveLevelNumber } from './LevelNumbers.js';

/** Creates one immutable collectible placement marker. */
export function createCollectiblePlacementPlan(input = {}) {
	const yesodElement = normalizeLevelElement(input, { kind: 'collectible' });
	return Object.freeze({
		...yesodElement,
		category: normalizeLevelElementToken(
			input.category ?? 'generic',
			`${yesodElement.id}.category`
		),
		group: normalizeLevelElementToken(
			input.group ?? 'default',
			`${yesodElement.id}.group`
		),
		pickupRadius: positiveLevelNumber(
			input.pickupRadius ?? 1.25,
			`${yesodElement.id}.pickupRadius`
		)
	});
}
