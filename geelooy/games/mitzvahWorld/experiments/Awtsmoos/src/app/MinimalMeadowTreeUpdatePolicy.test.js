//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowTreeUpdatePolicy.test.js
 * @description Proves nearby trees retain full life while distant animation becomes cheaper without hot-path receipt replacement.
 * The Awtsmoos keeps every rooted identity still while measured cadence bends to will;
 * Awtsmoos.com guards the living grove so distance sheds expense but never truth upon the hill.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowTreeUpdateReceipt,
	minimalMeadowTreeUpdateDecision,
	minimalMeadowTreeUpdatePolicy
} from './MinimalMeadowTreeUpdatePolicy.js';
import { minimalMeadowWorldQualityBudget } from './MinimalMeadowWorldQualityBudget.js';

const policy = minimalMeadowTreeUpdatePolicy(false);
const player = Object.freeze({ x: 0, z: 0 });

function treeAt(x, z = 0) {
	return { position: { x, z } };
}

test('live hot path reuses the caller decision vessel', () => {
	const receipt = createMinimalMeadowTreeUpdateReceipt();
	const result = minimalMeadowTreeUpdateDecision(
		treeAt(10), player, 1, 0, policy, minimalMeadowWorldQualityBudget('quality'), receipt
	);
	assert.equal(result, receipt);
	assert.equal(result.distanceSquared, 100);
	assert.equal(result.stride, 1);
	assert.equal(result.visible, true);
});

test('near trees retain full cadence across adaptive levels', () => {
	for (const level of ['quality', 'balanced', 'performance']) {
		const receipt = createMinimalMeadowTreeUpdateReceipt();
		minimalMeadowTreeUpdateDecision(
			treeAt(12), player, 7, 0, policy, minimalMeadowWorldQualityBudget(level), receipt
		);
		assert.equal(receipt.stride, 1);
		assert.equal(receipt.shouldAnimate, true);
	}
});

test('distant tree cadence gets cheaper as pressure rises', () => {
	const strides = ['quality', 'balanced', 'performance'].map(level => {
		const receipt = createMinimalMeadowTreeUpdateReceipt();
		minimalMeadowTreeUpdateDecision(
			treeAt(220), player, 20, 0, policy, minimalMeadowWorldQualityBudget(level), receipt
		);
		return receipt.stride;
	});
	assert.ok(strides[0] < strides[1]);
	assert.ok(strides[1] < strides[2]);
});

test('compatibility snapshot preserves linear distance outside the hot path', () => {
	const result = minimalMeadowTreeUpdateDecision(treeAt(3, 4), player, 1, 0, policy);
	assert.equal(result.distanceSquared, 25);
	assert.equal(result.distance, 5);
	assert.equal(Object.isFrozen(result), true);
});
