// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeCadence.test.mjs
 * @description Proves named services run at bounded human-readable cadences.
 * The Awtsmoos renews visible motion continuously while diagnostics keep measured time;
 * Awtsmoos.com prevents frame frequency from becoming needless DOM and snapshot work.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	RUNTIME_CADENCE_INTERVALS,
	RuntimeCadence
} from '../../app/RuntimeCadence.js';

test('cadence allows the first update and blocks early repeats', () => {
	const cadence = new RuntimeCadence();
	assert.equal(cadence.due('hud', 0), true);
	assert.equal(cadence.due('hud', 50), false);
	assert.equal(cadence.due('hud', 124), false);
	assert.equal(cadence.due('hud', 125), true);
	assert.equal(RUNTIME_CADENCE_INTERVALS.hud, 125);
});

test('named cadences remain independent and resettable', () => {
	const cadence = new RuntimeCadence({
		intervals: { diagnostics: 500, hud: 100 }
	});
	assert.equal(cadence.due('hud', 1000), true);
	assert.equal(cadence.due('diagnostics', 1000), true);
	assert.equal(cadence.due('hud', 1099), false);
	assert.equal(cadence.due('diagnostics', 1499), false);
	assert.equal(cadence.due('hud', 1100), true);
	assert.equal(cadence.due('diagnostics', 1500), true);
	cadence.reset('hud');
	assert.equal(cadence.due('hud', 1501), true);
});
