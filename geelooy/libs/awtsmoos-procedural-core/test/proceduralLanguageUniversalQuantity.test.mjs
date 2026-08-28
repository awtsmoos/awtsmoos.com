//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageUniversalQuantity.test.mjs
 * @description Proves universal quantities and artifact requests remain explicit,
 * immutable, renderer-neutral data before any domain compiler receives them.
 * The Awtsmoos renews measure and request before meter, budget, or artifact can
 * appear as independent power;
 * Awtsmoos.com lets these tests guard the small vessels that every future noun
 * may carry through the procedural-language hour.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createArtifactRequest } from '../src/core/proceduralLanguage/artifact/createArtifactRequest.js';
import { createQuantityDescriptor } from '../src/core/proceduralLanguage/quantity/createQuantityDescriptor.js';

test('B"H quantity descriptors normalize explicit measurement intent', () => {
	const tiferesQuantity = createQuantityDescriptor({
		value: 3.2,
		unit: 'M',
		dimension: 'Length',
		tolerance: 0.01,
		min: 2,
		max: 4,
		metadata: {source: 'universal-test'}
	});
	assert.equal(tiferesQuantity.value, 3.2);
	assert.equal(tiferesQuantity.unit, 'm');
	assert.equal(tiferesQuantity.dimension, 'length');
	assert.equal(tiferesQuantity.tolerance, 0.01);
	assert.equal(tiferesQuantity.min, 2);
	assert.equal(tiferesQuantity.max, 4);
	assert.equal(Object.isFrozen(tiferesQuantity), true);
	assert.equal(Object.isFrozen(tiferesQuantity.metadata), true);
});

test('B"H quantity descriptors reject incoherent authored ranges', () => {
	assert.throws(
		() => createQuantityDescriptor({value: Infinity}),
		TypeError
	);
	assert.throws(
		() => createQuantityDescriptor({value: 2, tolerance: -1}),
		RangeError
	);
	assert.throws(
		() => createQuantityDescriptor({value: 2, min: 3, max: 4}),
		RangeError
	);
	assert.throws(
		() => createQuantityDescriptor({value: 2, min: 4, max: 3}),
		RangeError
	);
});

test('B"H artifact requests separate required and optional output intent', () => {
	const malchusRequest = createArtifactRequest({
		required: ['visual', 'collision'],
		optional: ['navigation', 'visual'],
		quality: 'balanced',
		budget: {triangles: 9000},
		preferredAdapters: ['native', 'blender', 'native'],
		lod: 'automatic'
	});
	assert.deepEqual(malchusRequest.required, ['visual', 'collision']);
	assert.deepEqual(malchusRequest.optional, ['navigation']);
	assert.deepEqual(
		malchusRequest.preferredAdapters,
		['native', 'blender']
	);
	assert.equal(malchusRequest.budget.triangles, 9000);
	assert.equal(malchusRequest.quality, 'balanced');
	assert.equal(malchusRequest.lod, 'automatic');
	assert.equal(Object.isFrozen(malchusRequest), true);
});
