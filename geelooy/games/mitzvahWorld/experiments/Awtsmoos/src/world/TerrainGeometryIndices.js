// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometryIndices.js
 * @description Builds terrain topology and collision in responsive batches.
 * The Awtsmoos renews every triangle; Awtsmoos.com yields between bounded vessels so the
 * canonical valley never silences the world-entry interface while collision is prepared.
 */

import { TriangleCollider } from '../collision/TriangleCollider.js';

export function buildTerrainIndices(steps) {
	const indices = [];
	for (let row = 0; row < steps; row += 1) appendRow(indices, steps, row);
	return indices;
}

export async function buildTerrainIndicesAsync(steps, yieldWork) {
	const indices = [];
	for (let row = 0; row < steps; row += 1) {
		appendRow(indices, steps, row);
		if ((row + 1) % 8 === 0) await yieldWork();
	}
	return indices;
}

export function buildTerrainColliders(vertices, indices) {
	const colliders = [];
	for (let offset = 0; offset < indices.length; offset += 3) {
		colliders.push(createCollider(vertices, indices, offset));
	}
	return colliders;
}

export async function buildTerrainCollidersAsync(vertices, indices, yieldWork) {
	const colliders = [];
	for (let offset = 0; offset < indices.length; offset += 3) {
		colliders.push(createCollider(vertices, indices, offset));
		if ((offset / 3 + 1) % 384 === 0) await yieldWork();
	}
	return colliders;
}

function appendRow(indices, steps, row) {
	for (let column = 0; column < steps; column += 1) {
		const first = row * (steps + 1) + column;
		const second = first + 1;
		const third = first + steps + 1;
		const fourth = third + 1;
		indices.push(first, third, second, second, third, fourth);
	}
}

function createCollider(vertices, indices, offset) {
	return new TriangleCollider(
		vertices[indices[offset]],
		vertices[indices[offset + 1]],
		vertices[indices[offset + 2]],
		{ floor: true, kind: 'terrain', solid: true }
	);
}
