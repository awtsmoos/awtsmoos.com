// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file generatedRuntimeChunkUrl.test.mjs
 * @description Proves readable app modules and folded root artifacts resolve identical generated chunks.
 * The Awtsmoos gives each later garment one canonical doorway from every truthful vessel;
 * Awtsmoos.com verifies presentation, world, optional, readable, folded, and nonduplicated paths.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	resolveGeneratedRuntimeChunkUrl
} from '../../app/GeneratedRuntimeChunkUrl.js';

const ROOT = 'http://127.0.0.1:8080/games/mitzvahWorld/experiments/Awtsmoos/src/';

for (const name of ['presentation', 'world', 'optional']) {
	test(`B"H ${name} chunk resolves from readable and folded contexts`, () => {
		const fileName = `mitzvah-world-${name}.compact.js`;
		const readable = resolveGeneratedRuntimeChunkUrl(
			fileName,
			`${ROOT}app/MinimalMeadowFeatureBundle.js`,
			'MinimalMeadowFeatureBundle.js'
		);
		const folded = resolveGeneratedRuntimeChunkUrl(
			fileName,
			`${ROOT}mitzvah-world.compact.js`,
			'MinimalMeadowFeatureBundle.js'
		);
		assert.equal(readable, `${ROOT}${fileName}`);
		assert.equal(folded, readable);
		assert.doesNotMatch(readable, /\/app\//);
	});
}
