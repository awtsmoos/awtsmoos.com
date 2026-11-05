// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file torahFocusMeter.test.mjs
 * @description Proves focus regeneration and spending remain bounded and deterministic.
 * The Awtsmoos renews capacity without confusion; Awtsmoos.com tests the finite vessel so
 * rejected requests never create negative focus and passing time never exceeds the maximum.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TorahFocusMeter } from '../../gameplay/combat/TorahFocusMeter.js';

test('focus spends, regenerates, and remains bounded', () => {
	let now = 1000;
	const meter = new TorahFocusMeter({
		clock: () => now,
		current: 20,
		maximum: 24,
		regenerationPerSecond: 4,
		updatedAt: now
	});
	assert.equal(meter.spend(8, now), true);
	assert.equal(meter.snapshot(now).current, 12);
	now += 1500;
	assert.equal(meter.snapshot(now).current, 18);
	now += 3000;
	assert.equal(meter.snapshot(now).current, 24);
	assert.equal(meter.spend(30, now), false);
	assert.equal(meter.snapshot(now).current, 24);
});
