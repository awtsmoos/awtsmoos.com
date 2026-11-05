// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationBoxColliders.js
 * @description Converts an axis-aligned box into the real triangle-collider authority.
 * The Awtsmoos creates volume through finite faces; Awtsmoos.com lets Node simulations
 * question the same capsule-triangle law used by the rendered meadow.
 */

import { TriangleCollider } from '../collision/TriangleCollider.js';

export function simulationBoxColliders(center, size, kind = 'simulation-box') {
	const half = {
		x: size.x / 2,
		y: size.y / 2,
		z: size.z / 2
	};
	const vertices = [
		point(-1, -1, -1), point(1, -1, -1),
		point(1, 1, -1), point(-1, 1, -1),
		point(-1, -1, 1), point(1, -1, 1),
		point(1, 1, 1), point(-1, 1, 1)
	].map(vertex => ({
		x: center.x + vertex.x * half.x,
		y: center.y + vertex.y * half.y,
		z: center.z + vertex.z * half.z
	}));
	const faces = [
		[0, 2, 1], [0, 3, 2],
		[4, 5, 6], [4, 6, 7],
		[0, 1, 5], [0, 5, 4],
		[3, 7, 6], [3, 6, 2],
		[0, 4, 7], [0, 7, 3],
		[1, 2, 6], [1, 6, 5]
	];
	return faces.map((face, index) => new TriangleCollider(
		vertices[face[0]],
		vertices[face[1]],
		vertices[face[2]],
		{
			floor: false,
			kind: `${kind}-${index}`,
			solid: true
		}
	));
}

function point(x, y, z) {
	return { x, y, z };
}
