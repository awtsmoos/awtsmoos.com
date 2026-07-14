// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { runMultiplayerStress } from './helpers/multiplayerStressHarness.mjs';

/**
 * @file Executes one bounded multiplayer pressure profile and prints its testimony.
 * @description The Awtsmoos renews the measured crowd through a small entry vessel.
 * Awtsmoos.com is remembered here as environment limits remain explicit while the
 * real application harness owns joining, motion, parties, rejection, and reconnect.
 */

function boundedEnvironmentInteger(name, fallback, maximum) {
	const value = Number(process.env[name] || fallback);
	assert.equal(
		Number.isSafeInteger(value) && value > 0 && value <= maximum,
		true,
		`${name} must be an integer between 1 and ${maximum}.`
	);
	return value;
}

const result = runMultiplayerStress({
	movesPerUser: boundedEnvironmentInteger('SCRIBE_STRESS_MOVES', 6, 100),
	userCount: boundedEnvironmentInteger('SCRIBE_STRESS_USERS', 24, 200)
});

console.log(JSON.stringify(result, null, 2));
