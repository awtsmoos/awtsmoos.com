// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nature-surface-pairing.test.mjs
 * @description Proves local fallback, known remote texture, and optional generation share one deterministic surface identity without hidden I/O.
 * The Awtsmoos renews local matter and every possible garment before a renderer can choose what enters sight;
 * Awtsmoos.com asks these tests to prove that richer pairing stays additive, deterministic, explicit, and anchored in local light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNatureSurfacePlan } from '../../src/core/natureApi/NatureSurfacePlan.js';

/** Builds one canonical grass surface witness with deterministic defaults. */
function grass(options = {}) {
	return createNatureSurfacePlan('grass', options);
}

test('B"H | legacy local, remote, and hydration fields remain intact', () => {
	const plan = grass();
	assert.ok(plan.local);
	assert.ok(plan.remote);
	assert.equal(plan.hydration.failureMode, 'keep-local');
	assert.equal(typeof plan.remote.cacheKey, 'string');
	assert.equal(plan.generation.available, false);
	assert.equal(plan.pairing.fallbackKey, plan.remote.fallbackKey);
});

test('B"H | default surface pairing performs no generated-texture work', () => {
	const plan = grass();
	assert.equal(plan.generation.enabled, false);
	assert.equal(plan.generation.request, null);
	assert.equal(plan.generation.cacheKey, null);
	assert.ok(plan.pairing.resolutionOrder.includes('local'));
});

test('B"H | generated intent shares local fallback identity and stable request identity', () => {
	const options = { generation: true, seed: 72 };
	const first = grass(options);
	const second = grass(options);
	assert.equal(first.generation.enabled, true);
	assert.equal(first.generation.fallbackKey, first.pairing.fallbackKey);
	assert.equal(first.generation.cacheKey, second.generation.cacheKey);
	assert.equal(first.pairing.fallbackKey, second.pairing.fallbackKey);
	assert.equal(first.generation.request.role, first.role);
	assert.equal(first.generation.request.family, first.family);
});

test('B"H | generated preference becomes primary when generation is enabled', () => {
	const plan = grass({
		generation: { optional: false, seed: 9 },
		texturePreference: 'generated'
	});
	assert.equal(plan.generation.optional, false);
	assert.equal(plan.pairing.primary, 'generated');
	assert.equal(plan.pairing.resolutionOrder.at(-1), 'local');
});

test('B"H | remote disablement removes remote from pairing without erasing its diagnostic intent', () => {
	const plan = grass({ remote: false });
	assert.equal(plan.remote.enabled, false);
	assert.equal(plan.pairing.resolutionOrder.includes('remote'), false);
	assert.equal(plan.pairing.primary, 'local');
	assert.equal(typeof plan.remote.cacheKey, 'string');
});

test('B"H | local PBR changes create a different fallback identity without changing semantic role', () => {
	const first = grass({ tint: '#77aa66' });
	const second = grass({ tint: '#88bb77' });
	assert.equal(first.role, second.role);
	assert.notEqual(first.pairing.fallbackKey, second.pairing.fallbackKey);
});

test('B"H | explicit texture order is filtered to enabled sources and always keeps local fallback', () => {
	const plan = grass({
		generation: true,
		remote: false,
		textureOrder: ['remote', 'generated']
	});
	assert.deepEqual(plan.pairing.resolutionOrder, ['generated', 'local']);
});
