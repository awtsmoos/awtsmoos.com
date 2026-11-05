//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LavaMaterialDefinitions.js
 * @description Defines renderer-neutral appearance descriptors and remote-image provenance for the lava challenge.
 * Materials remain semantic data here; native material construction stays delegated through shared primitive rendering.
 */

/**
 * Creates the burning-sea appearance descriptor.
 * @param {object} [assets={}] Optional hydrated lava image vessel.
 * @returns {object} Primitive material descriptor.
 */
export function createLavaMaterial(assets = {}) {
	const image = assets.lavaImage || null;
	return {
		color: '#ff3512',
		mapImage: image,
		mapRepeat: [18, 7],
		textureUrl: lavaTextureUrl(image)
	};
}

/**
 * Creates the red-brick appearance descriptor shared by solid course platforms.
 * @param {object} [assets={}] Optional hydrated brick image vessels.
 * @returns {object} Primitive material descriptor.
 */
export function createLavaBrickMaterial(assets = {}) {
	const image = assets.redBrickImage
		|| assets.redBrick2Image
		|| assets.brickImage
		|| null;
	return {
		color: '#f47a55',
		mapImage: image,
		mapRepeat: [2.4, 2.4],
		textureUrl: lavaTextureUrl(image)
	};
}

/**
 * Resolves one hydrated image vessel back to its public source URL when available.
 * @param {HTMLImageElement|object|null} image Optional image-like vessel.
 * @returns {string|null} Public source URL or null when no authored image is present.
 */
export function lavaTextureUrl(image) {
	return image?.dataset?.url
		|| image?.dataset?.publicUrl
		|| image?.src
		|| null;
}
