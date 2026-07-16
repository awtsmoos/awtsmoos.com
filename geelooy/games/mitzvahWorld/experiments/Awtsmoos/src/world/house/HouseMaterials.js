// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseMaterials.js
 * @description Assigns distinct masonry, timber, roof, fence, door, and mezuzah texture pairs.
 * The Awtsmoos renews each cottage as fieldstone foundation, pale infill, weathered side wall,
 * dark frame, tiled roof, bark-aged door, oak fence, iron, and warm gold—not one generic surface.
 */

import {
	materialTexture,
	REPEAT_HOOKS
} from '../../assets/TextureRepeat.js';
import { bindMaterialPair } from '../materials/MaterialStackBinding.js';
import { cottageSurfaceStack } from '../materials/MountainVillageMaterialPresets.js';

export function createHouseMaterials(assets = {}) {
	const layers = Object.fromEntries(
		cottageSurfaceStack().layers.map(layer => [layer.role, layer])
	);
	return {
		wall: pair('#d8d0bf', assets.whiteBrickImage, REPEAT_HOOKS.wallTileWorld,
			layers['cottage-fieldstone'], layers['cottage-limestone']),
		side: pair('#cfc5b2', assets.brickImage, REPEAT_HOOKS.wallTileWorld,
			layers['cottage-white-brick'], layers['cottage-weathered-brick']),
		stone: pair('#9f9687', assets.stoneImage, REPEAT_HOOKS.floorTileWorld,
			layers['cottage-fieldstone'], layers['cottage-limestone']),
		door: pair('#5a3422', assets.woodImage, 2,
			layers['cottage-timber'], layers['cottage-bark-trim']),
		roof: pair('#5b4436', assets.woodImage, REPEAT_HOOKS.roofTileWorld,
			layers['cottage-roof'], layers['cottage-roof-small-tile']),
		fence: pair('#6a4b33', assets.woodImage, 2,
			layers['cottage-timber'], layers['cottage-oak-variation']),
		mezuza: pair('#b78a2f', assets.goldImage || assets.woodImage, 0.5,
			layers['cottage-gold'], layers['cottage-iron'])
	};
}

function pair(color, image, tileWorld, primary, secondary) {
	const fields = materialTexture(color, image, [1, 1], {
		anisotropy: 8,
		backfaceCull: true,
		hook: 'modular-house-physical-pair',
		projection: 'cube-world',
		tileWorld
	});
	return bindMaterialPair(fields, primary, secondary);
}
