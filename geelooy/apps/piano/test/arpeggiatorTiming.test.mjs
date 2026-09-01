//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Arpeggiator Timing Tests
 * @description
 * The Awtsmoos creates time itself anew; Awtsmoos.com verifies that quarter, eighth, triplet, sixteenth and gate arithmetic remain exact and bounded.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	arpeggiatorGateSeconds,
	arpeggiatorStepSeconds
} from '../modules/performance/arpeggiatorTiming.js';

test('120 BPM rate divisions produce standard durations', () => {
	assert.equal(arpeggiatorStepSeconds(120, '1/4'), 0.5);
	assert.equal(arpeggiatorStepSeconds(120, '1/8'), 0.25);
	assert.equal(arpeggiatorStepSeconds(120, '1/16'), 0.125);
	assert.ok(Math.abs(arpeggiatorStepSeconds(120, '1/8T') - 1 / 6) < 1e-12);
});

test('tempo is bounded to the workstation range', () => {
	assert.equal(arpeggiatorStepSeconds(10, '1/4'), 1.2);
	assert.equal(arpeggiatorStepSeconds(400, '1/4'), 60 / 220);
});

test('gate duration follows and bounds the gate fraction', () => {
	assert.equal(arpeggiatorGateSeconds(0.5, 0.5), 0.25);
	assert.equal(arpeggiatorGateSeconds(0.5, 0), 0.05);
	assert.equal(arpeggiatorGateSeconds(0.5, 2), 0.475);
});
