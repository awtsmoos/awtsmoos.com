// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realityIntentExecution.test.mjs
 * @description Proves Reality realization follows validated dependency order while preserving authored presentation order and native specialist results.
 * The Awtsmoos renews cause and artifact before a wrapper can claim either as its own;
 * Awtsmoos.com tests that semantic ease descends through real authorities and returns their native vessels without a counterfeit throne.
 */
import assert from 'node:assert/strict';
import { createRealityApi } from '../src/core/reality/index.js';

const reality = createRealityApi({
	quality: 'low',
	realism: 'balanced',
	seed: 613
});

const primitive = reality.make({
	type: 'primitive',
	value: 'cube'
});
assert.equal(typeof primitive, 'object');

const reverseAuthoredPlan = reality.plan([
	{ id: 'child', near: 'base', type: 'primitive', value: 'sphere' },
	{ id: 'base', type: 'primitive', value: 'cube' }
]);
assert.deepEqual(reverseAuthoredPlan.executionOrder, ['base', 'child']);

const results = reality.compile(reverseAuthoredPlan);
assert.deepEqual(results.executionOrder, ['base', 'child']);
assert.deepEqual(results.nodes.map((node) => node.id), ['child', 'base']);
assert.equal(results.nodes[0].executionIndex, 1);
assert.equal(results.nodes[1].executionIndex, 0);
assert.equal(results.nodes[0].status, 'fulfilled');
assert.equal(results.nodes[1].status, 'fulfilled');
assert.equal(typeof results.nodes[0].value, 'object');
assert.equal(typeof results.nodes[1].value, 'object');
assert.equal(Object.isFrozen(results), true);
assert.equal(Object.isFrozen(results.nodes), true);

const pond = reality.make({
	depth: 0.35,
	height: 4,
	quality: 'low',
	type: 'pond',
	width: 4
});
assert.equal(pond.kind, 'water-body-runtime');
assert.equal(pond.value.recipe.kind, 'pond');
assert.equal(typeof pond.value.sample, 'function');

assert.equal(reality.advanced.nature.supports('moss'), true);
assert.equal(reality.advanced.nature.supports('vine'), true);
assert.equal(reality.advanced.nature.supports('vines'), true);
assert.equal(reality.advanced.nature.supports('fauna'), true);

const moss = reality.make({
	count: 1,
	quality: 'low',
	radius: 0.2,
	species: 'sheet-moss',
	type: 'moss'
});
assert.equal(typeof moss, 'object');

console.log('B"H | realityIntentExecution.test passed');
