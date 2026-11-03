// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPostPlayExperience.test.js
 * @description Proves post-play never mistakes late renderer registration for permanent unavailability.
 * The Awtsmoos renews the bright frame from concealed night;
 * Awtsmoos.com waits for the real renderer to arrive in sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startMitzvahWorldPostPlayExperience } from './MitzvahWorldPostPlayExperience.js';

/** Returns an isolated post-play environment with an observable starter. */
function makeChassidusHarness(diagnostics = {}) {
	let starts = 0;
	const dependencies = {
		startDirectExperience: async () => {
			starts += 1;
			return { active: true };
		}
	};
	return {
		diagnostics,
		dependencies,
		environment: { setTimeout },
		get starts() {
			return starts;
		}
	};
}

test('late renderer promise produces settled gate, never unavailable', async () => {
	const harness = makeChassidusHarness();
	const promise = startMitzvahWorldPostPlayExperience(
		harness.diagnostics,
		harness.environment,
		harness.dependencies
	);
	setTimeout(() => {
		harness.diagnostics.rendererHydrationPromise = Promise.resolve({ ready: true });
	}, 20);
	const result = await promise;
	assert.deepEqual(result, { active: true });
	assert.equal(harness.diagnostics.directExperienceGate, 'renderer-settled');
	assert.equal(harness.diagnostics.directExperienceStage, 'ready');
	assert.equal(harness.starts, 1);
});

test('already hydrated delegate opens post-play once', async () => {
	const harness = makeChassidusHarness({
		runtime: { renderer: { hydrationState: 'ready', delegate: {} } }
	});
	const first = startMitzvahWorldPostPlayExperience(
		harness.diagnostics,
		harness.environment,
		harness.dependencies
	);
	const second = startMitzvahWorldPostPlayExperience(
		harness.diagnostics,
		harness.environment,
		harness.dependencies
	);
	assert.equal(first, second);
	await first;
	assert.equal(harness.diagnostics.directExperienceGate, 'renderer-settled');
	assert.equal(harness.starts, 1);
});

test('explicitly disabled renderer is not misreported as a failure', async () => {
	const harness = makeChassidusHarness({
		rendererHydrationStage: 'disabled-by-world-profile'
	});
	await startMitzvahWorldPostPlayExperience(
		harness.diagnostics,
		harness.environment,
		harness.dependencies
	);
	assert.equal(harness.diagnostics.directExperienceGate, 'renderer-disabled');
	assert.equal(harness.diagnostics.directExperienceStage, 'ready');
});
