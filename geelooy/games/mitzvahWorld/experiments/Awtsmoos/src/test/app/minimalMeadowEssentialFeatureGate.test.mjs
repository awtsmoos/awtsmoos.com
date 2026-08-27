// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEssentialFeatureGate.test.mjs
 * @description Proves essential settlement succeeds quickly or fails with structured timeline evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	awaitEssentialFeatureReceipt
} from '../../app/MinimalMeadowEssentialFeatureGate.js';

test('B"H essential gate returns a ready receipt', async () => {
	const stages = [];
	const receipt = await awaitEssentialFeatureReceipt(
		Promise.resolve({ ready: true }),
		{ featureStage: 'ready' },
		globalThis,
		{
			timeline: timelineSpy(stages),
			timeoutMs: 50
		}
	);
	assert.equal(receipt.ready, true);
	assert.deepEqual(stages, [
		'essential-watchdog-armed',
		'essential-watchdog-settled'
	]);
});

test('B"H essential gate exposes timeout stage and timeline', async () => {
	const stages = [];
	await assert.rejects(
		awaitEssentialFeatureReceipt(
			new Promise(() => {}),
			{ featureStage: 'bootstrapping' },
			globalThis,
			{
				timeline: timelineSpy(stages),
				timeoutMs: 5
			}
		),
		error => {
			assert.equal(error.code, 'MINIMAL_MEADOW_ESSENTIAL_TIMEOUT');
			assert.equal(error.details.featureStage, 'bootstrapping');
			assert.equal(error.details.timeoutMs, 5);
			assert.equal(error.details.timeline.at(-1).stage, 'essential-watchdog-timeout');
			return true;
		}
	);
});

function timelineSpy(stages) {
	return {
		mark(stage) {
			stages.push(stage);
		},
		snapshot() {
			return Object.freeze(stages.map(stage => Object.freeze({ stage })));
		}
	};
}
