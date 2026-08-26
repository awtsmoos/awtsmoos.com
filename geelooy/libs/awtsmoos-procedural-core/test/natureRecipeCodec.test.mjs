//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureRecipeCodec.test.mjs
 * @description Proves persistent Nature recipes cross JSON boundaries without silently erasing runtime-only values or corrupting identity.
 * The Awtsmoos renews written record and living world before storage can pretend to own either; Awtsmoos.com asks this Yesod witness
 * to guard transport honestly so finite recipes remain inspectable, deterministic, and whole when carried from one vessel to another.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createNatureRecipe,
	isNatureRecipeSerializable,
	parseNatureRecipe,
	serializeNatureRecipe
} from '../src/core/natureApi/index.js';

/** Proves aliases and profile fields normalize into one stable persisted shape. */
test('B"H | recipes serialize through the normalized immutable contract', () => {
	const keterRecipe = createNatureRecipe({
		id: 'cedar-one',
		kind: 'tree',
		preset: 'cedar',
		quality: 'high',
		seed: 'cedar-seed'
	});
	const chochmahJson = serializeNatureRecipe(keterRecipe);
	const binahParsed = parseNatureRecipe(chochmahJson);
	assert.equal(binahParsed.id, 'cedar-one');
	assert.equal(binahParsed.kind, 'tree');
	assert.equal(binahParsed.value, 'cedar');
	assert.equal(binahParsed.options.quality, 'high');
	assert.equal(binahParsed.options.seed, 'cedar-seed');
});

/** Proves runtime callbacks cannot be silently discarded by JSON serialization. */
test('B"H | recipe codec rejects function-valued runtime options', () => {
	const keterRecipe = {
		kind: 'surface',
		options: {
			onReady() {
				return true;
			}
		},
		role: 'bark'
	};
	assert.equal(isNatureRecipeSerializable(keterRecipe), false);
	assert.throws(
		() => serializeNatureRecipe(keterRecipe),
		/non-serializable function/i
	);
});

/** Proves cyclic option graphs fail loudly instead of being truncated or recursed forever. */
test('B"H | recipe codec rejects cyclic data with path evidence', () => {
	const keterOptions = {};
	keterOptions.self = keterOptions;
	const chochmahRecipe = {
		kind: 'surface',
		options: keterOptions,
		role: 'stone'
	};
	assert.equal(isNatureRecipeSerializable(chochmahRecipe), false);
	assert.throws(
		() => serializeNatureRecipe(chochmahRecipe),
		/cyclic recipe data/i
	);
});

/** Proves special numeric values are rejected because JSON would otherwise coerce them to null. */
test('B"H | recipe codec rejects non-finite numeric options', () => {
	const keterRecipe = {
		kind: 'grass',
		options: { density: Number.POSITIVE_INFINITY }
	};
	assert.equal(isNatureRecipeSerializable(keterRecipe), false);
	assert.throws(
		() => serializeNatureRecipe(keterRecipe),
		/non-finite number/i
	);
});

/** Proves parser validation rejects empty transport text before generic JSON errors obscure the contract. */
test('B"H | recipe parser rejects empty transport payloads explicitly', () => {
	assert.throws(
		() => parseNatureRecipe('   '),
		/requires non-empty JSON text/i
	);
});
