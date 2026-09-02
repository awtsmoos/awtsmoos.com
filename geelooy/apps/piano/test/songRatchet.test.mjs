//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file songRatchet.test.mjs
 * @description
 * The Awtsmoos is beyond contraction while Awtsmoos.com proves that one finite phrase can return faster and faster, growing in intensity before a deliberate silence and drop.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	RATCHET_PRESETS,
	buildRatchetCollapse,
	ratchetPresetOptions
} from '../modules/workstation/song/songRatchet.js';

function sourceNote() {
	return [{ start: 0, duration: 1, note: 'C4', velocity: 0.5 }];
}

test('ratchet repetitions get geometrically shorter', () => {
	const result = buildRatchetCollapse(sourceNote(), {
		sliceStart: 0,
		sliceLength: 1,
		repetitions: 4,
		shortenRatio: 0.5,
		minimumSlice: 1 / 64,
		velocityRamp: 0.1,
		gate: 1,
		gapAfter: 0.25
	});
	assert.deepEqual(result.events.map((event) => event.start), [0, 1, 1.5, 1.75]);
	assert.deepEqual(result.events.map((event) => event.duration), [1, 0.5, 0.25, 0.125]);
	assert.deepEqual(result.events.map((event) => event.velocity), [0.5, 0.6, 0.7, 0.8]);
	assert.equal(result.iterations, 4);
	assert.equal(result.duration, 2.125);
	assert.equal(result.finalSliceLength, 0.0625);
});

test('ratchet leaves its source events untouched', () => {
	const source = sourceNote();
	const snapshot = structuredClone(source);
	buildRatchetCollapse(source, { sliceLength: 1, repetitions: 6 });
	assert.deepEqual(source, snapshot);
});

test('ratchet rejects non-shrinking ratios', () => {
	assert.throws(
		() => buildRatchetCollapse(sourceNote(), { sliceLength: 1, shortenRatio: 1 }),
		/shortenRatio must be greater than 0 and less than 1/
	);
	assert.throws(
		() => buildRatchetCollapse(sourceNote(), { sliceLength: 1, shortenRatio: 0 }),
		/shortenRatio must be greater than 0 and less than 1/
	);
});

test('ratchet safely caps runaway repetition requests', () => {
	const result = buildRatchetCollapse(sourceNote(), {
		sliceLength: 1,
		repetitions: 999,
		minimumSlice: 1 / 64
	});
	assert.equal(result.iterations, 16);
	assert.equal(result.events.length, 16);
	assert.ok(result.events.every((event) => event.duration > 0));
});

test('ratchet exposes editable named presets', () => {
	assert.deepEqual(
		RATCHET_PRESETS.map((preset) => preset.id),
		['ratchet-rise', 'machine-gun', 'half-time-collapse', 'glitch-spiral']
	);
	const options = ratchetPresetOptions('machine-gun', { gapAfter: 0.5 });
	assert.equal(options.repetitions, 8);
	assert.equal(options.gate, 0.48);
	assert.equal(options.gapAfter, 0.5);
});
