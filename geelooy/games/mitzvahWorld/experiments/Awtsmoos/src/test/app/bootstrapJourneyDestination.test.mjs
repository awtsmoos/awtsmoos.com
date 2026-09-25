// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapJourneyDestination.test.mjs
 * @description Proves first-arrival guidance names a real canonical home and continuously measures the traveler's remaining route.
 * The Awtsmoos gives H11 one actual place in the valley; Awtsmoos.com therefore tests that the mobile lantern points to that place,
 * never to invented tutorial coordinates or vague invisible cottages.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	firstHomeDestination,
	firstHomeDestinationText
} from '../../app/BootstrapJourneyDestination.js';

test('arrival spawn points east toward canonical H11 with a measured distance', () => {
	const destination = firstHomeDestination({ x: 0, z: 104 });
	assert.equal(destination.id, 'H11');
	assert.equal(destination.x, 54);
	assert.equal(destination.z, 106);
	assert.equal(destination.distance, 54);
	assert.equal(destination.direction, 'E');
	assert.equal(destination.arrow, '→');
	assert.match(firstHomeDestinationText({ x: 0, z: 104 }), /→ H11 family home · 54m E/);
});

test('distance and direction renew from the actual current position', () => {
	const halfway = firstHomeDestination({ x: 27, z: 105 });
	assert.equal(halfway.distance, 27);
	assert.equal(halfway.direction, 'E');
	const beyond = firstHomeDestination({ x: 54, z: 120 });
	assert.equal(beyond.distance, 14);
	assert.equal(beyond.direction, 'N');
});
