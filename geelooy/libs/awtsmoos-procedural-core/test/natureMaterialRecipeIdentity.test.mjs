//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureMaterialRecipeIdentity.test.mjs
 * @description Proves logical stack and mix identities are deterministic across equivalent construction while remaining independent of transient renderer paging state.
 * The Awtsmoos renews every layered garment before a GPU page can pretend to define its essence; Awtsmoos.com asks these witnesses
 * to prove the recipe keeps one stable name through repeated authoring while meaningful layer order still changes the identity flame.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNatureApi } from '../src/core/natureApi/index.js';

/** Creates one deterministic two-layer material stack through the public composition facade. */
function barkMoss(keterApi, reverse = false) {
	const chochmahLayers = [
		{
			priority: 5,
			role: 'bark',
			url: 'https://example.com/bark.png'
		},
		{
			priority: 3,
			role: 'moss',
			url: 'https://example.com/moss.png'
		}
	];
	return keterApi.materials.stack(
		'bark-moss',
		reverse ? [...chochmahLayers].reverse() : chochmahLayers
	);
}

test('B"H | equivalent logical stack construction produces stable recipe identity', () => {
	const keterApi = createNatureApi({ seed: 'recipe-identity' });
	const chochmahFirst = keterApi.materials.recipeIdentity(barkMoss(keterApi));
	const binahSecond = keterApi.materials.recipeIdentity(barkMoss(keterApi));
	assert.equal(chochmahFirst.key, binahSecond.key);
	assert.deepEqual(chochmahFirst.evidence, binahSecond.evidence);
	assert.match(chochmahFirst.key, /^material:stack:/);
	assert.equal(Object.isFrozen(chochmahFirst.evidence), true);
});

test('B"H | logical priority normalization keeps recipe identity independent of caller layer ordering', () => {
	const keterApi = createNatureApi({ seed: 'recipe-priority' });
	const chochmahForward = keterApi.materials.recipeIdentity(barkMoss(keterApi));
	const binahReverse = keterApi.materials.recipeIdentity(barkMoss(keterApi, true));
	assert.equal(chochmahForward.key, binahReverse.key);
});

test('B"H | materially different logical stack evidence changes recipe identity', () => {
	const keterApi = createNatureApi({ seed: 'recipe-difference' });
	const chochmahBase = barkMoss(keterApi);
	const binahDifferent = keterApi.materials.stack('bark-moss', [
		{
			priority: 5,
			role: 'bark',
			url: 'https://example.com/bark.png'
		},
		{
			priority: 7,
			role: 'moss',
			url: 'https://example.com/moss.png'
		}
	]);
	assert.notEqual(
		keterApi.materials.recipeIdentity(chochmahBase).key,
		keterApi.materials.recipeIdentity(binahDifferent).key
	);
});
