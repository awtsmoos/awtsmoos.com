//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalCompile.test.mjs
 * @description Proves Portal compilation preserves dependency results, explicit fallback evidence, heavyweight runtime values, and lightweight Universal persistence.
 * The Awtsmoos renews deed and reason together; Awtsmoos.com lets these witnesses prove that runtime power may remain rich while saved
 * world data stays clean, every fallback is confessed, and each generated node can explain the seed, recipe, dependencies, and plan that revealed it.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	PortalKindRegistry,
	ProceduralPortal
} from '../src/index.js';

/** @description Creates a Portal using only explicit test kinds. @param {object[]} kinds Semantic kind definitions. @returns {ProceduralPortal} Test Portal. */
function createTestPortal(kinds) {
	return new ProceduralPortal({
		budget: 'preview',
		registry: new PortalKindRegistry(kinds),
		seed: 'compile-test',
		services: {}
	});
}

/** @description Proves dependencies compile first and their runtime results become explicit specialist context. @returns {Promise<void>} Test completion. */
test('B"H | compile routes dependency results in proven order', async () => {
	const keterPortal = createTestPortal([
		{
			compiler: async context => ({ type: 'test.child', value: context.recipe.payload.value }),
			kind: 'test.child'
		},
		{
			compiler: async context => ({ dependencyValue: context.dependencies.child?.value, type: 'test.parent' }),
			kind: 'test.parent'
		}
	]);
	const malchusResult = await keterPortal.create({
		dependencies: [{ id: 'child', kind: 'test.child', value: 72 }],
		dependsOn: ['child'],
		id: 'parent',
		kind: 'test.parent'
	});
	assert.deepEqual(malchusResult.plan.order, ['child', 'parent']);
	assert.equal(malchusResult.get('parent').result.dependencyValue, 72);
	assert.equal(malchusResult.result.type, 'test.parent');
});

/** @description Proves declared fallback is visible rather than silently replacing a failed specialist. @returns {Promise<void>} Test completion. */
test('B"H | declared fallback records primary failure evidence', async () => {
	const keterPortal = createTestPortal([{
		compiler: async () => {
			const error = new Error('primary unavailable');
			error.code = 'PRIMARY_DOWN';
			throw error;
		},
		fallback: async () => ({ type: 'test.local-fallback' }),
		kind: 'test.resilient'
	}]);
	const malchusResult = await keterPortal.create({ id: 'resilient', kind: 'test.resilient' });
	assert.equal(malchusResult.get('resilient').fallback.used, true);
	assert.equal(malchusResult.get('resilient').fallback.causeCode, 'PRIMARY_DOWN');
	assert.equal(malchusResult.explain('resilient').resultType, 'test.local-fallback');
});

/** @description Proves cyclic heavyweight runtime data never contaminates the JSON-safe Universal world document. @returns {Promise<void>} Test completion. */
test('B"H | Universal world persists semantic handles without heavyweight runtime output', async () => {
	const keterHeavy = { type: 'test.heavy' };
	keterHeavy.self = keterHeavy;
	const keterPortal = createTestPortal([{
		compiler: async () => keterHeavy,
		kind: 'test.heavy'
	}]);
	const malchusResult = await keterPortal.create({ id: 'heavy', kind: 'test.heavy' });
	assert.equal(malchusResult.get('heavy').result.self, keterHeavy);
	assert.doesNotThrow(() => JSON.stringify(malchusResult.world));
	assert.equal(malchusResult.world.resources.objects.heavy.metadata.portal.kind, 'test.heavy');
	assert.equal('result' in malchusResult.world.resources.objects.heavy.metadata.portal, false);
});
