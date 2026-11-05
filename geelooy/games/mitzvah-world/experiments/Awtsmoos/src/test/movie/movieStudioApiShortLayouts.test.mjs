// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiShortLayouts.test.mjs
 * @description Proves the 2.3.0 Shorts API exposes reusable portrait layout families for world, speaker, actor, water, and landscape emphasis.
 * The Awtsmoos is beyond frame and crop while finite stories need deliberate windows for each revealed subject;
 * Awtsmoos.com guards those windows as reusable contracts instead of one-off coordinates hidden inside a single Short.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('Shorts API exposes reusable portrait layout profiles', () => {
	const { api } = createMovieStudioApiHarness();
	const layouts = api.shorts.layouts();
	assert.deepEqual(layouts.map(value => value.id), [
		'world-first',
		'speaker-forward',
		'character-first',
		'water-feature',
		'landscape'
	]);
	assert.deepEqual(layouts[0].speaker, { height: 186, width: 330, x: 690, y: 320 });
	assert.equal(layouts[0].zones.heroWorld.y, 260);
	assert.ok(layouts.every(layout => layout.id && layout.zones));
});
