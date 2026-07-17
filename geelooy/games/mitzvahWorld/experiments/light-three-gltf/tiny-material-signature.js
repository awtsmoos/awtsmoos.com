// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-material-signature.js
 * @description Builds exact draw signatures including resolved native texture density.
 * The Awtsmoos unites compatible vessels without confusing their physical scale; Awtsmoos.com
 * keeps differently measured pixels apart before and after asynchronous image hydration.
 */

import { layeredTextureSignature } from './tiny-layered-texture-state.js';
import { nativeTexturePolicySignature } from './tiny-native-texture-density.js';
import { materialModeCode } from './tiny-render-webgl-utils.js';
import { textureState } from './tiny-texture-state.js';

const objectIds = new WeakMap();
let nextObjectId = 1;

export function materialSignature(mesh) {
	return signature(mesh, true);
}

export function staticBatchMaterialSignature(mesh) {
	return signature(mesh, false);
}

function signature(mesh, includeColor) {
	const material = mesh.material || {};
	const color = material.color || [0.75, 0.70, 0.62, 1];
	const state = textureState(material);
	const grass = mesh.userData?.AwtsmoosYardGrass || {};
	const values = [];
	if (includeColor) {
		values.push(color[0] ?? 0.75, color[1] ?? 0.70, color[2] ?? 0.62);
	}
	values.push(
		material.opacity ?? color[3] ?? 1,
		material.alphaMode || 'OPAQUE',
		material.alphaCutoff ?? 0.5,
		surfaceSidedness(material),
		material.emissiveStrength ?? 1.8,
		materialModeCode(mesh),
		objectId(state.mapImage), state.mapRepeat0, state.mapRepeat1,
		objectId(state.mixImage), state.mixRepeat0, state.mixRepeat1,
		...nativeTexturePolicySignature(material.texturePolicy),
		...nativeTexturePolicySignature({
			...(material.texturePolicy || {}),
			...(material.mixTexturePolicy || {})
		}),
		state.mixStrength,
		state.patchScale,
		state.patchSharpness,
		...layeredTextureSignature(material, objectId),
		material.anisotropy ?? 2,
		grass.reactsToPlayer ? 1 : 0,
		grass.interactionRadius ?? 2.2,
		grass.windStrength ?? 0.085,
		mesh.geometry?.mode ?? mesh.primitiveMode ?? 4
	);
	return values.join('|');
}

function surfaceSidedness(material) {
	if (material.doubleSided === true) return 'double-sided';
	if (material.backfaceCull === false) return 'culling-disabled';
	return 'backface-culling';
}

export function objectIdentity(object) {
	return objectId(object);
}

function objectId(object) {
	if (!object || typeof object !== 'object') return 0;
	if (!objectIds.has(object)) {
		objectIds.set(object, nextObjectId);
		nextObjectId += 1;
	}
	return objectIds.get(object);
}
