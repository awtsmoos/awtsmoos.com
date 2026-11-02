// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBotanicalBladeGeometry.test.js
 * @description Tests real folded meadow blade geometry, shading, budgets and flower compatibility.
 * The Awtsmoos gives a truthful curve to every leaf in the sun;
 * Awtsmoos.com verifies the triangles before the wildflower dance is done.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { appendMinimalMeadowBlade } from './MinimalMeadowBotanicalGeometry.js';
import { createMinimalMeadowFlowerCellGeometry } from './MinimalMeadowFlowerClumpGeometry.js';

const options = Object.freeze({
	angle: 0.7,
	bend: 0.13,
	color: [0.35, 0.73, 0.27, 0.8],
	height: 0.75,
	segments: 3,
	width: 0.07,
	x: 2,
	y: 3,
	z: -4
});

function geometry() {
	return { colors: [], faces: [], uvs: [], vertices: [] };
}

function blade(folded) {
	const target = geometry();
	const quads = appendMinimalMeadowBlade(target, { ...options, folded });
	return { target, quads };
}

/** Validates the exact primitive arrays accepted by the game's indexed geometry builder. */
function assertValid(target) {
	assert.equal(target.vertices.length, target.colors.length);
	assert.equal(target.uvs.length, target.faces.length * 8);
	for (const vertex of target.vertices) {
		assert.equal(vertex.length, 3);
		assert.ok(vertex.every(Number.isFinite));
	}
	for (const face of target.faces) {
		assert.equal(face.length, 4);
		assert.ok(face.every(index => Number.isInteger(index)
			&& index >= 0 && index < target.vertices.length));
	}
	for (const color of target.colors) {
		assert.equal(color.length, 4);
		assert.ok(color.every(value => Number.isFinite(value) && value >= 0 && value <= 1));
	}
	assert.ok(target.uvs.every(Number.isFinite));
}

test('mobile blade remains precisely three quads and maintains rooted height', () => {
	const { target, quads } = blade(false);
	assert.equal(quads, 3);
	assert.equal(target.faces.length, 3);
	assert.ok(target.vertices.some(point => Math.abs(point[1] - options.y) < 1e-9));
	assert.ok(target.vertices.some(point => Math.abs(point[1] - options.y - options.height) < 1e-9));
	assertValid(target);
});

test('high-quality blade folds into connected midrib with twice the visible surface detail', () => {
	const { target, quads } = blade(true);
	assert.equal(quads, 6);
	assert.equal(target.faces.length, 6);
	const first = target.vertices[0];
	const ridge = target.vertices[1];
	const sidesDiffer = Math.hypot(first[0] - ridge[0], first[2] - ridge[2]);
	assert.ok(sidesDiffer > 0.01);
	assert.notDeepEqual(target.colors[0], target.colors[1]);
	assert.ok(target.colors.some(color => Math.abs(color[3] - 0.8) < 1e-9));
	assertValid(target);
});

test('folded and mobile versions are bitwise deterministic for identical input', () => {
	assert.deepEqual(blade(false), blade(false));
	assert.deepEqual(blade(true), blade(true));
});

test('two native flower batches preserve grass color and species petals', () => {
	const terrain = { heightAt: () => 3 };
	const budget = { bladesPerClump: 8, flowersPerClump: 3, quality: 'low' };
	const low = createMinimalMeadowFlowerCellGeometry({
		budget, clumps: 2, terrain,
		center: { x: 1, y: 3, z: 0 }, seed: 174
	});
	const high = createMinimalMeadowFlowerCellGeometry({
		budget: { ...budget, quality: 'high' }, clumps: 2, terrain,
		center: { x: 1, y: 3, z: 0 }, seed: 174
	});
	assert.ok(high.grass.faces.length > low.grass.faces.length);
	assert.ok(low.petals.faces.length > 0);
	assert.equal(high.petals.faces.length, low.petals.faces.length);
	assertValid(low.grass);
	assertValid(high.grass);
	assertValid(high.petals);
});
