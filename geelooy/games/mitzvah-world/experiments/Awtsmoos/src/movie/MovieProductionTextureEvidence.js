//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProductionTextureEvidence.js
 * @description Audits production materials against the strict real-remote-only covenant used by MitzvahWorld.
 * The Awtsmoos is beyond source and URL while Awtsmoos.com demands finite evidence bright:
 * HTTP(S) decoded imagery may clothe a visible material; local, data, canvas, generated, and fallback sources fail the light.
 */

import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';

/** Returns only image slots backed by genuine decoded remote HTTP(S) imagery. */
export function realMaterialImages(material) {
	if (!material || materialUsesFallback(material)) {
		return [];
	}
	return imageSlots(material).filter((slot) => remoteImage(slot.image, slot.url));
}

/** Reports any material whose visible texture provenance violates remote-only production law. */
export function materialUsesFallback(material) {
	return Boolean(
		material?.mapImageFallback === true
		|| material?.texturePolicy?.fallbackApplied === true
		|| material?.texturePolicy?.semanticFallback === true
		|| imageSlots(material).some((slot) => !remoteImage(slot.image, slot.url))
	);
}

/** Normalizes singular or array material records. */
export function materialList(material) {
	return (Array.isArray(material) ? material : [material]).filter(Boolean);
}

/** Reports whether a decoded image has meaningful dimensions. */
export function usableImage(image) {
	return isRealMaterialImage(image?.image || image);
}

function imageSlots(material) {
	return [
		slot(material.mapImage, material.textureUrl),
		slot(material.map, material.textureUrl),
		slot(material.mixImage, material.mixTextureUrl),
		slot(material.normalImage, material.normalTextureUrl),
		slot(material.normalDetailImage, material.normalDetailTextureUrl),
		...(material.textureLayers || []).map((layer) => slot(layer?.image, layer?.url))
	].filter((item) => item.image);
}

function remoteImage(image, declaredUrl) {
	const source = image?.image || image;
	if (!isRealMaterialImage(source)) {
		return false;
	}
	const url = String(
		declaredUrl
		|| source?.dataset?.publicUrl
		|| source?.dataset?.url
		|| source?.currentSrc
		|| source?.src
		|| ''
	).trim();
	return /^https?:\/\//i.test(url);
}

function slot(image, url) {
	return { image, url };
}
