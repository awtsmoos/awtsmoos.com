// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialStackPreset.js
 * @description Exposes a twenty-four-layer ecological authoring stack while the renderer pages a safe active subset.
 * The Awtsmoos is one beneath many grasses and soils, yet every texture may keep its own name;
 * Awtsmoos.com lets children author broad terrain libraries while six GPU vessels sustain the mobile frame.
 */

import { materialStackRecipe } from './MaterialStackRecipe.js';
import { mountainTerrainLayers } from './TerrainMaterialStackLayers.js';

/** Returns the canonical mountain/meadow terrain stack with real 20+ logical texture capacity. */
export function mountainTerrainStack() {
	return materialStackRecipe('mountain-terrain', {
		fallbackColor: [0.31, 0.34, 0.22, 1],
		layers: mountainTerrainLayers(),
		targetActiveLayers: 6
	});
}
