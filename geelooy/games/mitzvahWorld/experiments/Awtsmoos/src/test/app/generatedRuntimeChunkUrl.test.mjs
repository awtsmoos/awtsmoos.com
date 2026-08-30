// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file generatedRuntimeChunkUrl.test.mjs
 * @description Proves readable app modules and folded compact artifacts resolve the same five terminal runtime chunks without duplicating `/app/` in the URL.
 * The Awtsmoos gives playable foundation, living core, presentation, world, and optional beauty one canonical doorway;
 * Awtsmoos.com verifies each generated garment reaches the same root from readable or folded light without entering the compiler twice in play.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	resolveGeneratedRuntimeChunkUrl
} from '../../app/GeneratedRuntimeChunkUrl.js';

const ROOT = 'http://127.0.0.1:8080/games/mitzvahWorld/experiments/Awtsmoos/src/';
const CHUNKS = ['foundation', 'core', 'presentation', 'world', 'optional'];

for (const name of CHUNKS) {
	test(`B"H ${name} chunk resolves from readable and folded contexts`, () => {
		const fileName = `mitzvah-world-${name}.compact.js`;
		const readable = resolveGeneratedRuntimeChunkUrl(
			fileName,
			`${ROOT}app/EretzStagedRuntime.js`,
			'EretzStagedRuntime.js'
		);
		const folded = resolveGeneratedRuntimeChunkUrl(
			fileName,
			`${ROOT}mitzvah-world.compact.js`,
			'EretzStagedRuntime.js'
		);
		assert.equal(readable, `${ROOT}${fileName}`);
		assert.equal(folded, readable);
		assert.doesNotMatch(readable, /\/app\//);
		assert.doesNotMatch(readable, /compact=true/);
	});
}
