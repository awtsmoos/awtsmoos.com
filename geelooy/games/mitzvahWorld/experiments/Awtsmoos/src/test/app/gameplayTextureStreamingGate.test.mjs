// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file gameplayTextureStreamingGate.test.mjs
 * @description Proves texture enrichment waits through the first playable frame handoff.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startGameplayTextureStreaming } from '../../app/createEretzRuntime.js';

test('texture streaming starts only after two scheduled frame boundaries', () => {
	const frames = [];
	let starts = 0;
	const assets = {
		publicMaterialStreaming: {
			start() {
				starts += 1;
			}
		}
	};
	assert.equal(startGameplayTextureStreaming(assets, callback => frames.push(callback)), true);
	assert.equal(starts, 0);
	assert.equal(frames.length, 1);
	frames.shift()();
	assert.equal(starts, 0);
	assert.equal(frames.length, 1);
	frames.shift()();
	assert.equal(starts, 1);
});

test('legacy or injected streams need no gameplay gate', () => {
	let scheduled = 0;
	const result = startGameplayTextureStreaming(
		{ publicMaterialStreaming: { status: 'scheduled' } },
		() => {
			scheduled += 1;
		}
	);
	assert.equal(result, false);
	assert.equal(scheduled, 0);
});
