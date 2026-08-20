// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldPostPlayExperience.test.mjs
 * @description Proves optional presentation/audio waits for renderer settlement, starts once, and fails open.
 * The Awtsmoos opens the valley before ornament; Awtsmoos.com lets luminous rendering finish first,
 * then admits later presentation without ever imprisoning the player's first control.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	startMitzvahWorldPostPlayExperience
} from '../../launcher/MitzvahWorldPostPlayExperience.js';

test('B"H post-play experience waits for renderer settlement and starts once', async () => {
	const renderer = createDeferred();
	const directExperience = createDeferred();
	const diagnostics = {
		rendererHydrationPromise: renderer.promise
	};
	let starts = 0;
	const dependencies = {
		startDirectExperience() {
			starts += 1;
			return directExperience.promise;
		}
	};
	const first = startMitzvahWorldPostPlayExperience(
		diagnostics,
		globalThis,
		dependencies
	);
	const second = startMitzvahWorldPostPlayExperience(
		diagnostics,
		globalThis,
		dependencies
	);
	assert.equal(first, second);
	assert.equal(diagnostics.directExperienceStage, 'waiting-renderer');
	await Promise.resolve();
	assert.equal(starts, 0);
	renderer.resolve({ ready: true });
	await Promise.resolve();
	await Promise.resolve();
	assert.equal(starts, 1);
	assert.equal(diagnostics.directExperienceGate, 'renderer-settled');
	assert.equal(diagnostics.directExperienceStage, 'loading');
	const receipt = Object.freeze({ ready: true });
	directExperience.resolve(receipt);
	assert.equal(await first, receipt);
	assert.equal(diagnostics.directExperience, receipt);
	assert.equal(diagnostics.directExperienceStage, 'ready');
});

test('B"H renderer degradation still releases post-play experience', async () => {
	const diagnostics = {
		rendererHydrationPromise: Promise.reject(new Error('renderer degraded'))
	};
	const receipt = Object.freeze({ ready: true });
	const result = await startMitzvahWorldPostPlayExperience(
		diagnostics,
		globalThis,
		{ startDirectExperience: () => receipt }
	);
	assert.equal(result, receipt);
	assert.equal(diagnostics.directExperienceGate, 'renderer-degraded');
	assert.equal(diagnostics.directExperienceStage, 'ready');
});

test('B"H post-play experience failure degrades without rejection', async () => {
	const diagnostics = {};
	const receipt = await startMitzvahWorldPostPlayExperience(
		diagnostics,
		globalThis,
		{
			startDirectExperience() {
				throw new Error('fixture failure');
			}
		}
	);
	assert.equal(receipt, null);
	assert.equal(diagnostics.directExperienceGate, 'renderer-unavailable');
	assert.equal(diagnostics.directExperienceStage, 'failed');
	assert.equal(diagnostics.directExperienceError.message, 'fixture failure');
});

function createDeferred() {
	let resolve;
	const promise = new Promise(done => {
		resolve = done;
	});
	return { promise, resolve };
}
