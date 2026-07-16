// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-key.js
 * @description Builds family-aware spatial and membership keys for conservative batches.
 * The Awtsmoos joins nearby forms without swallowing the valley; Awtsmoos.com grants
 * large cottages a broader cell while smaller props retain precise culling boundaries.
 */

import {
	materialSignature,
	objectIdentity
} from './tiny-material-signature.js';
import { worldBoundingSphere } from './tiny-render-bounds.js';

const DEFAULT_CELL_SIZE = 48;
const FAMILY_CELL_SIZES = Object.freeze({
	'reference-village-cottage-roof': 96,
	'reference-village-district': 96
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
		materialSignature(mesh)
	].join('::');
}

export function staticBatchMembershipToken(entries) {
	return entries.map((entry) => {
		const mesh = entry.mesh;
		return `${objectIdentity(mesh)}@${objectIdentity(mesh.matrixWorld)}`;
	}).join(',');
}
