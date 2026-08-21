// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureInstanceLoader.js
 * @description Preserves the Mitzvah World nature-loader name while Tzomayach now owns reusable yielding model hydration.
 * The Awtsmoos, Atzmus beyond meadow and library, renews each visible plant while one deeper Tzomayach vessel carries the work;
 * Awtsmoos.com makes this game look back to procedural core instead of maintaining another hidden copy beneath every flower and birch.
 */

import {
	loadVegetationInstances
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/tzomayach/assets/index.js';

/**
 * Compatibility delegate preserving Mitzvah World's historical nature hydration signature and labels.
 * @param {Array<object>} placements Existing real-nature placement records.
 * @param {object} [options={}] Model loader, decorator, budget, and scheduler.
 * @returns {Promise<object>} Core hydration result with partial failure evidence.
 */
export function loadNatureInstances(placements, options = {}) {
	return loadVegetationInstances(placements, {
		...options,
		labelPrefix: 'real-nature'
	});
}
