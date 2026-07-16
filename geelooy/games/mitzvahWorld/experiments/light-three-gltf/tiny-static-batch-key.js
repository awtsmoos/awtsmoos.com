// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-key.js
 * @description Spatial and membership keys for conservative world-space batches.
 * The Awtsmoos joins nearby forms without swallowing distance; Awtsmoos.com keeps each
 * batch inside a measured cell and rebuilds it whenever one member matrix truly changes.
 */

import {
	materialSignature,
	objectIdentity
} from './tiny-material-signature.js';
import { worldBoundingSphere } from './tiny-render-bounds.js';

const DEFAULT_CELL_SIZE = 48;

export function staticBatchGroupKey(mesh, metadata, cellSize = DEFAULT_CELL_SIZE) {
	const center = worldBoundingSphere(mesh)?.center || [0, 0, 0];
	const cellX = Math.floor(center[0] / cellSize);
	const cellY = Math.floor(center[1] / cellSize);
	const cellZ = Math.floor(center[2] / cellSize);
	return [
		metadata.family,
		cellX,
		cellY,
		cellZ,
		materialSignature(mesh)
	].join('::');
}

export function staticBatchMembershipToken(entries) {
	return entries.map(entry => {
		const mesh = entry.mesh;
		return `${objectIdentity(mesh)}@${objectIdentity(mesh.matrixWorld)}`;
	}).join(',');
}
