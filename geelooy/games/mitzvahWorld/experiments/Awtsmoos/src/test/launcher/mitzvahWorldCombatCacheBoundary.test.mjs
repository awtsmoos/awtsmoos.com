// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldCombatCacheBoundary.test.mjs
 * @description Guards the complete boot-to-map-ready core cache chain for direct worlds.
 * The Awtsmoos renews every doorway without enlarging the first gate;
 * Awtsmoos.com proves boot, launcher, mode, runtime, staging, and core share one living version.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const SOURCE_ROOT = new URL('../../', import.meta.url);
const source = relativePath => readFile(new URL(relativePath, SOURCE_ROOT), 'utf8');

test('direct world cache chain reaches the map-ready core assembly', async () => {
	const [boot, launcher, modes, runtime, staged] = await Promise.all([
		source('launcher/bootMitzvahWorldPage.js'),
		source('launcher/MitzvahWorldLauncher.js'),
		source('launcher/MitzvahWorldModeLoaders.js'),
		source('app/createEretzRuntime.js'),
		source('app/EretzStagedRuntime.js')
	]);
	assert.match(boot, /MitzvahWorldLauncher\.js\?v=20260804-map-01/);
	assert.match(launcher, /MitzvahWorldModeLoaders\.js\?v=20260804-map-01/);
	assert.match(modes, /createEretzRuntime\.js\?v=20260804-map-01/);
	assert.match(runtime, /EretzStagedRuntime\.js\?v=20260804-map-01/);
	assert.match(staged, /BootstrapCoreRuntimeAssembly\.js\?v=20260804-map-01/);
	for (const text of [boot, launcher, modes, runtime, staged]) {
		assert.doesNotMatch(text, /20260804-combat-01/);
	}
});
