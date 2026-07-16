// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadMaterialContract.js
 * @description Binds ten cobble, stone, brick, earth, moss, grass, mud, and dust road layers.
 * The Awtsmoos renews every traveled stone and softened seam; Awtsmoos.com keeps one continuous
 * collision network while capable hardware reveals all ten full-source road garments together.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';
import { bindMaterialStack } from '../materials/MaterialStackBinding.js';
import { villageRoadStack } from '../materials/MountainVillageMaterialPresets.js';

const ROAD_STACK = villageRoadStack();
const YELLOW_BRICK_LAYER = ROAD_STACK.layers.find(layer => layer.role === 'road-yellow-brick');
export const ROAD_YELLOW_BRICK_URL = YELLOW_BRICK_LAYER.url;

export function roadMaterialFields(texture = null) {
	const primary = ROAD_STACK.layers[0];
	const fields = {
		anisotropy: 8,
		mapImage: validImage(texture) ? texture : cachedTextureImage(primary.url),
		mapRepeat: primary.repeat,
		texturePolicy: {
			fallbackApplied: false,
			fullResolution: true,
			projection: 'world-planar-continuous-network',
			repeatMode: 'mirror-pingpong',
			role: 'road.mountainVillageCobble',
			tileWorld: REPEAT_HOOKS.roadTileWorld
		},
		textureUrl: primary.url
	};
	return bindMaterialStack(fields, ROAD_STACK, 10);
}

export function roadMaterialEvidence(texture = null) {
	const fields = roadMaterialFields(texture);
	const image = fields.mapImage;
	return {
		activeLayers: fields.textureLayers.length,
		anisotropy: fields.anisotropy,
		decoded: Boolean(image),
		fallbackApplied: fields.texturePolicy.fallbackApplied,
		fullResolution: fields.textureLayers.every(layer => {
			return !/half-resolution|quarter-resolution|chai-forest-half/.test(layer.url);
		}),
		height: image?.naturalHeight || 0,
		logicalLayers: fields.materialStack.logicalLayerCount,
		role: fields.texturePolicy.role,
		url: fields.textureUrl,
		width: image?.naturalWidth || 0
	};
}

function validImage(image) {
	if (!image) return false;
	if (image.naturalWidth === undefined) return true;
	return image.naturalWidth > 0 && image.naturalHeight > 0;
}
