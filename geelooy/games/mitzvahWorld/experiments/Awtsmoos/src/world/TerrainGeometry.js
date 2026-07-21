// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometry.js
 * @description Generates one exact valley mesh with synchronous and cooperative boot paths.
 * The Awtsmoos renews cliff, terrace, riverbank, road bed, and foundation as one earth vessel;
 * Awtsmoos.com yields during expensive canonical sampling without reducing distance or density.
 */

import { TriangleCollider } from '../collision/TriangleCollider.js';
import { triangleNormal, v } from '../math/Geometry3D.js';
import { canonicalTerrainHeightAt, canonicalTerrainZoneAt } from './CanonicalTerrainHeight.js';
import { canonicalTerraceDefinitions } from './CanonicalTerrainTerraces.js';

export const DEFAULT_TERRAIN_SIZE = 540;
export const DEFAULT_TERRAIN_STEPS = 128;
export const terrainHeightAt = canonicalTerrainHeightAt;
export const terrainZoneAt = canonicalTerrainZoneAt;

/** Builds the canonical terrain synchronously for deterministic tools and tests. */
export function createTerrainGeometry(
	size = DEFAULT_TERRAIN_SIZE,
	steps = DEFAULT_TERRAIN_STEPS
) {
	const startedAt = now();
	const state = createSamplingState(size, steps);
	for (let index = 0; index < state.total; index += 1) sampleVertex(state, index);
	return finishTerrain(state, {
		mode: 'synchronous',
		milliseconds: now() - startedAt,
		yields: 0
	});
}

/** Builds identical terrain while returning control between bounded sampling batches. */
export async function createTerrainGeometryAsync(
	size = DEFAULT_TERRAIN_SIZE,
	steps = DEFAULT_TERRAIN_STEPS,
	options = {}
) {
	const startedAt = now();
	const state = createSamplingState(size, steps);
	const yieldEvery = boundedInteger(options.yieldEvery, 32, 8, 512);
	const yieldWork = options.yieldWork || yieldToBrowser;
	let yields = 0;
	for (let index = 0; index < state.total; index += 1) {
		sampleVertex(state, index);
		if ((index + 1) % yieldEvery !== 0 || index + 1 === state.total) continue;
		yields += 1;
		if (yields % 8 === 0) options.onProgress?.(index + 1, state.total);
		await yieldWork();
	}
	options.onProgress?.(state.total, state.total);
	await yieldWork();
	return finishTerrain(state, {
		mode: 'cooperative',
		milliseconds: now() - startedAt,
		yieldEvery,
		yields: yields + 1
	});
}

export function terrainCoordinateAt(index, steps, half) {
	const normalized = index / steps * 2 - 1;
	const absolute = Math.abs(normalized);
	const centerDense = absolute * 0.32 + Math.pow(absolute, 1.72) * 0.68;
	return Math.sign(normalized) * centerDense * half;
}

function createSamplingState(size, steps) {
	return {
		half: size / 2,
		size,
		steps,
		total: (steps + 1) * (steps + 1),
		vertices: [],
		uvs: [],
		zones: []
	};
}

function sampleVertex(state, index) {
	const rowSize = state.steps + 1;
	const xIndex = index % rowSize;
	const zIndex = Math.floor(index / rowSize);
	const x = terrainCoordinateAt(xIndex, state.steps, state.half);
	const z = terrainCoordinateAt(zIndex, state.steps, state.half);
	const height = terrainHeightAt(x, z);
	state.vertices.push(v(x, height, z));
	state.uvs.push(xIndex / state.steps, zIndex / state.steps);
	state.zones.push(terrainZoneAt(x, z, height));
}

function finishTerrain(state, preparation) {
	const indices = [];
	appendIndices(indices, state.steps);
	return {
		AwtsmoosTerrainValley: terrainEvidence(
			state.size,
			state.steps,
			indices.length / 3,
			preparation
		),
		colliders: colliderList(state.vertices, indices),
		indices,
		normals: vertexNormals(state.vertices, indices),
		preparation,
		size: state.size,
		steps: state.steps,
		uvs: state.uvs,
		vertices: state.vertices,
		zones: state.zones
	};
}

function terrainEvidence(size, steps, colliderTriangles, preparation) {
	const centerSpacing = Math.abs(
		terrainCoordinateAt(steps / 2 + 1, steps, size / 2)
		- terrainCoordinateAt(steps / 2, steps, size / 2)
	);
	return Object.freeze({
		centerSpacing: Number(centerSpacing.toFixed(3)),
		colliderTriangles,
		grid: `${steps}x${steps}`,
		hydrology: 'canonical-waterfall-bridge-lake-outlet',
		performancePolicy: 'center-dense-cooperative-heightfield',
		preparation: Object.freeze({ ...preparation }),
		sampling: 'nonlinear-center-dense',
		terraces: canonicalTerraceDefinitions().map(terrace => terrace.id)
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

function boundedInteger(value, fallback, minimum, maximum) {
	const resolved = Number.isFinite(Number(value)) ? Number(value) : fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(resolved)));
}

function yieldToBrowser() {
	if (typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
	return new Promise(resolve => setTimeout(resolve, 0));
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
