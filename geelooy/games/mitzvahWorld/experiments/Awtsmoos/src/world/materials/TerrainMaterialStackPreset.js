// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialStackPreset.js
 * @description Builds sixteen real alpine ground layers with ten high-priority active garments.
 * The Awtsmoos reveals meadow as many grasses, transitions, earth, mud, rock, forest, and shore;
 * Awtsmoos.com decorrelates real full-source maps instead of painting one repeated green shortcut.
 */

import { materialStackRecipe } from './MaterialStackRecipe.js';
import { presetLayer as layer } from './MaterialPresetLayer.js';
import {
	MOUNTAIN_VILLAGE_FAMILIES as F,
	MOUNTAIN_VILLAGE_SOURCES as S
} from './MountainVillageMaterialSources.js';

export function mountainTerrainStack() {
	const grass = F.grass;
	const transition = F.grassTransitions;
	return materialStackRecipe('mountain-terrain', {
		fallbackColor: [0.31, 0.34, 0.20, 1],
		layers: [
			meadow('meadow-source-grass', grass[0], 100, [29, 27], 0.34),
			meadow('meadow-grass-one', grass[1], 99, [21, 25], 0.28),
			meadow('meadow-grass-four', grass[2], 98, [34, 30], 0.24),
			meadow('meadow-dry-grass', grass[4], 97, [27, 32], 0.22),
			meadow('meadow-wet-grass', grass[7], 96, [19, 23], 0.27),
			meadow('meadow-dirt-grass-one', transition[0], 95, [18, 20], 0.34),
			meadow('meadow-dirt-grass-two', transition[1], 94, [23, 19], 0.31),
			layer('worn-earth', S.dirt, {
				priority: 93,
				repeat: [17, 19],
				slope: [0, 0.62],
				strength: 0.48,
				zones: [1, 0.25, 0.22, 0.18]
			}),
			layer('stream-bank-mud', S.mud, {
				priority: 92,
				repeat: [15, 18],
				slope: [0, 0.48],
				strength: 0.56,
				wetness: 0.9,
				zones: [0.18, 1, 1, 0]
			}),
			layer('mountain-stone', S.stone, {
				priority: 91,
				repeat: [11, 14],
				slope: [0.22, 1],
				strength: 0.78,
				zones: [0.05, 0, 0, 1]
			}),
			meadow('meadow-grass-five', grass[3], 90, [25, 28], 0.2),
			meadow('meadow-grass-seven', grass[5], 89, [31, 26], 0.19),
			meadow('meadow-grass-eight', grass[6], 88, [22, 35], 0.18),
			meadow('meadow-dirt-grass-three', transition[2], 87, [20, 24], 0.28),
			layer('forest-leaf-floor', F.forest[1], {
				priority: 86,
				repeat: [14, 17],
				slope: [0, 0.64],
				strength: 0.52,
				zones: [0.08, 0, 0, 1]
			}),
			layer('shore-sand', S.sand, {
				priority: 85,
				repeat: [18, 22],
				slope: [0, 0.34],
				strength: 0.5,
				wetness: 0.18,
				zones: [0, 1, 1, 0]
			})
		]
	});
}

function meadow(role, url, priority, repeat, strength) {
	return layer(role, url, {
		priority,
		repeat,
		slope: [0, 0.52],
		strength,
		zones: [1, 0.03, 0, 0.16]
	});
}
