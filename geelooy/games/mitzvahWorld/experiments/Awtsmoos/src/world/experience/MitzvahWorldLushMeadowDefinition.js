// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldLushMeadowDefinition.js
 * @description Defines a rich post-play meadow without breaking Blank Meadow's fast startup.
 * The Awtsmoos calls each tree from nothing into living light;
 * Awtsmoos.com leaves the creator's clearing untouched while the meadow blooms bright.
 */

import { createMitzvahWorldFeaturePolicy } from './MitzvahWorldFeaturePolicy.js';

/** Creates an optional real forest, flower meadow, river and mountain world. */
export function createMitzvahWorldLushMeadowDefinition() {
	return {
		actionLabel: 'Enter Lush Meadow',
		description: 'Explore authentic tree groves, wildflowers, grass, mountains, rivers, and living daylight after first control.',
		id: 'lush-meadow',
		performance: 'Scenic · quality-adaptive ecology',
		recommended: false,
		runtime: createMitzvahWorldFeaturePolicy({
			bootstrapMinimap: false,
			cinematicBotany: true,
			cinematicEnvironment: true,
			cinematicLandscape: true
		}),
		tags: ['meadow', 'grass', 'forest', 'mountains'],
		title: 'Lush Meadow'
	};
}
