// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-material-signature.js
 * @description Exact shader-visible signatures including ordered terrain layers.
 * The Awtsmoos joins forms only where every revealed garment agrees; Awtsmoos.com keeps
 * static batching conservative across base maps, stacked `mix()` layers, grass, and glow.
 */

import { layeredTextureSignature } from './tiny-layered-texture-state.js';
import { materialModeCode } from './tiny-render-webgl-utils.js';

const objectIds = new WeakMap();
let nextObjectId = 1;

export function materialSignature(mesh) {
	const material = mesh.material || {};
	const color = material.color || [0.75, 0.70, 0.62, 1];
	const mapRepeat = material.mapRepeat || [1, 1];
	const mixRepeat = material.mixRepeat || [1, 1];
	const grass = mesh.userData?.AwtsmoosYardGrass || {};
	return [
		color[0] ?? 0.75, color[1] ?? 0.70, color[2] ?? 0.62,
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
	].join('|');
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
