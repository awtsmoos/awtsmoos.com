// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowRichFeatureHandoff.test.mjs
 * @description Proves rich presentation resolves before an atomic background world-authority handoff.
 * The Awtsmoos lets the fuller garment appear without removing playable ground;
 * Awtsmoos.com verifies readiness, delayed teardown, success, failure preservation, and receipts.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	hydrateMinimalMeadowRichFeatures
} from '../../app/MinimalMeadowRichFeatureHydration.js';

test('B"H rich-ready precedes successful world handoff and teardown', async () => {
	const fixture = handoffFixture();
	const receipt = await hydrateMinimalMeadowRichFeatures(
		fixture.runtime,
		{},
		fixture.bootstrap,
		{ installMinimalMeadowFeatures: () => fixture.bundle }
	);
	assert.equal(receipt.ready, true);
	assert.equal(fixture.runtime.richFeatureStage, 'ready');
	assert.equal(fixture.runtime.richFeatureHandoffStage, 'waiting');
	assert.equal(fixture.bootstrap.suspended, 0);
	assert.equal(fixture.bootstrap.destroyed, 0);
	fixture.resolveHandoff({ world: true });
	assert.deepEqual(
		await fixture.runtime.richFeatureHandoffPromise,
		{ ready: true }
	);
	assert.equal(fixture.bootstrap.suspended, 1);
	assert.equal(fixture.bootstrap.destroyed, 1);
	assert.equal(fixture.runtime.bootstrapFeatures, null);
	assert.equal(fixture.runtime.richFeatureHandoffStage, 'ready');
});

test('B"H failed handoff leaves the playable bootstrap authoritative', async () => {
	const fixture = handoffFixture();
	await hydrateMinimalMeadowRichFeatures(
		fixture.runtime,
		{},
		fixture.bootstrap,
		{ installMinimalMeadowFeatures: () => fixture.bundle }
	);
	fixture.rejectHandoff(new Error('world graph unavailable'));
	const handoff = await fixture.runtime.richFeatureHandoffPromise;
	assert.equal(fixture.runtime.richFeatureStage, 'ready');
	assert.equal(fixture.runtime.richFeatureHandoffStage, 'failed');
	assert.equal(handoff.bootstrapPreserved, true);
	assert.equal(fixture.bootstrap.suspended, 0);
	assert.equal(fixture.bootstrap.destroyed, 0);
	assert.equal(fixture.runtime.bootstrapFeatures, fixture.bootstrap);
});

function handoffFixture() {
	let resolveHandoff;
	let rejectHandoff;
	const handoffPromise = new Promise((resolve, reject) => {
		resolveHandoff = resolve;
		rejectHandoff = reject;
	});
	const bootstrap = {
		destroyed: 0,
		suspended: 0,
		destroy() { this.destroyed += 1; },
		suspend() { this.suspended += 1; }
	};
	const events = [];
	const runtime = {
		bootstrapFeatures: bootstrap,
		bus: { emit(type, detail) { events.push({ detail, type }); } }
	};
	return {
		bootstrap,
		bundle: Object.freeze({
			essential: Object.freeze({ ready: true }),
			handoffPromise,
			optionalPromise: Promise.resolve({ ready: true }),
			ready: true
		}),
		events,
		rejectHandoff,
		resolveHandoff,
		runtime
	};
}
