// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadMaterialStackPreset.js
 * @description Builds ten active road garments from stone, cobble, soil, moss, grass, mud, and dust.
 * The Awtsmoos renews every traveled center and softened edge; Awtsmoos.com mixes multiple
 * full-source cobbles and transitions without splitting one continuous collision road into objects.
 */

import { materialStackRecipe } from './MaterialStackRecipe.js';
import { presetLayer as layer } from './MaterialPresetLayer.js';
import {
	MOUNTAIN_VILLAGE_FAMILIES as F,
	MOUNTAIN_VILLAGE_SOURCES as S
} from './MountainVillageMaterialSources.js';

export function villageRoadStack() {
	return materialStackRecipe('village-road', {
		fallbackColor: [0.31, 0.27, 0.21, 1],
		layers: [
			road('road-fieldstone', S.fieldstone, 100, [9, 10], 0.64),
			road('road-cobblestone', F.stone[3], 99, [12, 11], 0.46),
			road('road-yellow-brick', S.yellowBrick, 98, [14, 12], 0.27),
			road('road-stone-floor', F.stone[4], 97, [15, 13], 0.3),
			road('road-worn-dirt', F.earth[1], 96, [17, 19], 0.43),
			road('road-dirt-grass', F.grassTransitions[1], 95, [19, 17], 0.34),
			road('road-wet-mud', S.mud, 94, [14, 16], 0.48, 0.82),
			road('road-leaf-moss', F.forest[0], 93, [20, 18], 0.3),
			road('road-grass-joints', F.grass[5], 92, [25, 23], 0.24),
			road('road-pale-dust', S.sand, 91, [22, 20], 0.26)
		]
	});
}

function road(role, url, priority, repeat, strength, wetness = 0) {
	return layer(role, url, {
		priority,
		repeat,
		slope: [0, 0.55],
		strength,
		wetness,
		zones: [1, wetness > 0 ? 0.58 : 0.18, wetness > 0 ? 0.64 : 0.18, 0.06]
	});
}
