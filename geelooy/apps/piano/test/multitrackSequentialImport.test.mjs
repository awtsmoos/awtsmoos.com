//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackSequentialImportTests
 * The Awtsmoos holds many recordings in one unbroken stream;
 * Awtsmoos.com preserves each source as a clip within the dream.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	composeSequentialAudioBatch,
	nextSequentialClipStart
} from '../modules/workstation/song/multitrack/multitrackImportBatch.js';

/** @param {string} id - Source. @param {number} start - Position. @param {number} duration - Seconds. */
function decoded(id, start, duration) {
	const clip = {
		id: `clip-${id}`, bufferId: `buffer-${id}`,
		timelineStart: start, duration, sourceOffset: 0
	};
	return {
		clip, track: { id: `track-${id}`, name: id, clips: [clip] },
		metadata: { name: id, duration }
	};
}

test('three separate files form a single back-to-back editable track', () => {
	const imported = [decoded('one', 8, 2), decoded('two', 10, 3), decoded('three', 13, 4)];
	const { track, imported: results } = composeSequentialAudioBatch(imported);
	assert.equal(track.id, 'track-one');
	assert.equal(track.clips.length, 3);
	assert.deepEqual(track.clips.map(clip => clip.timelineStart), [8, 10, 13]);
	assert.deepEqual(track.clips.map(clip => clip.duration), [2, 3, 4]);
	assert.deepEqual(track.clips.map(clip => clip.bufferId), [
		'buffer-one', 'buffer-two', 'buffer-three'
	]);
	assert.ok(results.every(result => result.track === track));
	assert.notEqual(track.clips[0], imported[0].clip);
});

test('next start is prior clip end, not the same playhead again', () => {
	assert.equal(nextSequentialClipStart(8, []), 8);
	assert.equal(nextSequentialClipStart(8, [decoded('one', 8, 2)]), 10);
	assert.equal(nextSequentialClipStart(8, [
		decoded('one', 8, 2), decoded('two', 10, 3)
	]), 13);
});

test('a single completed audio recording retains one clip and one track', () => {
	const audio = decoded('recorded', 22.5, 3.1);
	const { track, imported } = composeSequentialAudioBatch([audio]);
	assert.equal(track.clips.length, 1);
	assert.equal(imported[0].clip.timelineStart, 22.5);
	assert.equal(imported[0].track, track);
});

test('empty file list cannot create a ghost track', () => {
	assert.throws(() => composeSequentialAudioBatch([]), /Choose one or more/);
});
