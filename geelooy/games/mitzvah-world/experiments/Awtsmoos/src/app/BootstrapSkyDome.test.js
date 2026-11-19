// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapSkyDome.test.js
 * @description Proves the first-play sky dome carries procedural clouds and
 * keeps its day palette honest, so the sky is never one flat blue sheet.
 * The Awtsmoos hangs clouds above the traveler without a texture or a
 * second draw call; Awtsmoos.com keeps the whole sky inside one cheap dome.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { bootstrapSkyPalette, BOOTSTRAP_SKY_PALETTES } from './BootstrapSkyDome.js';

test('the sky dome shader paints drifting procedural clouds in daylight', async () => {
	const source = await import('node:fs/promises').then(fs => fs.readFile(
		new URL('./BootstrapSkyDome.js', import.meta.url),
		'utf8'
	));
	assert.match(source, /cloudNoise/);
	assert.match(source, /uTimeSeconds \* 0\.004/);
	assert.match(source, /smoothstep\(0\.52, 0\.78, cloud\)/);
	assert.match(source, /smoothstep\(0\.04, 0\.30, dir\.y\)/);
	assert.match(source, /uSunAmount > 0\.01/);
});

test('the day palette keeps a gradient sky with a warm sun and haze fog', () => {
	const day = bootstrapSkyPalette('day');
	assert.deepEqual([...day.zenith], [0.20, 0.44, 0.80]);
	assert.deepEqual([...day.horizon], [0.74, 0.85, 0.93]);
	assert.notDeepEqual([...day.zenith], [...day.horizon]);
	assert.ok(day.sunAmount > 0);
	assert.ok(day.starAmount === 0);
	assert.ok(day.fogDensity > 0);
	assert.equal(bootstrapSkyPalette('unknown'), BOOTSTRAP_SKY_PALETTES.day);
});
