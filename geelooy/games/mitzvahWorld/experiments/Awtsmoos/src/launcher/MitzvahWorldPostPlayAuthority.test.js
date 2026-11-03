// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPostPlayAuthority.test.js
 * @description Proves the direct experience starts only after the inventory authority it asserts exists.
 * The Awtsmoos does not demand the vessel before the vessel descends;
 * Awtsmoos.com waits for the store post-control hydration carries.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startMitzvahWorldPostPlayExperience } from './MitzvahWorldPostPlayExperience.js';

const FAST_AUTHORITY = {
	authorityDiscoveryMs: 150,
	authorityLimitMs: 5000,
	authorityPollMs: 10
};

/** Returns a post-play harness whose starter records the authority it was handed. */
function makeAuthorityHarness(runtime) {
	const record = { starts: 0, authorityAtStart: null };
	const diagnostics = {
		rendererHydrationPromise: Promise.resolve({ ready: true }),
		runtime
	};
	const dependencies = {
		...FAST_AUTHORITY,
		startDirectExperience: async current => {
			record.starts += 1;
			record.authorityAtStart = Boolean(
				current.runtime?.bus && current.runtime?.inventoryStore
			);
			return { active: true };
		}
	};
	return { diagnostics, dependencies, environment: { setTimeout }, record };
}

test('late inventory authority reaches the direct experience starter', async () => {
	const harness = makeAuthorityHarness({});
	harness.diagnostics.postControlHydrationStage = 'loading-module';
	setTimeout(() => {
		harness.diagnostics.runtime.bus = { on: () => () => {} };
		harness.diagnostics.runtime.inventoryStore = { snapshot: () => ({}) };
		harness.diagnostics.postControlHydrationStage = 'ready';
	}, 150);
	const result = await startMitzvahWorldPostPlayExperience(
		harness.diagnostics,
		harness.environment,
		harness.dependencies
	);
	assert.deepEqual(result, { active: true });
	assert.equal(harness.record.starts, 1);
	assert.equal(harness.record.authorityAtStart, true);
	assert.equal(harness.diagnostics.directExperienceGate, 'renderer-settled');
	assert.equal(
		harness.diagnostics.directExperienceAuthorityGate,
		'authority-ready'
	);
});

test('authority present from the first frame adds no wait', async () => {
	const harness = makeAuthorityHarness({
		bus: { on: () => () => {} },
		inventoryStore: { snapshot: () => ({}) }
	});
	const beganAt = Date.now();
	await startMitzvahWorldPostPlayExperience(
		harness.diagnostics,
		harness.environment,
		harness.dependencies
	);
	assert.equal(harness.record.authorityAtStart, true);
	assert.equal(
		harness.diagnostics.directExperienceAuthorityGate,
		'authority-ready'
	);
	assert.ok(Date.now() - beganAt < 500, 'settled authority must not wait');
});

test('authority that never registers still starts, honestly labelled', async () => {
	const harness = makeAuthorityHarness({});
	const beganAt = Date.now();
	await startMitzvahWorldPostPlayExperience(
		harness.diagnostics,
		harness.environment,
		harness.dependencies
	);
	assert.equal(harness.record.starts, 1);
	assert.equal(harness.record.authorityAtStart, false);
	assert.equal(
		harness.diagnostics.directExperienceAuthorityGate,
		'authority-unavailable'
	);
	assert.ok(Date.now() - beganAt < 3000, 'the wait must stay bounded');
});

test('degraded post-control ends the authority wait at once', async () => {
	const harness = makeAuthorityHarness({});
	harness.diagnostics.postControlHydrationStage = 'degraded';
	harness.dependencies.authorityDiscoveryMs = 8000;
	harness.dependencies.authorityLimitMs = 9000;
	const beganAt = Date.now();
	await startMitzvahWorldPostPlayExperience(
		harness.diagnostics,
		harness.environment,
		harness.dependencies
	);
	assert.equal(harness.record.starts, 1);
	assert.equal(
		harness.diagnostics.directExperienceAuthorityGate,
		'authority-unavailable'
	);
	assert.ok(Date.now() - beganAt < 2000, 'degradation is terminal, not a wait');
});
