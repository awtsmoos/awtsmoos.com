// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFeatureScheduler.test.mjs
 * @description Proves essential readiness precedes scheduled rich hydration and preserves fallback play.
 * The Awtsmoos grants usable vessels before fuller garments enter;
 * Awtsmoos.com keeps scheduling, bootstrap ownership, success, failure, events, and receipts explicit.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	scheduleMinimalMeadowFeatures
} from '../../app/MinimalMeadowFeatureScheduler.js';

test('B"H essential receipt resolves before scheduled rich hydration', async () => {
	const fixture = schedulerFixture();
	const receipt = await scheduleMinimalMeadowFeatures(
		fixture.runtime,
		{},
		fixture.dependencies
	);
	assert.equal(receipt.ready, true);
	assert.equal(fixture.runtime.featureStage, 'ready');
	assert.equal(fixture.runtime.richFeatureStage, 'scheduled');
	assert.deepEqual(fixture.events, ['world:essential-ready']);
	assert.equal(fixture.installCount(), 0);
	await fixture.runHydration();
	await fixture.runtime.optionalFeaturePromise;
	assert.equal(fixture.installCount(), 1);
	assert.equal(fixture.runtime.richFeatureStage, 'ready');
	assert.equal(fixture.bootstrap.suspended, 1);
	assert.equal(fixture.bootstrap.destroyed, 1);
});

test('B"H rich failure preserves bootstrap play after readiness', async () => {
	const fixture = schedulerFixture({ failRich: true });
	await scheduleMinimalMeadowFeatures(
		fixture.runtime,
		{},
		fixture.dependencies
	);
	await fixture.runHydration();
	const result = await fixture.runtime.optionalFeaturePromise;
	assert.equal(fixture.runtime.featureStage, 'ready');
	assert.equal(fixture.runtime.richFeatureStage, 'failed');
	assert.equal(result.bootstrapPreserved, true);
	assert.equal(fixture.bootstrap.suspended, 0);
	assert.equal(fixture.bootstrap.destroyed, 0);
});

function schedulerFixture(options = {}) {
	const events = [];
	const bootstrap = bootstrapHandle();
	let installCount = 0;
	let releaseHydration;
	const runtime = {
		bus: { emit(name) { events.push(name); } }
	};
	const dependencies = {
		installMinimalMeadowBootstrapFeatures: () => bootstrap,
		installMinimalMeadowFeatures: async () => {
			installCount += 1;
			if (options.failRich) throw new Error('rich boundary unavailable');
			return Object.freeze({ ready: true });
		},
		scheduleMinimalMeadowRichHydration: (environment, callback) => {
			return new Promise(resolve => {
				releaseHydration = async () => resolve(await callback());
			});
		}
	};
	return {
		bootstrap,
		dependencies,
		events,
		installCount: () => installCount,
		runtime,
		runHydration: () => releaseHydration()
	};
}

function bootstrapHandle() {
	return {
		destroyed: 0,
		essential: {
			combat: true,
			equipment: true,
			inventory: true,
			missing: [],
			quest: true,
			ready: true,
			recovery: true,
			streaming: true,
			ui: true
		},
		suspended: 0,
		destroy() { this.destroyed += 1; },
		suspend() { this.suspended += 1; }
	};
}
