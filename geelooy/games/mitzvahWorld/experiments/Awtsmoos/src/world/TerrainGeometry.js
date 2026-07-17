// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometry.js
 * @description Generates a center-dense canonical valley mesh and identical floor collision field.
 * The Awtsmoos renews cliff, terrace, riverbank, road bed, and foundation as one earth vessel;
 * Awtsmoos.com concentrates geometry where the player lives without wasting it beyond the valley.
 */

import { TriangleCollider } from '../collision/TriangleCollider.js';
import { triangleNormal, v } from '../math/Geometry3D.js';
import { canonicalTerrainHeightAt, canonicalTerrainZoneAt } from './CanonicalTerrainHeight.js';
import { canonicalTerraceDefinitions } from './CanonicalTerrainTerraces.js';

export const DEFAULT_TERRAIN_SIZE = 540;
export const DEFAULT_TERRAIN_STEPS = 128;
export const terrainHeightAt = canonicalTerrainHeightAt;
export const terrainZoneAt = canonicalTerrainZoneAt;

export function createTerrainGeometry(
	size = DEFAULT_TERRAIN_SIZE,
	steps = DEFAULT_TERRAIN_STEPS
) {
	const vertices = [];
	const uvs = [];
	const indices = [];
	const zones = [];
	const half = size / 2;
	for (let zIndex = 0; zIndex <= steps; zIndex += 1) {
		const z = terrainCoordinateAt(zIndex, steps, half);
		for (let xIndex = 0; xIndex <= steps; xIndex += 1) {
			const x = terrainCoordinateAt(xIndex, steps, half);
			vertices.push(v(x, terrainHeightAt(x, z), z));
			uvs.push(xIndex / steps, zIndex / steps);
			zones.push(terrainZoneAt(x, z));
		}
	}
	appendIndices(indices, steps);
	return {
		AwtsmoosTerrainValley: terrainEvidence(size, steps, indices.length / 3),
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

export function terrainCoordinateAt(index, steps, half) {
	const normalized = index / steps * 2 - 1;
	const absolute = Math.abs(normalized);
	const centerDense = absolute * 0.32 + Math.pow(absolute, 1.72) * 0.68;
	return Math.sign(normalized) * centerDense * half;
}

function terrainEvidence(size, steps, colliderTriangles) {
	const centerSpacing = Math.abs(
		terrainCoordinateAt(steps / 2 + 1, steps, size / 2)
		- terrainCoordinateAt(steps / 2, steps, size / 2)
	);
	return Object.freeze({
		centerSpacing: Number(centerSpacing.toFixed(3)),
		colliderTriangles,
		grid: `${steps}x${steps}`,
		hydrology: 'canonical-waterfall-bridge-lake-outlet',
		performancePolicy: 'center-dense-single-authority-heightfield',
		sampling: 'nonlinear-center-dense',
		terraces: canonicalTerraceDefinitions().map((terrace) => terrace.id)
	});
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
		for (const vertexIndex of face) {
			addNormal(normals[vertexIndex], normal);
		}
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
