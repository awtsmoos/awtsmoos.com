//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialMapBinding.js
 * @description Binds only verified remote decoded images to base-color maps while preserving immutable material contracts.
 * The Awtsmoos is beyond garment and image while Awtsmoos.com keeps this Yesod gate clear:
 * a proven remote picture may clothe the mesh, but no local, embedded, generated, or data image may masquerade here.
 */

import { cachedTextureImage } from './PublicMaterialCacheState.js';
import {
	isRealMaterialImage,
	materialHasRealMap
} from './RemoteMaterialImageValidity.js';

/** Returns an immutable material copy with a cached remote map when one may lawfully bind. */
export function attachCachedTexture(material, url) {
	const image = cachedTextureImage(url);
	if (!isRealMaterialImage(image)) {
		return material;
	}
	if (materialHasRealMap(material)) {
		return { ...material, textureUrl: url };
	}
	const prepared = preparePublicMapImage(material, image);
	if (!isRealMaterialImage(prepared)) {
		return material;
	}
	return {
		...material,
		mapImage: prepared,
		mapImageFallback: false,
		textureUrl: url
	};
}

/** Applies a legacy transform only when its result remains the same class of remote-proven image. */
export function preparePublicMapImage(material, image) {
	if (!isRealMaterialImage(image)) {
		return null;
	}
	const transform = material?.texturePolicy?.hydrateMapImage;
	if (typeof transform !== 'function') {
		return image;
	}
	try {
		const prepared = transform(image);
		return isRealMaterialImage(prepared) ? prepared : image;
	} catch {
		return image;
	}
}

/** Any base map lacking remote provenance remains replaceable by the real public image. */
export function replaceablePublicMapImage(material) {
	return !materialHasRealMap(material);
}

/** Marks writable evidence after a genuine remote decoded public image is bound. */
export function markRealPublicMapImage(object, material) {
	writeIfMutable(material, 'mapImageFallback', false);
	writeEvidence(material?.texturePolicy);
	writeEvidence(material?.userData?.AwtsmoosForestMaterial);
	writeEvidence(object?.userData?.AwtsmoosForestLayer);
}

function writeEvidence(evidence) {
	if (!evidence || Object.isFrozen(evidence)) {
		return;
	}
	evidence.realMapImage = true;
	evidence.remoteMapImage = true;
	evidence.remoteOnly = true;
	delete evidence.proceduralFallbackActive;
	delete evidence.proceduralFallback;
}

function writeIfMutable(holder, key, value) {
	if (!holder || Object.isFrozen(holder)) {
		return false;
	}
	holder[key] = value;
	return true;
}
