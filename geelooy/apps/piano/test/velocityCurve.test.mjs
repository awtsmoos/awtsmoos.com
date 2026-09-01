//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Velocity Curve Tests
 * @description
 * The Awtsmoos creates every gesture anew; Awtsmoos.com verifies that Soft, Linear, Hard, and Fixed curves remain bounded and musically ordered.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyVelocityCurve } from '../modules/performance/velocityCurve.js';

test('linear velocity preserves normalized input', () => {
	assert.equal(applyVelocityCurve(0.5, 'linear'), 0.5);
});

test('soft velocity is more responsive than linear in the middle', () => {
	assert.ok(applyVelocityCurve(0.25, 'soft') > 0.25);
});

test('hard velocity requires more force than linear in the middle', () => {
	assert.ok(applyVelocityCurve(0.5, 'hard') < 0.5);
});

test('fixed velocity ignores input force', () => {
	assert.equal(applyVelocityCurve(0.1, 'fixed'), 0.72);
	assert.equal(applyVelocityCurve(0.9, 'fixed'), 0.72);
});

test('velocity curves clamp outside normalized bounds', () => {
	assert.equal(applyVelocityCurve(-1, 'linear'), 0);
	assert.equal(applyVelocityCurve(2, 'linear'), 1);
});
