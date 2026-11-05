// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file atmosphericMountainGeometry.test.mjs
 * @description Proves authored valley topology, aligned snow, and continuous physical texture scale.
 * The Awtsmoos closes ridge to ridge without tearing the garment of stone; Awtsmoos.com keeps
 * deterministic geography and duplicates one seam row so no compressed texture band appears.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MOUNTAIN_RIDGE_DIRECTIONS,
	sampleMountainRidge
} from '../../world/village/AtmosphericMountainRidgeAtlas.js';
import {
	MOUNTAIN_WORLD_UNITS_PER_REPEAT,
	mountainGeometry,
	snowGeometry
} from '../../world/village/AtmosphericMountainGeometry.js';

const OPTIONS = Object.freeze({ depth: 142, height: 188, radius: 390, segments: 64 });

test('mountain geometry opens one authored valley with a continuous UV seam', () => {
	const first = mountainGeometry(OPTIONS, 0);
	const second = mountainGeometry(OPTIONS, 0);
	const snow = snowGeometry(OPTIONS, 0);
	const source = sampleMountainRidge(MOUNTAIN_RIDGE_DIRECTIONS.source, 0);
	const outlet = sampleMountainRidge(MOUNTAIN_RIDGE_DIRECTIONS.outlet, 0);
	const west = sampleMountainRidge(MOUNTAIN_RIDGE_DIRECTIONS.westWall, 0);
	const east = sampleMountainRidge(MOUNTAIN_RIDGE_DIRECTIONS.eastWall, 0);

	assert.deepEqual(first, second);
	assert.equal(first.vertices.length, (OPTIONS.segments + 1) * 4);
	assert.equal(first.indices.length, OPTIONS.segments * 3 * 6);
	assert.equal(first.uvs.length, first.vertices.length * 2);
	assert.equal(snow.vertices.length, (OPTIONS.segments + 1) * 3);
	assert.equal(snow.indices.length, OPTIONS.segments * 2 * 6);
	assert.equal(snow.uvs.length, snow.vertices.length * 2);
	assert.ok(first.vertices.flat().every(Number.isFinite));
	assert.ok(first.indices.every(validIndex(first.vertices.length)));
	assert.ok(snow.indices.every(validIndex(snow.vertices.length)));
	assert.ok(source.ridgeHeightScale > outlet.ridgeHeightScale + 0.35);
	assert.ok(outlet.radiusScale > source.radiusScale + 0.12);
	assert.ok(west.weights['western-wall'] > 0.99);
	assert.ok(east.weights['eastern-terraces'] > 0.99);
	assert.ok(radialRange(first) > OPTIONS.radius * 0.12);
	assert.equal(MOUNTAIN_WORLD_UNITS_PER_REPEAT, 260);
	assertContinuousSeam(first, 4);
	assertContinuousSeam(snow, 3);
	assertSnowAlignment(first, snow);
});

function radialRange(geometry) {
	const radii = geometry.vertices
		.filter((_, index) => index % 4 === 0)
		.map(([x, , z]) => Math.hypot(x, z));
	return Math.max(...radii) - Math.min(...radii);
}

function assertContinuousSeam(geometry, stride) {
	const firstRow = geometry.vertices.slice(0, stride);
	const lastRow = geometry.vertices.slice(-stride);
	for (let index = 0; index < stride; index += 1) {
		assert.ok(distance(firstRow[index], lastRow[index]) < 1e-8);
	}
	const values = Array.from(
		{ length: OPTIONS.segments + 1 },
		(_, segment) => geometry.uvs[segment * stride * 2]
	);
	const deltas = values.slice(1).map((value, index) => value - values[index]);
	assert.ok(deltas.every(delta => delta > 0));
	assert.ok(Math.max(...deltas) / Math.min(...deltas) < 1.5);
}

function assertSnowAlignment(mountain, snow) {
	for (let segment = 0; segment <= OPTIONS.segments; segment += 1) {
		const ridge = mountain.vertices[segment * 4 + 2];
		const cap = snow.vertices[segment * 3 + 1];
		assert.ok(Math.abs(Math.atan2(ridge[2], ridge[0]) - Math.atan2(cap[2], cap[0])) < 1e-8);
		assert.ok(cap[1] > ridge[1]);
	}
}

function distance(first, second) {
	return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
}

function validIndex(vertexCount) {
	return index => Number.isInteger(index) && index >= 0 && index < vertexCount;
}
