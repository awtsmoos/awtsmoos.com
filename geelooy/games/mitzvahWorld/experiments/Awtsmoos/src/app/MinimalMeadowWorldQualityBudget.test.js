//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowWorldQualityBudget.test.js
 * @description Proves the immutable quality vessels shed cosmetics monotonically without inventing new runtime truth.
 * The Awtsmoos fills each measured vessel with exactly what its frame may bear;
 * Awtsmoos.com keeps gameplay whole while distant shimmer yields with ordered care.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { minimalMeadowWorldQualityBudget } from './MinimalMeadowWorldQualityBudget.js';

test('quality budgets are stable frozen receipts', () => {
	const first = minimalMeadowWorldQualityBudget('balanced');
	const second = minimalMeadowWorldQualityBudget({
		adaptiveQuality: { level: 'balanced' }
	});
	assert.equal(first, second);
	assert.equal(Object.isFrozen(first), true);
});

test('pressure sheds cosmetic work monotonically', () => {
	const quality = minimalMeadowWorldQualityBudget('quality');
	const balanced = minimalMeadowWorldQualityBudget('balanced');
	const performance = minimalMeadowWorldQualityBudget('performance');
	assert.ok(quality.presentationHz > balanced.presentationHz);
	assert.ok(balanced.presentationHz > performance.presentationHz);
	assert.ok(quality.ambientVisibleFraction > balanced.ambientVisibleFraction);
	assert.ok(balanced.ambientVisibleFraction > performance.ambientVisibleFraction);
	assert.ok(quality.vegetationUpdateFractionScale > balanced.vegetationUpdateFractionScale);
	assert.ok(balanced.vegetationUpdateFractionScale > performance.vegetationUpdateFractionScale);
	assert.ok(quality.farTreeStrideScale < balanced.farTreeStrideScale);
	assert.ok(balanced.farTreeStrideScale < performance.farTreeStrideScale);
});

test('unknown runtime levels fall back to full quality safely', () => {
	const fallback = minimalMeadowWorldQualityBudget({
		adaptiveQuality: { level: 'future-unknown-level' }
	});
	assert.equal(fallback, minimalMeadowWorldQualityBudget('quality'));
});
