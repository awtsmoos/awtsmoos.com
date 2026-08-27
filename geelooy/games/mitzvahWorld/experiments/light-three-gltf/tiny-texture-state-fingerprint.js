// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-texture-state-fingerprint.js
 * @description Observes every base, mix, policy, and layer fact that can alter shader texture state.
 * The Awtsmoos renews original images while their physical law remains precise; Awtsmoos.com
 * detects hydration and authored mutation without allocating a second complete state every draw.
 */

import {
	capturePair,
	capturePolicy,
	captureSourceFingerprint,
	samePair,
	samePolicy,
	sameSourceFingerprint
} from './tiny-texture-state-fingerprint-core.js';
import {
	captureLayerFingerprints,
	sameLayerFingerprints
} from './tiny-texture-layer-fingerprint.js';

export function captureTextureFingerprint(material = {}) {
	return {
		layers: captureLayerFingerprints(material),
		mapImage: captureSourceFingerprint(material.mapImage),
		mapPolicy: capturePolicy(material.texturePolicy),
		mapRepeat: capturePair(material.mapRepeat, [1, 1]),
		mixImage: captureSourceFingerprint(material.mixImage),
		mixPolicy: capturePolicy(material.mixTexturePolicy),
		mixRepeat: capturePair(material.mixRepeat, [1, 1]),
		mixStrength: numberOr(material.mixStrength, 0),
		patchScale: numberOr(material.mixPatchScale, 0),
		patchSharpness: numberOr(material.mixPatchSharpness, 0.58)
	};
}

export function sameTextureFingerprint(fingerprint, material = {}) {
	return Boolean(fingerprint)
		&& fingerprint.mixStrength === numberOr(material.mixStrength, 0)
		&& fingerprint.patchScale === numberOr(material.mixPatchScale, 0)
		&& fingerprint.patchSharpness === numberOr(material.mixPatchSharpness, 0.58)
		&& sameSourceFingerprint(fingerprint.mapImage, material.mapImage)
		&& sameSourceFingerprint(fingerprint.mixImage, material.mixImage)
		&& samePair(fingerprint.mapRepeat, material.mapRepeat, [1, 1])
		&& samePair(fingerprint.mixRepeat, material.mixRepeat, [1, 1])
		&& samePolicy(fingerprint.mapPolicy, material.texturePolicy)
		&& samePolicy(fingerprint.mixPolicy, material.mixTexturePolicy)
		&& sameLayerFingerprints(fingerprint.layers, material);
}

function numberOr(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
