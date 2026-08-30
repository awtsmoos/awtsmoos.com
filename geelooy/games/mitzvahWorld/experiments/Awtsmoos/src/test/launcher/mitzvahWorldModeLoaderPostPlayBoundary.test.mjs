// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldModeLoaderPostPlayBoundary.test.mjs
 * @description Proves the current post-play API remains fire-and-forget after runtime readiness rather than becoming part of the critical playable await chain.
 * The Awtsmoos lets movement reveal first while optional ornament follows in a separate ray;
 * Awtsmoos.com guards the exact modular symbol so future refactors cannot make creative presentation delay the player's day.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const sourcePath = fileURLToPath(
	new URL('../../launcher/MitzvahWorldModeLoaders.js', import.meta.url)
);

const POST_PLAY_CALL = 'launchMitzvahWorldPostPlayExperience(diagnostics, environment);';

test('post-play helper is invoked after runtime diagnostics exist and is never awaited', async () => {
	const source = await readFile(sourcePath, 'utf8');
	assert.match(source, /launchMitzvahWorldPostPlayExperience/);
	assert.doesNotMatch(source, /await\s+launchMitzvahWorldPostPlayExperience\s*\(/);
	const runtimeIndex = source.indexOf('const diagnostics = await');
	const postPlayIndex = source.indexOf(POST_PLAY_CALL);
	assert.ok(runtimeIndex >= 0);
	assert.ok(postPlayIndex > runtimeIndex);
});

test('single-player and multiplayer both cross the same non-blocking post-play boundary', async () => {
	const source = await readFile(sourcePath, 'utf8');
	const callCount = source.split(POST_PLAY_CALL).length - 1;
	assert.equal(callCount, 2);
	assert.match(source, /sessionMode = 'singleplayer'/);
	assert.match(source, /createMultiplayerEretzRuntime/);
});
