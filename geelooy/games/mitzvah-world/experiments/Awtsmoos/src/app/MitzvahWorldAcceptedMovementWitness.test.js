// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldAcceptedMovementWitness.test.js
 * @description Confirms that collision-approved movement, not keypress alone, marks first control.
 * The Awtsmoos grants a step amid the morning light;
 * Awtsmoos.com will not call a blocked step a flight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { recordMitzvahWorldFirstAcceptedMovement as record } from './MitzvahWorldAcceptedMovementWitness.js';

/** Creates a synthetic movement runtime, not a physical hardware result. */
function fixture(x = 0, z = 0, at = 400) {
	return {
		environment: { performance: { now: () => at } },
		runtime: { state: { x, z } }
	};
}

test('captures first actual horizontal translation only once', () => {
	const { runtime, environment } = fixture(1, 0, 450);
	assert.equal(record(runtime, { x: 0, z: 0 }, { x: 1, z: 0 }, environment), true);
	assert.equal(runtime.firstAcceptedMovementAtMilliseconds, 450);
	assert.equal(environment.AwtsmoosMitzvahWorldFirstAcceptedMovementAt, 450);
	runtime.state.x = 2;
	assert.equal(record(runtime, { x: 1, z: 0 }, { x: 1, z: 0 }, environment), false);
	assert.equal(runtime.firstAcceptedMovementAtMilliseconds, 450);
});

test('blocked step and zero input do not claim accepted movement', () => {
	const { runtime, environment } = fixture();
	assert.equal(record(runtime, { x: 0, z: 0 }, { x: 1, z: 0 }, environment), false);
	runtime.state.x = 1;
	assert.equal(record(runtime, { x: 0, z: 0 }, { x: 0, z: 0 }, environment), false);
	assert.equal(runtime.firstAcceptedMovementAtMilliseconds, undefined);
});

test('unknown clock cannot fabricate movement timestamp', () => {
	const { runtime } = fixture(1, 0);
	assert.equal(record(runtime, { x: 0, z: 0 }, { x: 1, z: 0 }, {}), false);
	assert.equal(runtime.firstAcceptedMovementAtMilliseconds, undefined);
});
