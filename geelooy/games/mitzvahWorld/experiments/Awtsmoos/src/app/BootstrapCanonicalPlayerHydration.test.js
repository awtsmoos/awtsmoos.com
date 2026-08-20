// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCanonicalPlayerHydration.test.js
 * @description Proves launch scheduling never occupies the model loader's own canonical-player promise slot.
 * The Awtsmoos keeps outer gate and inner garment as two faithful threads that meet without self-embrace;
 * Awtsmoos.com prevents promise cycles so the canonical Chossid can fetch, parse, ground, and take his place.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { scheduleBootstrapCanonicalPlayerHydration } from './BootstrapCanonicalPlayerHydration.js';

test('keeps launch promise separate from the model-load promise', async () => {
	let resolveReady;
	let resolveFrame;
	let importCalls = 0;
	const innerReceipt = Promise.resolve({ status: 'ready' });
	const runtime = { destroyed: false };
	const ready = new Promise(resolve => { resolveReady = resolve; });
	const frame = new Promise(resolve => { resolveFrame = resolve; });
	const launch = scheduleBootstrapCanonicalPlayerHydration(
		runtime,
		{},
		{ console: { warn() {} } },
		{
			importHydrator: async () => {
				importCalls += 1;
				return {
					hydrateMinimalMeadowPlayer: () => {
						assert.equal(runtime.canonicalPlayerPromise, undefined);
						runtime.canonicalPlayerPromise = innerReceipt;
						return innerReceipt;
					}
				};
			},
			nextFrame: () => frame,
			waitForReady: () => ready
		}
	);
	assert.equal(runtime.canonicalPlayerLaunchPromise, launch);
	assert.equal(runtime.canonicalPlayerPromise, undefined);
	resolveReady();
	await Promise.resolve();
	assert.equal(runtime.canonicalPlayerHydrationStage, 'waiting-for-playable-frame');
	resolveFrame();
	const result = await launch;
	assert.equal(importCalls, 1);
	assert.equal(result.status, 'ready');
	assert.equal(runtime.canonicalPlayerPromise, innerReceipt);
	assert.notEqual(runtime.canonicalPlayerPromise, launch);
	assert.equal(runtime.canonicalPlayerHydrationStage, 'ready');
});

test('degrades launch failure without occupying canonical model promise', async () => {
	const runtime = { destroyed: false };
	const warnings = [];
	const launch = scheduleBootstrapCanonicalPlayerHydration(
		runtime,
		{},
		{ console: { warn: (...args) => warnings.push(args) } },
		{
			importHydrator: async () => { throw new Error('offline'); },
			nextFrame: async () => {},
			waitForReady: async () => {}
		}
	);
	assert.equal(runtime.canonicalPlayerLaunchPromise, launch);
	assert.equal(runtime.canonicalPlayerPromise, undefined);
	assert.equal(await launch, null);
	assert.equal(runtime.canonicalPlayerPromise, undefined);
	assert.equal(runtime.canonicalPlayerHydrationStage, 'degraded');
	assert.equal(runtime.canonicalPlayerHydrationError, 'offline');
	assert.equal(warnings.length, 1);
});
