// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-key.js
 * @description Builds spatial batch keys and hydration-sensitive refresh tokens.
 * The Awtsmoos joins fixed forms without freezing an empty garment; Awtsmoos.com rebuilds
 * a static village batch whenever real texture, tint, repeat, or shader-visible state arrives.
 */

import {
	materialSignature,
	objectIdentity,
	staticBatchMaterialSignature
} from './tiny-material-signature.js';
import { worldBoundingSphere } from './tiny-render-bounds.js';

const STATIC_CELL_SIZE = 384;
const DISTANCE_BUCKET_SIZE = 64;

export function staticBatchGroupKey(mesh, metadata) {
	const center = worldBoundingSphere(mesh)?.center || [0, 0, 0];
	const cell = center.map(value => Math.round(value / STATIC_CELL_SIZE));
	const distanceBucket = Math.ceil(
		Math.max(0, Number(metadata.renderDistance) || 0) / DISTANCE_BUCKET_SIZE
	) * DISTANCE_BUCKET_SIZE;
	return [
		STATIC_CELL_SIZE,
		distanceBucket,
		...cell,
		staticBatchMaterialSignature(mesh)
	].join('::');
}

export function staticBatchMembershipToken(entries) {
	return entries.map(entry => entryToken(entry)).join(',');
}

export function staticBatchSequenceToken(entries) {
	return entries.map(entry => [
		entryToken(entry),
		staticBatchGroupKey(entry.mesh, entry.metadata)
	].join('#')).join(',');
}

function entryToken(entry) {
	const mesh = entry.mesh;
	return [
		objectIdentity(mesh),
		objectIdentity(mesh.matrixWorld),
		materialSignature(mesh)
	].join('@');
}
