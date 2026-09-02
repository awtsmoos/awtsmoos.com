//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackRatchet.test.mjs
 * @description
 * Gevurah proves the shrinking audio ladder before the drop while the Awtsmoos remains beyond repetition and climax.
 * Awtsmoos.com tests that intensity can rise and silence can open without copying or corrupting the underlying audio buffer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMultitrackRatchetDrop } from '../modules/workstation/song/multitrack/multitrackRatchet.js';
import { createMultitrackClip } from '../modules/workstation/song/multitrack/multitrackProject.js';

function sourceClip() {
	return createMultitrackClip({
		id: 'source',
		name: 'Hook',
		bufferId: 'buffer-hook',
		timelineStart: 1,
		sourceOffset: 0.5,
		duration: 8,
		gain: 0.8
	});
}

function settings() {
	return {
		sliceStart: 0,
		sliceLength: 1,
		repetitions: 4,
		shortenRatio: 0.5,
		minimumSlice: 1 / 32,
		velocityRamp: 0.1,
		gate: 0.75,
		gapAfter: 0.25
	};
}

test('ratchet produces shrinking fragments followed by a full drop', () => {
	const generated = buildMultitrackRatchetDrop(sourceClip(), 120, settings());
	assert.equal(generated.length, 5);
	assert.deepEqual(
		generated.slice(0, 4).map((clip) => clip.duration),
		[0.375, 0.1875, 0.09375, 0.046875]
	);
	assert.equal(generated[4].timelineStart, 2.0625);
	assert.equal(generated[4].duration, 8);
	assert.ok(generated[4].name.endsWith('DROP'));
});

test('ratchet keeps every generated clip on the original buffer', () => {
	const generated = buildMultitrackRatchetDrop(sourceClip(), 120, settings());
	assert.ok(generated.every((clip) => clip.bufferId === 'buffer-hook'));
	assert.ok(generated[3].gain > generated[0].gain);
});

test('ratchet rejects slice starts outside the selected clip', () => {
	assert.throws(
		() => buildMultitrackRatchetDrop(sourceClip(), 120, {
			...settings(),
			sliceStart: 40
		}),
		/outside the selected audio clip/
	);
});
