//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEllipsoidMesh.js
 * @description Creates a standalone indexed ellipsoid or sphere for cabins, pressure vessels, domes, rotor hubs, submarines, capsules, satellites, balloons, and fictional craft shells.
 * The Awtsmoos surrounds every finite surface without being enclosed while Awtsmoos.com lets three radii reveal smooth editable form for earth, sea, sky, and star-bound road.
 */

import { createEditableMesh } from '../createEditableMesh.js';
import {
	meshPrimitiveSegments,
	meshPrimitiveVector3
} from './meshPrimitiveValues.js';

export function createEllipsoidMesh(input = {}) {
	const center = meshPrimitiveVector3(input.center, [0, 0, 0], 'ellipsoid center');
	const radii = meshPrimitiveVector3(input.radii, [0.5, 0.5, 0.5], 'ellipsoid radii');
	if (!radii.every(value => value > 0)) {
		throw new TypeError('B"H | Ellipsoid radii must be positive.');
	}
	const rings = meshPrimitiveSegments(input.rings, 10, 3);
	const segments = meshPrimitiveSegments(input.segments, 20, 6);
	const vertices = [];
	for (let ring = 0; ring <= rings; ring += 1) {
		const latitude = ring / rings * Math.PI;
		for (let segment = 0; segment < segments; segment += 1) {
			const longitude = segment / segments * Math.PI * 2;
			vertices.push([
				center[0] + Math.sin(latitude) * Math.cos(longitude) * radii[0],
				center[1] + Math.sin(latitude) * Math.sin(longitude) * radii[1],
				center[2] + Math.cos(latitude) * radii[2]
			]);
		}
	}
	const id = String(input.id || 'ellipsoid');
	return createEditableMesh({
		id,
		vertices,
		faces: ellipsoidFaces(rings, segments, id, input.material),
		metadata: input.metadata || {}
	});
}

function ellipsoidFaces(rings, segments, id, material) {
	const faces = [];
	for (let ring = 0; ring < rings; ring += 1) {
		for (let segment = 0; segment < segments; segment += 1) {
			const next = (segment + 1) % segments;
			const a = ring * segments + segment;
			const b = ring * segments + next;
			const c = (ring + 1) * segments + next;
			const d = (ring + 1) * segments + segment;
			faces.push({
				id: `${id}:face:${ring}:${segment}`,
				vertices: [a, b, c, d],
				material: material ?? null,
				metadata: {}
			});
		}
	}
	return faces;
}
