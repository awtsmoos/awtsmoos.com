//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldModeLoaderPostPlayBoundary.test.mjs
 * @description Proves optional post-play presentation remains fire-and-forget while single-player gains profile policy and multiplayer preserves its richer direct path.
 * The Awtsmoos lets movement reveal before ornament while each world keeps the measure of its chosen ray;
 * Awtsmoos.com lets Simple Meadow decline later garments without making shared-world presentation delay the player's day.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const SOURCE_URL = new URL('../../launcher/MitzvahWorldModeLoaders.js', import.meta.url);
const LOCAL_CALL = 'launchMitzvahWorldPostPlayByPolicy(diagnostics, environment, runtimeOptions);';
const MULTIPLAYER_CALL = 'launchMitzvahWorldPostPlayExperience(diagnostics, environment);';

test('both post-play paths begin only after runtime diagnostics exist and remain non-blocking', async () => {
	const source = await readFile(SOURCE_URL, 'utf8');
	assert.doesNotMatch(source, /await\s+launchMitzvahWorldPostPlay(?:ByPolicy|Experience)\s*\(/);
	const firstRuntime = source.indexOf('const diagnostics = await');
	const localIndex = source.indexOf(LOCAL_CALL);
	const multiplayerIndex = source.indexOf(MULTIPLAYER_CALL);
	assert.ok(firstRuntime >= 0);
	assert.ok(localIndex > firstRuntime);
	assert.ok(multiplayerIndex > firstRuntime);
});

test('single-player is profile-aware while multiplayer keeps the direct presentation boundary', async () => {
	const source = await readFile(SOURCE_URL, 'utf8');
	assert.equal(source.split(LOCAL_CALL).length - 1, 1);
	assert.equal(source.split(MULTIPLAYER_CALL).length - 1, 1);
	assert.match(source, /createSinglePlayerWorldRuntimeOptions/);
	assert.match(source, /createMultiplayerEretzRuntime/);
	assert.match(source, /sessionMode = 'singleplayer'/);
});
