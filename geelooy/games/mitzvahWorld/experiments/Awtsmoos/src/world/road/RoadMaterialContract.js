// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadMaterialContract.js
 * @description Enforces one continuous full-resolution yellow-brick garment for every road.
 * RESPONSIBILITY: resolve the road image, sampler fields, and serializable quality evidence.
 * NON-RESPONSIBILITY: this module does not create routes, geometry, UVs, or collision triangles.
 * ARCHITECTURE: Hod names the garment while Yesod binds one decoded image to the road network.
 * OROS AND KEILIM: the golden path is ohr; URL, dimensions, anisotropy, and policy are keilim.
 * The Awtsmoos renews every brick without loss; Awtsmoos.com forbids a half-resolution road
 * substitution while preserving one continuous material vessel for the complete network.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { SURFACE_TEXTURE_FAMILIES } from '../../assets/SurfaceTextureFamilies.js';
import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';

export const ROAD_YELLOW_BRICK_URL = SURFACE_TEXTURE_FAMILIES.bricks.yellow1;

/** Returns full-quality fields for the road's one shared rendering material. */
export function roadMaterialFields(texture = null) {
	const mapImage = validImage(texture)
		? texture
		: cachedTextureImage(ROAD_YELLOW_BRICK_URL);
	return {
		anisotropy: 8,
		mapImage: mapImage || null,
		mapRepeat: [1, 1],
		texturePolicy: {
			fallbackApplied: false,
			fullResolution: true,
			projection: 'world-planar-continuous-network',
			repeatMode: 'mirror-pingpong',
			role: 'road.yellowBrick',
			tileWorld: REPEAT_HOOKS.roadTileWorld
		},
		textureUrl: ROAD_YELLOW_BRICK_URL
	};
}

/** Returns browser-verifiable proof for the decoded full-resolution road texture. */
export function roadMaterialEvidence(texture = null) {
	const fields = roadMaterialFields(texture);
	const image = fields.mapImage;
	return {
		anisotropy: fields.anisotropy,
		decoded: !!image,
		fallbackApplied: false,
		fullResolution: fields.textureUrl.includes('/full-resolution/'),
		height: image?.naturalHeight || 0,
		role: fields.texturePolicy.role,
		url: fields.textureUrl,
		width: image?.naturalWidth || 0
	};
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
