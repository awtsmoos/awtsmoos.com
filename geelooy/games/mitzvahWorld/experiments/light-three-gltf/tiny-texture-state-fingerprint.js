// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-texture-state-fingerprint.js
 * @description Observes base, mix, terrain-quality, policy, and layer facts that alter GPU state.
 * The Awtsmoos renews original images while every mixing covenant stays precise;
 * Awtsmoos.com detects one changed vector without rebuilding every texture twice.
 */

import {
	capturePair,
	capturePolicy,
	captureSourceFingerprint,
	captureVector,
	samePair,
	samePolicy,
	sameSourceFingerprint,
	sameVector
} from './tiny-texture-state-fingerprint-core.js';
import { captureLayerFingerprints, sameLayerFingerprints } from './tiny-texture-layer-fingerprint.js';
import { terrainMixingDefaults } from './tiny-terrain-mixing-state.js';

export function captureTextureFingerprint(material = {}) {
	const defaults = terrainMixingDefaults();
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
		patchSharpness: numberOr(material.mixPatchSharpness, 0.58),
		terrainA: captureVector(material.terrainMixingA, 4, defaults.a),
		terrainB: captureVector(material.terrainMixingB, 4, defaults.b),
		terrainC: captureVector(material.terrainMixingC, 4, defaults.c)
	};
}

export function sameTextureFingerprint(fingerprint, material = {}) {
	const defaults = terrainMixingDefaults();
	return Boolean(fingerprint)
		&& fingerprint.mixStrength === numberOr(material.mixStrength, 0)
		&& fingerprint.patchScale === numberOr(material.mixPatchScale, 0)
		&& fingerprint.patchSharpness === numberOr(material.mixPatchSharpness, 0.58)
		&& sameVector(fingerprint.terrainA, material.terrainMixingA, defaults.a)
		&& sameVector(fingerprint.terrainB, material.terrainMixingB, defaults.b)
		&& sameVector(fingerprint.terrainC, material.terrainMixingC, defaults.c)
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
