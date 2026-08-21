// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzOptionalWorldStreaming.test.js
 * @description Proves default gameplay never imports deep terrain or botanical enrichment modules.
 * The Awtsmoos leaves optional forest beyond the gate until a conscious fidelity vessel calls;
 * Awtsmoos.com keeps ordinary movement free from hidden module avalanches and synchronous ornamental walls.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startEretzOptionalWorldStreaming } from './EretzOptionalWorldStreaming.js';

test('default gameplay resolves disabled diagnostics without loading deep modules', async () => {
	let loadCalls = 0;
	const diagnostics = {};
	const controller = startEretzOptionalWorldStreaming(
		{},
		diagnostics,
		{ explicit: false, quality: 'high' },
		{
			loadOptionalWorldStreamingModules: async () => {
				loadCalls += 1;
				throw new Error('deep modules must remain unopened');
			}
		}
	);
	assert.equal(loadCalls, 0);
	assert.equal(controller.snapshot().policy.enabled, false);
	assert.equal((await diagnostics.terrainEnrichmentPromise).state, 'disabled');
	assert.equal((await diagnostics.botanicalEnrichmentPromise).state, 'disabled');
	assert.equal((await diagnostics.botanicalStreamingGatePromise).state, 'disabled');
});

test('explicit deep streaming loads the deferred module pair once', async () => {
	let loadCalls = 0;
	let terrainStarts = 0;
	let botanicalStarts = 0;
	const diagnostics = {};
	startEretzOptionalWorldStreaming(
		{},
		diagnostics,
		{ explicit: false, quality: 'medium' },
		{
			enableDeepWorldStreaming: true,
			loadOptionalWorldStreamingModules: async () => {
				loadCalls += 1;
				return {
					startBotanical() {
						botanicalStarts += 1;
						diagnostics.botanicalEnrichmentPromise = Promise.resolve('botany');
						return { destroy() {}, snapshot: () => ({ state: 'ready' }) };
					},
					startTerrain() {
						terrainStarts += 1;
						diagnostics.terrainEnrichmentPromise = Promise.resolve('terrain');
						return { destroy() {}, snapshot: () => ({ state: 'ready' }) };
					}
				};
			}
		}
	);
	await diagnostics.botanicalStreamingGatePromise;
	assert.equal(loadCalls, 1);
	assert.equal(terrainStarts, 1);
	assert.equal(botanicalStarts, 1);
});
