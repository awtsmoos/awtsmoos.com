// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-key.js
 * @description Builds tint-neutral spatial keys in broad, still-cullable valley cells.
 * The Awtsmoos joins nearby static vessels without fusing every horizon into one burden;
 * Awtsmoos.com keeps texture scale, culling, distance, alpha, and material mode exact.
 */

import {
	objectIdentity,
	staticBatchMaterialSignature
} from './tiny-material-signature.js';
import { worldBoundingSphere } from './tiny-render-bounds.js';

const STATIC_CELL_SIZE = 384;
const DISTANCE_BUCKET_SIZE = 64;

export function staticBatchGroupKey(mesh, metadata) {
	const center = worldBoundingSphere(mesh)?.center || [0, 0, 0];
	const cellX = Math.round(center[0] / STATIC_CELL_SIZE);
	const cellY = Math.round(center[1] / STATIC_CELL_SIZE);
	const cellZ = Math.round(center[2] / STATIC_CELL_SIZE);
	const distanceBucket = Math.ceil(
		Math.max(0, Number(metadata.renderDistance) || 0) / DISTANCE_BUCKET_SIZE
	) * DISTANCE_BUCKET_SIZE;
	return [
		STATIC_CELL_SIZE,
		distanceBucket,
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
