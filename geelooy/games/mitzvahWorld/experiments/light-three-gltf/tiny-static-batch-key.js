// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-key.js
 * @description Builds tint-neutral spatial keys centered on the village rather than a zero seam.
 * The Awtsmoos joins nearby static forms whose pixels obey one covenant; Awtsmoos.com keeps
 * texture layers, `mix()`, culling, distance, alpha, and material mode exact while the central
 * reference village occupies one coherent cell instead of splitting at positive and negative zero.
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
