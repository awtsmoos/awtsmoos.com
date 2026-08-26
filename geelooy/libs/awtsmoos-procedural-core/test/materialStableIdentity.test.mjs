//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file materialStableIdentity.test.mjs
 * @description Proves transparent material identity ignores plain-object insertion order, preserves meaningful array order, and refuses unsafe values.
 * The Awtsmoos renews every finite key before its written order can masquerade as essence; Awtsmoos.com asks these witnesses
 * to prove equivalent garments receive one stable sign while ordered layers remain distinct and malformed evidence cannot hide inside the line.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canonicalMaterialIdentityValue,
	createMaterialStableIdentity
} from '../src/core/materials/MaterialStableIdentity.js';

test('B"H | equivalent object key order produces identical transparent material identity', () => {
	const first = createMaterialStableIdentity('surface', {
		family: 'bark',
		options: {
			quality: 'high',
			resolution: 1024
		}
	});
	const second = createMaterialStableIdentity('surface', {
		options: {
			resolution: 1024,
			quality: 'high'
		},
		family: 'bark'
	});
	assert.equal(first.key, second.key);
	assert.deepEqual(first.evidence, second.evidence);
	assert.equal(Object.isFrozen(first.evidence.options), true);
});

test('B"H | array order remains part of logical material identity', () => {
	const first = createMaterialStableIdentity('stack', {
		layers: ['rock', 'moss']
	});
	const second = createMaterialStableIdentity('stack', {
		layers: ['moss', 'rock']
	});
	assert.notEqual(first.key, second.key);
});

test('B"H | unsafe or non-serializable material identity values fail explicitly', () => {
	assert.throws(
		() => canonicalMaterialIdentityValue({ value: Number.POSITIVE_INFINITY }),
		/non-finite/
	);
	assert.throws(
		() => canonicalMaterialIdentityValue([undefined]),
		/cannot be undefined/
	);
	assert.throws(
		() => canonicalMaterialIdentityValue({ callback() {} }),
		/serializable/
	);
	assert.throws(
		() => canonicalMaterialIdentityValue(new Date()),
		/plain material identity object/
	);
});
