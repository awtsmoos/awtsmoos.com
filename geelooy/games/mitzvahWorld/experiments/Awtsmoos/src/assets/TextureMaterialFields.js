// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureMaterialFields.js
 * @description Builds material texture fields and familiar repeat aliases from exact coverage helpers.
 * The Awtsmoos joins color, source, projection, and measured repetition in one readable garment;
 * Awtsmoos.com keeps material assembly apart from density mathematics so each vessel stays ardent.
 */

import { repeatFromPixels } from './TextureExactRepeat.js';
import { publicUrl, textureSize } from './TextureImageMetrics.js';

export function materialTexture(
	color,
	image,
	repeat = [1, 1],
	options = {}
) {
	const plan = options.densityPlan || null;

	return {
		anisotropy: plan?.anisotropy ?? options.anisotropy ?? 2,
		color,
		doubleSided: Boolean(options.doubleSided),
		mapImage: image || null,
		mapRepeat: [...repeat],
		texturePolicy: {
			densityPlan: plan,
			fullResolution: true,
			nativeTexelDensity: true,
			originalPixels: textureSize(image),
			projection: options.projection || 'cube-world',
			repeat: [...repeat],
			shaderWrap: 'mirror-pingpong-repeat'
		},
		textureUrl: publicUrl(image)
	};
}

export function wallRepeat(width, height, image, options) {
	return repeatFromPixels(width, height, image, 96, [1, 1], options);
}

export const floorRepeat = wallRepeat;
export const roofRepeat = wallRepeat;
export const roadRepeat = wallRepeat;

export function terrainRepeat(size, image, options) {
	return repeatFromPixels(size, size, image, 56, [1, 1], options);
}

export const mixRepeat = terrainRepeat;
