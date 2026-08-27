// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-material-signature.js
 * @description Caches exact full and static-batch draw signatures until observed state changes.
 * The Awtsmoos joins equal vessels without repeating their entire decree; Awtsmoos.com preserves
 * color, culling, native texture density, ecology, wind, and primitive truth with bounded CPU work.
 */

import {
	captureMaterialSignatureState,
	sameMaterialSignatureState
} from './tiny-material-signature-state.js';
import { appendTextureSignature } from './tiny-material-texture-signature.js';
import { textureState } from './tiny-texture-state.js';

const cache = new WeakMap();
const objectIds = new WeakMap();
const diagnostics = { hits: 0, invalidations: 0, misses: 0 };
let nextObjectId = 1;

export function materialSignature(mesh) {
	return cachedSignatures(mesh).full;
}

export function staticBatchMaterialSignature(mesh) {
	return cachedSignatures(mesh).batch;
}

export function materialSignatureCacheDiagnostics() {
	return { ...diagnostics };
}

export function objectIdentity(object) {
	if (!object || typeof object !== 'object') return 0;
	if (!objectIds.has(object)) {
		objectIds.set(object, nextObjectId);
		nextObjectId += 1;
	}
	return objectIds.get(object);
}

function cachedSignatures(mesh) {
	const textures = textureState(mesh.material || {});
	const cached = cache.get(mesh);
	if (cached && sameMaterialSignatureState(cached.observed, mesh, textures)) {
		diagnostics.hits += 1;
		return cached;
	}
	if (cached) diagnostics.invalidations += 1;
	else diagnostics.misses += 1;
	const observed = captureMaterialSignatureState(mesh, textures);
	const signatures = Object.freeze({
		batch: buildSignature(observed, false),
		full: buildSignature(observed, true),
		observed
	});
	cache.set(mesh, signatures);
	return signatures;
}

function buildSignature(state, includeColor) {
	const values = [];
	if (includeColor) values.push(state.color0, state.color1, state.color2);
	values.push(
		state.opacity,
		state.alphaMode,
		state.alphaCutoff,
		surfaceSidedness(state),
		state.emissiveStrength,
		state.materialMode
	);
	appendTextureSignature(values, state.textureState, objectIdentity);
	values.push(
		state.anisotropy,
		state.grassReactive ? 1 : 0,
		state.grassRadius,
		state.grassWind,
		state.geometryMode
	);
	return values.join('|');
}

function surfaceSidedness(state) {
	if (state.doubleSided) return 'double-sided';
	if (state.cullingDisabled) return 'culling-disabled';
	return 'backface-culling';
}
