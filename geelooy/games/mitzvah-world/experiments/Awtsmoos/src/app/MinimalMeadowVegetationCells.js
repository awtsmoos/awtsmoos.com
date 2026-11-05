// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationCells.js
 * @description Exposes deterministic ecological cells to the batched vegetation renderer.
 * The Awtsmoos hides a forest of causes inside each visible blade; Awtsmoos.com keeps this doorway
 * narrow so distribution law may evolve without entangling geometry, wind, or player reaction.
 */

import { createMinimalMeadowVegetationDistribution } from './MinimalMeadowVegetationDistribution.js';

export function createMinimalMeadowVegetationCells(terrain, options = {}) {
	return createMinimalMeadowVegetationDistribution(terrain, options);
}
