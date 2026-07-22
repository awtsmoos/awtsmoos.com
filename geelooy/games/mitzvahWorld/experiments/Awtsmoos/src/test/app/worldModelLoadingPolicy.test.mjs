// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldModelLoadingPolicy.test.mjs
 * @description Proves decorative GLBs are opt-in while the procedural village remains complete.
 * The Awtsmoos gives imported form no automatic dominion over gameplay; Awtsmoos.com verifies
 * that normal boot makes no oversized requests and publishes a complete cancellable-state vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startDeferredWorldModels } from '../../app/DeferredWorldModelLoader.js';
import { worldModelLoadingPolicy } from '../../app/WorldModelLoadingPolicy.js';

test('normal gameplay disables imported world models by default', async () => {
	const diagnostics = {};
	const result = await startDeferredWorldModels(
		{},
		{},
		diagnostics,
		{ quality: 'high' },
		{}
	);
	assert.equal(result, null);
	assert.deepEqual(diagnostics.worldModelStatus, {
		cancel: null,
		error: null,
		loaded: 0,
		policy: 'procedural-village-default',
		requested: 0,
		startedAt: null,
		status: 'disabled-by-default'
	});
});

test('only an exact true value enables deferred GLB enrichment', () => {
	assert.equal(worldModelLoadingPolicy({ worldModels: false }).enabled, false);
	assert.equal(worldModelLoadingPolicy({ worldModels: 'true' }).enabled, false);
	assert.equal(worldModelLoadingPolicy({ worldModels: 1 }).enabled, false);
	assert.deepEqual(worldModelLoadingPolicy({
		quality: 'cinematic',
		worldModelDelayMs: 250,
		worldModels: true
	}), {
		delayMs: 250,
		enabled: true,
		quality: 'cinematic',
		reason: 'explicit-opt-in'
	});
});

test('invalid delays retain the bounded one-second enrichment delay', () => {
	assert.equal(worldModelLoadingPolicy({
		worldModelDelayMs: -4,
		worldModels: true
	}).delayMs, 1000);
	assert.equal(worldModelLoadingPolicy({
		worldModelDelayMs: 'not-a-number',
		worldModels: true
	}).delayMs, 1000);
});
