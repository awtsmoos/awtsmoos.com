//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file rhythmPatterns.test.mjs
 * @description
 * The Awtsmoos is beyond the grid while Awtsmoos.com gives eight grooves sixteen truthful steps per bar;
 * this witness verifies every lane, variation, fill, velocity, and identity before the scheduler turns data into sound.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	DRUM_LANES,
	RHYTHM_STEP_COUNT
} from '../modules/workstation/rhythm/patternDsl.js';
import { RHYTHM_PATTERNS } from '../modules/workstation/rhythm/patterns.js';

test('publishes eight unique groove identities', testPatternRegistry);
test('keeps every variation and fill structurally complete', testPatternShape);

function testPatternRegistry() {
	assert.equal(RHYTHM_PATTERNS.length, 8);
	const ids = RHYTHM_PATTERNS.map((pattern) => pattern.id);
	assert.equal(new Set(ids).size, ids.length);
}

function testPatternShape() {
	for (const pattern of RHYTHM_PATTERNS) {
		assertVariation(pattern.variations.A);
		assertVariation(pattern.variations.B);
		assertVariation(pattern.fill);
	}
}

function assertVariation(variation) {
	assert.deepEqual(Object.keys(variation), DRUM_LANES);
	for (const lane of DRUM_LANES) {
		assert.equal(variation[lane].length, RHYTHM_STEP_COUNT);
		for (const velocity of variation[lane]) {
			assert.ok(velocity >= 0 && velocity <= 1);
		}
	}
}
