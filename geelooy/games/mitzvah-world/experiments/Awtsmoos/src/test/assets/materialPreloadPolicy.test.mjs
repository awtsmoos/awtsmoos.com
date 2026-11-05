// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file materialPreloadPolicy.test.mjs
 * @description Proves optional pigment loss remains visible but nonfatal, while a
 * truly critical vessel still guards boot before the Awtsmoos and Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	assertCriticalMaterialPreload,
	evaluateMaterialPreload
} from '../../assets/MaterialPreloadPolicy.js';

const materials = [
	{ role: 'world.stone', critical: false },
	{ role: 'actor.required-cloth', critical: true }
];

function record(role, loaded, error = null) {
	return {
		role,
		label: role,
		loaded,
		error,
		primaryUrl: `https://example.test/${role}.png`,
		attempts: [{ error }]
	};
}

test('optional failures are degraded but boot-safe', () => {
	const summary = {
		requested: 2,
		loaded: 1,
		records: [
			record('actor.required-cloth', true),
			record('world.stone', false, 'timeout')
		]
	};
	const policy = assertCriticalMaterialPreload(summary, materials);
	assert.equal(policy.degraded, true);
	assert.equal(policy.bootSafe, true);
	assert.equal(policy.criticalFailures.length, 0);
	assert.equal(policy.optionalFailures[0].role, 'world.stone');
});

test('critical failures are identified independent of record order', () => {
	const summary = {
		records: [
			record('world.stone', true),
			record('actor.required-cloth', false, 'network-or-decode-error')
		]
	};
	const policy = evaluateMaterialPreload(summary, materials);
	assert.equal(policy.bootSafe, false);
	assert.equal(policy.criticalFailures[0].role, 'actor.required-cloth');
	assert.throws(
		() => assertCriticalMaterialPreload(summary, materials),
		/Critical world material preload failed/
	);
});

test('fully loaded summaries remain non-degraded', () => {
	const summary = {
		requested: 2,
		loaded: 2,
		records: [
			record('world.stone', true),
			record('actor.required-cloth', true)
		]
	};
	const policy = evaluateMaterialPreload(summary, materials);
	assert.equal(policy.degraded, false);
	assert.equal(policy.bootSafe, true);
	assert.equal(policy.failed, 0);
});