// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-texture-state.js
 * @description Reuses exact native-density and terrain-mixing state until observed material facts change.
 * The Awtsmoos renews image, ecology, and physical scale without waste; Awtsmoos.com
 * lets hydration and authored terrain law invalidate only the vessel that changed in place.
 */

import { layeredTextureState, sameLayeredTextureState } from './tiny-layered-texture-state.js';
import { nativeTexturePolicySignature, resolveNativeTextureRepeat } from './tiny-native-texture-density.js';
import { sourceReady } from './tiny-texture-source.js';
import { captureTextureFingerprint, sameTextureFingerprint } from './tiny-texture-state-fingerprint.js';
import { sameTerrainMixingState, terrainMixingState } from './tiny-terrain-mixing-state.js';

const cache = new WeakMap();
const diagnostics = { hits: 0, invalidations: 0, misses: 0 };

export function textureState(material = {}) {
	if (!material || typeof material !== 'object') return buildTextureState({});
	const cached = cache.get(material);
	if (cached && sameTextureFingerprint(cached.fingerprint, material)) {
		diagnostics.hits += 1;
		return cached.state;
	}
	if (cached) diagnostics.invalidations += 1;
	else diagnostics.misses += 1;
	const state = buildTextureState(material);
	cache.set(material, { fingerprint: captureTextureFingerprint(material), state });
	return state;
}

export function invalidateTextureState(material) {
	return Boolean(material && typeof material === 'object') && cache.delete(material);
}

export function textureStateCacheDiagnostics() {
	return { ...diagnostics };
}

export function sameTextureState(left, right) {
	if (left === right) return true;
	if (!left || !right) return false;
	return left.mapImage === right.mapImage
		&& left.mapReady === right.mapReady
		&& left.mapRepeat0 === right.mapRepeat0
		&& left.mapRepeat1 === right.mapRepeat1
		&& left.mixImage === right.mixImage
		&& left.mixReady === right.mixReady
		&& left.mixRepeat0 === right.mixRepeat0
		&& left.mixRepeat1 === right.mixRepeat1
		&& left.mixStrength === right.mixStrength
		&& left.patchScale === right.patchScale
		&& left.patchSharpness === right.patchSharpness
		&& sameTerrainMixingState(left.terrainMixing, right.terrainMixing)
		&& sameLayeredTextureState(left.layers, right.layers);
}

function buildTextureState(material) {
	const mapRepeat = resolveNativeTextureRepeat(
		material.mapImage,
		material.mapRepeat || [1, 1],
		material.texturePolicy
	);
	const mixPolicy = {
		...(material.texturePolicy || {}),
		...(material.mixTexturePolicy || {})
	};
	const mixRepeat = resolveNativeTextureRepeat(
		material.mixImage,
		material.mixRepeat || [1, 1],
		material.texturePolicy,
		material.mixTexturePolicy
	);
	return Object.freeze({
		layers: layeredTextureState(material),
		mapImage: material.mapImage || null,
		mapPolicySignature: nativeTexturePolicySignature(material.texturePolicy),
		mapReady: sourceReady(material.mapImage),
		mapRepeat0: mapRepeat[0],
		mapRepeat1: mapRepeat[1],
		mixImage: material.mixImage || null,
		mixPolicySignature: nativeTexturePolicySignature(mixPolicy),
		mixReady: sourceReady(material.mixImage),
		mixRepeat0: mixRepeat[0],
		mixRepeat1: mixRepeat[1],
		mixStrength: material.mixStrength ?? 0,
		patchScale: material.mixPatchScale ?? 0,
		patchSharpness: material.mixPatchSharpness ?? 0.58,
		terrainMixing: terrainMixingState(material)
	});
}
