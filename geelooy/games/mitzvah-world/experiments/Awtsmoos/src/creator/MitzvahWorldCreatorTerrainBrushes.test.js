// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorTerrainBrushes.test.js
 * @description Proves terrain sculpt brushes behave: raise lifts, lower carves,
 * flatten levels toward the center sample, smooth softens spikes, and the input
 * grid is never mutated.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyTerrainBrush,
	createSculptReceipt,
	terrainBrushIds
} from './MitzvahWorldCreatorTerrainBrushes.js';

function flatGrid(size, value = 0) {
	return new Float32Array(size * size).fill(value);
}

function centerOf(grid, size) {
	return grid[Math.floor(size / 2) * size + Math.floor(size / 2)];
}

test('brush ids are stable and complete', () => {
	assert.deepEqual(terrainBrushIds(), ['raise', 'lower', 'flatten', 'smooth']);
});

test('raise lifts the center and leaves the far edge untouched', () => {
	const size = 9;
	const before = flatGrid(size);
	const after = applyTerrainBrush({ heights: before, size, cell: 1, cx: 0, cz: 0, radius: 3, strength: 1, mode: 'raise' });
	assert.ok(centerOf(after, size) > 0, 'center must rise');
	assert.equal(after[0], 0, 'far corner must not move');
	assert.equal(centerOf(before, size), 0, 'input grid must not be mutated');
});

test('lower carves below the starting plane', () => {
	const size = 9;
	const after = applyTerrainBrush({ heights: flatGrid(size), size, cell: 1, cx: 0, cz: 0, radius: 3, strength: 1, mode: 'lower' });
	assert.ok(centerOf(after, size) < 0, 'center must sink');
});

test('flatten pulls a spike down toward the neighborhood', () => {
	const size = 9;
	const heights = flatGrid(size);
	heights[4 * size + 4] = 10;
	const after = applyTerrainBrush({ heights, size, cell: 1, cx: 1, cz: 0, radius: 3, strength: 1, mode: 'flatten' });
	assert.ok(after[4 * size + 4] < 10, 'spike must shrink toward the sampled target');
});

test('smooth softens a spike without moving flat land far away', () => {
	const size = 9;
	const heights = flatGrid(size);
	heights[4 * size + 4] = 10;
	const after = applyTerrainBrush({ heights, size, cell: 1, cx: 0, cz: 0, radius: 2.5, strength: 1, mode: 'smooth' });
	assert.ok(after[4 * size + 4] < 10, 'spike must soften');
	assert.equal(after[0], 0, 'distant flat land must not move');
});

test('unknown brush mode throws a deterministic error', () => {
	assert.throws(
		() => applyTerrainBrush({ heights: flatGrid(4), size: 4, mode: 'erupt' }),
		/TERRAIN_BRUSH_UNKNOWN:erupt/
	);
});

test('createSculptReceipt freezes a serializable record', () => {
	const receipt = createSculptReceipt({ id: 'sculpt-1', brush: 'raise', cx: 2, cz: -3, radius: 5, strength: 0.7 });
	assert.equal(receipt.id, 'sculpt-1');
	assert.equal(receipt.brush, 'raise');
	assert.equal(receipt.cx, 2);
	assert.ok(Object.isFrozen(receipt));
	assert.throws(() => createSculptReceipt({ brush: 'raise' }), /TERRAIN_SCULPT_ID_REQUIRED/);
	assert.throws(() => createSculptReceipt({ id: 'x', brush: 'erupt' }), /TERRAIN_BRUSH_UNKNOWN:erupt/);
});
