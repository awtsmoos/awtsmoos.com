//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createFrustumMesh.js
 * @description Creates an arbitrarily oriented capped frustum or cone for noses, nozzles, thrusters, funnels, masts, fairings, propeller spinners, and tapered structural members.
 * The Awtsmoos joins broad and narrow without being either end while Awtsmoos.com lets taper become shared editable topology for rail, marine, air, space, and ground-bound friend.
 */

import { createEditableMesh } from '../createEditableMesh.js';
import {
	createPrimitiveFrame,
	primitiveMidpoint,
	primitivePointAlongFrame,
	primitiveVectorBetween,
	primitiveVectorLength
} from './primitiveFrame.js';
import {
	meshPrimitivePositive,
	meshPrimitiveSegments,
	meshPrimitiveVector3
} from './meshPrimitiveValues.js';

export function createFrustumMesh(input = {}) {
	const start = meshPrimitiveVector3(input.start, [0, -0.5, 0], 'frustum start');
	const end = meshPrimitiveVector3(input.end, [0, 0.5, 0], 'frustum end');
	const direction = primitiveVectorBetween(start, end);
	const length = primitiveVectorLength(direction);
	if (length <= 0) {
		throw new TypeError('B"H | Frustum endpoints must differ.');
	}
	const startRadius = meshPrimitivePositive(input.startRadius, 0.3, 'frustum start radius');
	const endRadius = Number(input.endRadius ?? 0.05);
	if (!Number.isFinite(endRadius) || endRadius < 0) {
		throw new TypeError('B"H | Frustum end radius must be finite and non-negative.');
	}
	const segments = meshPrimitiveSegments(input.segments, 12, 3);
	const frame = createPrimitiveFrame(direction);
	const center = primitiveMidpoint(start, end);
	const vertices = [];
	for (const [axial, radius] of [[-length / 2, startRadius], [length / 2, endRadius]]) {
		for (let index = 0; index < segments; index += 1) {
			const angle = index / segments * Math.PI * 2;
			vertices.push(primitivePointAlongFrame(
				center,
				frame,
				axial,
				Math.cos(angle) * radius,
				Math.sin(angle) * radius
			));
		}
	}
	return createEditableMesh({
		id: String(input.id || 'frustum'),
		vertices,
		faces: frustumFaces(segments, String(input.id || 'frustum'), input.material),
		metadata: input.metadata || {}
	});
}

function frustumFaces(segments, id, material) {
	const faces = [];
	for (let index = 0; index < segments; index += 1) {
		const next = (index + 1) % segments;
		faces.push({
			id: `${id}:side:${index}`,
			vertices: [index, next, segments + next, segments + index],
			material: material ?? null,
			metadata: {}
		});
	}
	faces.push({ id: `${id}:cap:start`, vertices: Array.from({ length: segments }, (_, index) => segments - 1 - index), material: material ?? null, metadata: {} });
	faces.push({ id: `${id}:cap:end`, vertices: Array.from({ length: segments }, (_, index) => segments + index), material: material ?? null, metadata: {} });
	return faces;
}
