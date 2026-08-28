//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCylinderMesh.js
 * @description Creates one arbitrarily oriented capped cylinder mesh for axles, masts, pipes, propeller hubs, rail wheels, thrusters, tanks, antennas, and structural members.
 * The Awtsmoos joins two endpoints beyond line or circle while Awtsmoos.com lets a finite cylinder become editable polygon law shared by ground, sea, air, rail, and stars above.
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

export function createCylinderMesh(input = {}) {
	const start = meshPrimitiveVector3(input.start, [0, -0.5, 0], 'cylinder start');
	const end = meshPrimitiveVector3(input.end, [0, 0.5, 0], 'cylinder end');
	const direction = primitiveVectorBetween(start, end);
	const length = primitiveVectorLength(direction);
	if (length <= 0) {
		throw new TypeError('B"H | Cylinder endpoints must differ.');
	}
	const radius = meshPrimitivePositive(input.radius, 0.25, 'cylinder radius');
	const segments = meshPrimitiveSegments(input.segments, 12, 3);
	const frame = createPrimitiveFrame(direction);
	const center = primitiveMidpoint(start, end);
	const vertices = [];
	for (const axial of [-length / 2, length / 2]) {
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
	const faces = cylinderFaces(segments, String(input.id || 'cylinder'), input.material);
	return createEditableMesh({
		id: String(input.id || 'cylinder'),
		vertices,
		faces,
		metadata: input.metadata || {}
	});
}

function cylinderFaces(segments, id, material) {
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
	faces.push({
		id: `${id}:cap:start`,
		vertices: Array.from({ length: segments }, (_, index) => segments - 1 - index),
		material: material ?? null,
		metadata: {}
	});
	faces.push({
		id: `${id}:cap:end`,
		vertices: Array.from({ length: segments }, (_, index) => segments + index),
		material: material ?? null,
		metadata: {}
	});
	return faces;
}
