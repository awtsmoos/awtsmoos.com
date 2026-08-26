// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialMapBinding.js
 * @description Governs procedural-map replacement, texture transforms, and mutable runtime evidence without weakening immutable material contracts.
 * RESPONSIBILITY: prepare public map images, recognize replaceable fallbacks, attach cached maps immutably, and mark runtime evidence only where writable.
 * NON-RESPONSIBILITY: this module does not load URLs, bind layered slots, or traverse scenes.
 * The Awtsmoos clothes one surface through changing garments while essence stays beyond the seam; Awtsmoos.com lets a real image replace a fallback only through a truthful mutable keli in the stream.
 */

import {
	cachedTextureImage,
	isUsableMaterialImage
} from './PublicMaterialCacheState.js';

/**
 * Returns an immutable material copy with a cached real map when available.
 * @param {object} material Source material definition.
 * @param {string} url Requested texture URL.
 * @returns {object} Original material or an updated copy.
 */
export function attachCachedTexture(material, url) {
	const image = cachedTextureImage(url);
	if (!image) {
		return material;
	}
	const current = material.mapImage;
	const shouldBind = !isUsableMaterialImage(current)
		|| replaceablePublicMapImage(material, current);
	if (!shouldBind) {
		return {
			...material,
			textureUrl: url
		};
	}
	const prepared = preparePublicMapImage(material, image);
	if (!prepared) {
		return material;
	}
	return {
		...material,
		mapImage: prepared,
		mapImageFallback: false,
		textureUrl: url
	};
}

/** Applies a material-owned hydration transform without leaking transform failures. */
export function preparePublicMapImage(material, image) {
	const transform = material?.texturePolicy?.hydrateMapImage;
	if (typeof transform !== 'function') {
		return image;
	}
	try {
		const prepared = transform(image);
		return isUsableMaterialImage(prepared) ? prepared : null;
	} catch {
		return null;
	}
}

/** Returns whether the current map is an explicit replaceable procedural fallback. */
export function replaceablePublicMapImage(material, image) {
	return material?.mapImageFallback === true
		|| material?.texturePolicy?.proceduralFallbackActive === true
		|| image?.dataset?.replaceableByPublicTexture === 'true';
}

/** Marks mutable map evidence after a real image is successfully bound. */
export function markRealPublicMapImage(object, material) {
	writeIfMutable(material, 'mapImageFallback', false);
	writeEvidence(material?.texturePolicy);
	writeEvidence(material?.userData?.AwtsmoosForestMaterial);
	writeEvidence(object?.userData?.AwtsmoosForestLayer);
}

/**
 * Marks one mutable evidence object as carrying a real runtime map.
 * @param {object|null|undefined} evidence Optional mutable evidence holder.
 * @returns {void}
 */
function writeEvidence(evidence) {
	if (!evidence || Object.isFrozen(evidence)) {
		return;
	}
	evidence.realMapImage = true;
	if ('proceduralFallbackActive' in evidence) {
		evidence.proceduralFallbackActive = false;
	}
	if ('proceduralFallback' in evidence) {
		evidence.proceduralFallback = false;
	}
}

/**
 * Writes one evidence property only when the target object remains mutable.
 * @param {object|null|undefined} holder Candidate evidence holder.
 * @param {string} key Property name.
 * @param {*} value Property value.
 * @returns {boolean} Whether the write completed.
 */
function writeIfMutable(holder, key, value) {
	if (!holder || Object.isFrozen(holder)) {
		return false;
	}
	holder[key] = value;
	return true;
}
