// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowGrassTints.test.js
 * @description Proves the soft meadow palette stays deep and narrow, so
 * the village lawns read as grass instead of harsh bright scribble.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMeadowGrassTints, MEADOW_GRASS_TINT_PALETTES } from '../../../../../../libs/awtsmoos-procedural-core/src/core/webgl/grass/meadowGrassTints.js';

function fakeField(count) {
	const offsets = new Float32Array(count * 3);
	for (let index = 0; index < count; index += 1) {
		offsets[index * 3] = index * 1.7;
		offsets[index * 3 + 2] = index * 0.9;
	}
	return { instanceCount: count, instanceOffsets: offsets };
}

test('meadow-soft exists and every tint stays below the harsh scribble ceiling', () => {
	const palette = MEADOW_GRASS_TINT_PALETTES['meadow-soft'];
	assert.ok(Array.isArray(palette) && palette.length > 0);
	assert.ok(palette.every(tint => tint.every(channel => channel <= 0.72)));
	const tints = createMeadowGrassTints(fakeField(600), { palette: 'meadow-soft', seed: 'test-meadow' });
	assert.equal(tints.length, 600 * 3);
	const max = Math.max(...tints);
	assert.ok(max < 0.83, `soft tints must stay muted, max was ${max}`);
	const dreamMax = Math.max(...MEADOW_GRASS_TINT_PALETTES['dream-meadow'].flat());
	assert.ok(Math.max(...palette.flat()) < dreamMax);
});

test('an unknown palette falls back to dream-meadow instead of breaking', () => {
	const tints = createMeadowGrassTints(fakeField(10), { palette: 'no-such-palette' });
	assert.equal(tints.length, 30);
	assert.ok(tints.every(value => Number.isFinite(value) && value > 0));
});
