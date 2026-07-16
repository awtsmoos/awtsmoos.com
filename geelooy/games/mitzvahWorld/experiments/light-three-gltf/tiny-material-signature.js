// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-material-signature.js
 * @description Builds exact draw signatures and tint-neutral static-batch signatures.
 * The Awtsmoos preserves every visible tint even when it moves into vertex color; Awtsmoos.com
 * ignores only that algebraically baked factor while maps, layers, glow, grass, and modes stay exact.
 */

import { layeredTextureSignature } from './tiny-layered-texture-state.js';
import { materialModeCode } from './tiny-render-webgl-utils.js';

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
	const mapRepeat = material.mapRepeat || [1, 1];
	const mixRepeat = material.mixRepeat || [1, 1];
	const grass = mesh.userData?.AwtsmoosYardGrass || {};
	const values = [];
	if (includeColor) values.push(
		color[0] ?? 0.75,
		color[1] ?? 0.70,
		color[2] ?? 0.62
	);
	values.push(
		material.opacity ?? color[3] ?? 1,
		material.alphaMode || 'OPAQUE',
		material.alphaCutoff ?? 0.5,
		surfaceSidedness(material),
		material.emissiveStrength ?? 1.8,
		materialModeCode(mesh),
		objectId(material.mapImage), mapRepeat[0], mapRepeat[1],
		objectId(material.mixImage), mixRepeat[0], mixRepeat[1],
		material.mixStrength ?? 0,
		material.mixPatchScale ?? 0,
		material.mixPatchSharpness ?? 0.58,
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
