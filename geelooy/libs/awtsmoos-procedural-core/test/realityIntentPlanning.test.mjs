// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realityIntentPlanning.test.mjs
 * @description Proves Reality planning is immutable, serializable, deterministic, dependency-aware, preset-transparent, and fluent-equivalent before realization.
 * The Awtsmoos renews cause, seed, and intention before authored order can pretend to be execution law;
 * Awtsmoos.com tests that simple scene speech becomes a truthful graph whose hidden depth remains inspectable by all.
 */
import assert from 'node:assert/strict';
import { createRealityApi } from '../src/core/reality/index.js';

const reality = createRealityApi({
	environment: { moisture: 0.8 },
	quality: 'balanced',
	realism: 'balanced',
	seed: 613
});

const intents = [
	{ around: 'water', count: 2, id: 'moss', species: 'sheet-moss', type: 'moss' },
	{ depth: 0.4, height: 4, id: 'water', type: 'pond', width: 4 }
];
const plan = reality.plan(intents);
assert.deepEqual(plan.nodes.map((node) => node.id), ['moss', 'water']);
assert.deepEqual(plan.executionOrder, ['water', 'moss']);
assert.equal(plan.profile.quality, 'medium');
assert.equal(plan.profile.realism, 'realistic');
assert.equal(plan.nodes[0].options.environment.moisture, 0.8);
assert.equal(plan.nodes[0].options.quality, 'medium');
assert.equal(plan.nodes[0].options.realism, 'realistic');
assert.equal(JSON.parse(JSON.stringify(plan)).kind, 'reality-intent-plan/v1');

const seedBefore = reality.plan([
	{ id: 'anchor', type: 'primitive', value: 'cube' },
	{ id: 'friend', type: 'primitive', value: 'sphere' }
]).nodes.find((node) => node.id === 'anchor').seed;
const seedAfter = reality.plan([
	{ id: 'friend', type: 'primitive', value: 'sphere' },
	{ id: 'extra', type: 'primitive', value: 'plane' },
	{ id: 'anchor', type: 'primitive', value: 'cube' }
]).nodes.find((node) => node.id === 'anchor').seed;
assert.equal(seedAfter, seedBefore);

assert.throws(
	() => reality.plan([{ id: 'same', type: 'primitive' }, { id: 'same', type: 'primitive' }]),
	/Duplicate Reality intent id/
);
assert.throws(
	() => reality.plan([{ id: 'child', near: 'missing', type: 'primitive' }]),
	/references missing node/
);
assert.throws(
	() => reality.plan([{ id: 'self', near: 'self', type: 'primitive' }]),
	/cannot depend on itself/
);
assert.throws(
	() => reality.plan([
		{ id: 'a', near: 'b', type: 'primitive' },
		{ id: 'b', near: 'a', type: 'primitive' }
	]),
	/dependency cycle/
);

const ruins = reality.plan('lush ruins');
assert.equal(ruins.nodes[0].kind, 'terrain');
assert.equal(ruins.nodes[0].options.profile, 'continental');
assert.equal(ruins.executionOrder.length, ruins.nodes.length);

const emptyBuilder = reality.scene({ seed: 613 });
const builtBuilder = emptyBuilder
	.pond({ id: 'water' })
	.moss('sheet-moss', { around: 'water', count: 2, id: 'moss' });
assert.equal(emptyBuilder.toJSON().intents.length, 0);
assert.equal(builtBuilder.toJSON().intents.length, 2);
assert.deepEqual(
	builtBuilder.plan(),
	reality.plan([
		{ id: 'water', type: 'pond' },
		{ around: 'water', count: 2, id: 'moss', species: 'sheet-moss', type: 'moss' }
	], { seed: 613 })
);

const catalog = reality.catalog('intent');
assert.ok(Array.isArray(catalog.intents));
assert.ok(reality.presets().includes('mountain-lake'));
assert.ok(reality.intents().includes('terrain'));
assert.ok(reality.intents().includes('moss'));

console.log('B"H | realityIntentPlanning.test passed');
