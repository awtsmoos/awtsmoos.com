// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieClipCommands.test.mjs
 * @description Proves split, duplicate, delete, bounds, unique IDs, and source immutability.
 * The Awtsmoos remains one while finite clips divide, echo, and depart; Awtsmoos.com
 * verifies each command changes only its cloned project and returns stable selection identity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	deleteMovieClip,
	duplicateMovieClip,
	splitMovieClip
} from '../../movie/MovieClipCommands.js';

function sampleProject() {
	return {
		duration: 12,
		tracks: [{
			clips: [{ duration: 4, id: 'clip', start: 2 }],
			id: 'track'
		}]
	};
}

const selection = { clipId: 'clip', trackId: 'track' };

test('split creates two bounded clips without mutating source', () => {
	const source = sampleProject();
	const result = splitMovieClip(source, selection, 4.5);
	assert.deepEqual(source.tracks[0].clips, [{ duration: 4, id: 'clip', start: 2 }]);
	assert.equal(result.project.tracks[0].clips.length, 2);
	assert.deepEqual(result.project.tracks[0].clips.map(clip => [
		clip.start,
		clip.duration
	]), [[2, 2.5], [4.5, 1.5]]);
	assert.equal(result.selection.trackId, 'track');
	assert.notEqual(result.selection.clipId, 'clip');
});

test('split rejects playhead outside safe clip interior', () => {
	assert.throws(
		() => splitMovieClip(sampleProject(), selection, 2.01),
		/inside the selected clip/
	);
});

test('duplicate creates a unique bounded copy', () => {
	const source = sampleProject();
	source.tracks[0].clips.push({ duration: 1, id: 'clip-copy', start: 9 });
	const result = duplicateMovieClip(source, selection);
	const duplicate = result.project.tracks[0].clips[1];
	assert.equal(duplicate.id, 'clip-copy-2');
	assert.equal(duplicate.start, 6);
	assert.equal(result.selection.clipId, duplicate.id);
});

test('duplicate moves backward when no space remains after clip', () => {
	const source = sampleProject();
	source.tracks[0].clips[0].start = 9;
	source.tracks[0].clips[0].duration = 3;
	const result = duplicateMovieClip(source, selection);
	assert.equal(result.project.tracks[0].clips[1].start, 6);
});

test('delete removes only selected clip and clears selection', () => {
	const source = sampleProject();
	source.tracks[0].clips.push({ duration: 1, id: 'other', start: 8 });
	const result = deleteMovieClip(source, selection);
	assert.deepEqual(result.project.tracks[0].clips.map(clip => clip.id), ['other']);
	assert.equal(result.selection, null);
	assert.equal(source.tracks[0].clips.length, 2);
});
