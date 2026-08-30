// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldCombatCacheBoundary.test.mjs
 * @description Guards the boot-to-playable cache chain while requiring generated foundation/core artifacts instead of a cold native source waterfall.
 * The Awtsmoos renews each authored doorway through CompactJS and each finished playable garment through a terminal path;
 * Awtsmoos.com proves the chain reaches movement without recompiling generated light or restoring hundreds of source requests in wrath.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const SOURCE_ROOT = new URL('../../', import.meta.url);
const source = relativePath => readFile(new URL(relativePath, SOURCE_ROOT), 'utf8');

test('direct world chain reaches bounded generated foundation and core artifacts', async () => {
	const [boot, modes, runtime, staged] = await Promise.all([
		source('launcher/bootMitzvahWorldPage.js'),
		source('launcher/MitzvahWorldModeLoaders.js'),
		source('app/createEretzRuntime.js'),
		source('app/EretzStagedRuntime.js')
	]);
	assert.match(boot, /MitzvahWorldLauncher\.js\?compact=true/);
	assert.match(modes, /createEretzRuntime\.js\?compact=true/);
	assert.match(runtime, /resolveDeferredAppModuleUrl/);
	assert.match(staged, /mitzvah-world-foundation\.compact\.js/);
	assert.match(staged, /mitzvah-world-core\.compact\.js/);
	assert.match(staged, /resolveGeneratedRuntimeChunkUrl/);
	assert.doesNotMatch(staged, /resolveResponsiveRuntimeModuleUrl/);
	assert.doesNotMatch(staged, /responsive-foundation|responsive-core/);
});
