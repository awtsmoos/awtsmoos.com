// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-key.js
 * @description Builds tint-neutral family-aware spatial keys for conservative static batches.
 * The Awtsmoos joins nearby forms without erasing their colors; Awtsmoos.com bakes tint into
 * vertices while maps, layered `mix()` state, material mode, and culling remain exact boundaries.
 */

import {
	objectIdentity,
	staticBatchMaterialSignature
} from './tiny-material-signature.js';
import { worldBoundingSphere } from './tiny-render-bounds.js';

const DEFAULT_CELL_SIZE = 64;
const FAMILY_CELL_SIZES = Object.freeze({
	'functional-house': 128,
	'procedural-text-landmark': 96,
	'reference-arrival-composition': 128,
	'reference-cottage-detail-batch': 128,
	'reference-cottage-ornament-batch': 128,
	'reference-practical-lighting': 128,
	'reference-village-cottage-roof': 144,
	'reference-village-district': 144,
	'reference-village-landmark': 128,
	'village-bushes': 96,
	'village-garden-bed': 96,
	'village-static-props': 128
});

export function staticBatchGroupKey(mesh, metadata, cellSize = null) {
	const resolvedCellSize = cellSize || FAMILY_CELL_SIZES[metadata.family] || DEFAULT_CELL_SIZE;
	const center = worldBoundingSphere(mesh)?.center || [0, 0, 0];
	const cellX = Math.floor(center[0] / resolvedCellSize);
	const cellY = Math.floor(center[1] / resolvedCellSize);
	const cellZ = Math.floor(center[2] / resolvedCellSize);
	return [
		metadata.family,
		resolvedCellSize,
		cellX,
		cellY,
		cellZ,
		staticBatchMaterialSignature(mesh)
	].join('::');
}

export function staticBatchMembershipToken(entries) {
	return entries.map(entry => {
		const mesh = entry.mesh;
		return `${objectIdentity(mesh)}@${objectIdentity(mesh.matrixWorld)}`;
	}).join(',');
}
