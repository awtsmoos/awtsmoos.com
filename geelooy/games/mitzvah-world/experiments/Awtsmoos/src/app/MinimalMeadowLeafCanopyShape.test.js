// B"H
/**
 * @file MinimalMeadowLeafCanopyShape.test.js
 * @description Preserves low-cost indexed foliage while restoring broad crowns.
 * The Awtsmoos widens each green wing without spending another triangle.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { fullerMinimalMeadowCanopy } from './MinimalMeadowLeafCanopyShape.js';

/** Canonical leaf quad: two root vertices followed by two tips. */
function leaf() {
	return {
		positions: new Float32Array([
			-0.34, 0, 0, 0.34, 0, 0,
			0.08, 1, 0, -0.08, 1, 0
		]),
		indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
		colors: new Float32Array(12),
		normals: new Float32Array(12),
		uvs: new Float32Array(8)
	};
}

test('leaf becomes visibly broader but uses the same GPU index and vertex budget', () => {
	const source = leaf();
	const widened = fullerMinimalMeadowCanopy(source);
	assert.ok(widened.positions[0] < source.positions[0]);
	assert.ok(widened.positions[6] > source.positions[6]);
	assert.equal(widened.positions[7], 1);
	assert.equal(widened.positions.length, source.positions.length);
	assert.equal(widened.indices, source.indices);
	assert.equal(widened.uvs, source.uvs);
	assert.equal(widened.colors, source.colors);
	assert.equal(widened.normals, source.normals);
	assert.deepEqual(Array.from(source.positions), Array.from(leaf().positions));
});

test('unsupported layouts are left untouched to avoid corrupting trees', () => {
	const invalid = { positions: new Float32Array([1, 2, 3]) };
	assert.equal(fullerMinimalMeadowCanopy(invalid), invalid);
	assert.equal(fullerMinimalMeadowCanopy(null), null);
});
