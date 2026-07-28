// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadMaterialContract.js
 * @description Binds six active road garments while preserving canonical yellow-brick provenance.
 * The Awtsmoos renews fieldstone, earth, moss, and softened grass along the traveler's way;
 * Awtsmoos.com keeps historic yellow brick as verified evidence without forcing a retired layer to stay.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';
import { bindMaterialStack } from '../materials/MaterialStackBinding.js';
import {
	MOUNTAIN_VILLAGE_SOURCES
} from '../materials/MountainVillageMaterialSources.js';
import { villageRoadStack } from '../materials/MountainVillageMaterialPresets.js';

const ROAD_ACTIVE_CAPACITY = 6;
const ROAD_PRIMARY_ROLE = 'road-fieldstone-center';
const ROAD_STACK = villageRoadStack();
const ROAD_PRIMARY_LAYER = requiredRoadLayer(ROAD_PRIMARY_ROLE);

export const ROAD_YELLOW_BRICK_URL = MOUNTAIN_VILLAGE_SOURCES.yellowBrick;

/**
 * Builds the active six-layer road material while retaining historic source evidence.
 *
 * @param {object|null} texture Optional decoded primary road image.
 * @returns {object} Road material fields and six-layer stack binding.
 */
export function roadMaterialFields(texture = null) {
	const fields = {
		anisotropy: 8,
		mapImage: validImage(texture)
			? texture
			: cachedTextureImage(ROAD_PRIMARY_LAYER.url),
		mapRepeat: ROAD_PRIMARY_LAYER.repeat,
		texturePolicy: {
			activeCapacity: ROAD_ACTIVE_CAPACITY,
			fallbackApplied: false,
			fullResolution: true,
			projection: 'world-planar-continuous-network',
			repeatMode: 'mirror-pingpong',
			role: 'road.mountainVillageCobble',
			shader: 'road-layered-six-stage-material-stack',
			tileWorld: REPEAT_HOOKS.roadTileWorld,
			yellowBrickCompatibilityUrl: ROAD_YELLOW_BRICK_URL
		},
		textureUrl: ROAD_PRIMARY_LAYER.url
	};
	const bound = bindMaterialStack(fields, ROAD_STACK, ROAD_ACTIVE_CAPACITY);

	return {
		...bound,
		texturePolicy: {
			...bound.texturePolicy,
			shader: fields.texturePolicy.shader
		}
	};
}

/**
 * Summarizes active road layers and the retained yellow-brick compatibility source.
 *
 * @param {object|null} texture Optional decoded primary road image.
 * @returns {object} Stable road material evidence.
 */
export function roadMaterialEvidence(texture = null) {
	const fields = roadMaterialFields(texture);
	const image = fields.mapImage;

	return {
		activeLayers: fields.textureLayers.length,
		anisotropy: fields.anisotropy,
		decoded: Boolean(image),
		fallbackApplied: fields.texturePolicy.fallbackApplied,
		fullResolution: fields.textureLayers.every((layer) => {
			return !/half-resolution|quarter-resolution|chai-forest-half/.test(layer.url);
		}),
		height: image?.naturalHeight || 0,
		logicalLayers: fields.materialStack.logicalLayerCount,
		role: fields.texturePolicy.role,
		url: fields.textureUrl,
		width: image?.naturalWidth || 0,
		yellowBrickCompatibilityUrl: ROAD_YELLOW_BRICK_URL
	};
}

function requiredRoadLayer(role) {
	const found = ROAD_STACK.layers.find((layer) => {
		return layer.role === role;
	});

	if (!found) {
		throw new Error(`Missing active road material role: ${role}`);
	}

	return found;
}

function validImage(image) {
	if (!image) {
		return false;
	}

	if (image.naturalWidth === undefined) {
		return true;
	}

	return image.naturalWidth > 0 && image.naturalHeight > 0;
}
