// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometry.js
 * @description Generates canonical valley geometry and exact static floor colliders.
 * The Awtsmoos renews every vertex as earth beneath a real village; Awtsmoos.com keeps the
 * terrain mesh, collision field, hydrology, terraces, and ecological zones mathematically one.
 */

import { TriangleCollider } from '../collision/TriangleCollider.js';
import { triangleNormal, v } from '../math/Geometry3D.js';
import { canonicalTerrainHeightAt, canonicalTerrainZoneAt } from './CanonicalTerrainHeight.js';
import { canonicalTerraceDefinitions } from './CanonicalTerrainTerraces.js';

export const terrainHeightAt = canonicalTerrainHeightAt;
export const terrainZoneAt = canonicalTerrainZoneAt;

export function createTerrainGeometry(size = 540, steps = 64) {
	const vertices = [];
	const uvs = [];
	const indices = [];
	const zones = [];
	const half = size / 2;
	for (let zIndex = 0; zIndex <= steps; zIndex += 1) {
		for (let xIndex = 0; xIndex <= steps; xIndex += 1) {
			const x = -half + size * xIndex / steps;
			const z = -half + size * zIndex / steps;
			vertices.push(v(x, terrainHeightAt(x, z), z));
			uvs.push(xIndex / steps, zIndex / steps);
			zones.push(terrainZoneAt(x, z));
		}
	}
	appendIndices(indices, steps);
	return {
		AwtsmoosTerrainValley: {
			colliderTriangles: indices.length / 3,
			grid: `${steps}x${steps}`,
			hydrology: 'canonical-waterfall-bridge-lake-outlet',
			performancePolicy: 'single-heightfield-with-shader-detail',
			terraces: canonicalTerraceDefinitions().map((terrace) => terrace.id)
		},
		colliders: colliderList(vertices, indices),
		indices,
		normals: vertexNormals(vertices, indices),
		size,
		steps,
		uvs,
		vertices,
		zones
	};
}

function appendIndices(indices, steps) {
	for (let zIndex = 0; zIndex < steps; zIndex += 1) {
		for (let xIndex = 0; xIndex < steps; xIndex += 1) {
			const first = zIndex * (steps + 1) + xIndex;
			const second = first + 1;
			const third = first + steps + 1;
			const fourth = third + 1;
			indices.push(first, third, second, second, third, fourth);
		}
	}
}

function colliderList(vertices, indices) {
	const colliders = [];
	for (let index = 0; index < indices.length; index += 3) {
		colliders.push(new TriangleCollider(
			vertices[indices[index]],
			vertices[indices[index + 1]],
			vertices[indices[index + 2]],
			{ floor: true, kind: 'terrain', solid: true }
		));
	}
	return colliders;
}

function vertexNormals(vertices, indices) {
	const normals = Array.from({ length: vertices.length }, () => v());
	for (let index = 0; index < indices.length; index += 3) {
		const face = [indices[index], indices[index + 1], indices[index + 2]];
		const normal = triangleNormal(vertices[face[0]], vertices[face[1]], vertices[face[2]]);
		for (const vertexIndex of face) addNormal(normals[vertexIndex], normal);
	}
	return normals.flatMap(normalized);
}

function addNormal(target, source) {
	target.x += source.x;
	target.y += source.y;
	target.z += source.z;
}

function normalized(normal) {
	const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
	return [normal.x / length, normal.y / length, normal.z / length];
}
