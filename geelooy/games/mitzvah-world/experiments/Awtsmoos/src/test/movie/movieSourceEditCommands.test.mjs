// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieSourceEditCommands.test.mjs
 * @description Proves exact insert ripple, overwrite preservation, source offsets, and failure states.
 * The Awtsmoos remains one while finite source replaces or makes room in sequence; Awtsmoos.com
 * verifies every surviving boundary, identity, offset, duration, and untouched input project.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { insertMovieSourceEdit } from '../../movie/MovieSourceInsertEdit.js';
import { overwriteMovieSourceEdit } from '../../movie/MovieSourceOverwriteEdit.js';
import { createMovieEditorialProject } from './movieEditorialFixture.mjs';

test('insert splits an overlap, ripples the right side, and selects the source clip', () => {
	const source = createMovieEditorialProject();
	const result = insertMovieSourceEdit(source, { time: 4, trackId: 'video-main' });
	const clips = result.project.tracks[0].clips;
	assert.deepEqual(clips.map(clip => [clip.start, clip.duration]), [
		[0, 4], [4, 3], [7, 6]
	]);
	assert.equal(clips[1].sourceOffset, 2);
	assert.equal(clips[2].sourceOffset, 4);
	assert.equal(result.selection.clipId, clips[1].id);
	assert.equal(source.tracks[0].clips.length, 1);
});

test('overwrite preserves only material outside the replacement interval', () => {
	const source = createMovieEditorialProject();
	const result = overwriteMovieSourceEdit(source, { time: 4, trackId: 'video-main' });
	const clips = result.project.tracks[0].clips;
	assert.deepEqual(clips.map(clip => [clip.start, clip.duration]), [
		[0, 4], [4, 3], [7, 3]
	]);
	assert.equal(clips[1].sourceOffset, 2);
	assert.equal(clips[2].sourceOffset, 7);
	assert.equal(result.project.duration, 20);
});

test('image edits create video track with explicit still duration', () => {
	const source = createMovieEditorialProject();
	source.tracks = [];
	source.mediaWorkspace.source = { inPoint: 0, mediaId: 'image-a', outPoint: 0 };
	const result = insertMovieSourceEdit(source, { duration: 4.5, time: 3 });
	assert.equal(result.project.tracks[0].type, 'video');
	assert.equal(result.project.tracks[0].clips[0].duration, 4.5);
	assert.equal(result.project.tracks[0].clips[0].mediaId, 'image-a');
});

test('source edit rejects incompatible tracks, invalid time, and unsupported media', () => {
	const source = createMovieEditorialProject();
	assert.throws(
		() => insertMovieSourceEdit(source, { time: 2, trackId: 'missing' }),
		/Unknown movie track/
	);
	assert.throws(() => insertMovieSourceEdit(source, { time: Infinity }), /finite number/);
	source.media.push({
		duration: 3,
		id: 'model-a',
		kind: 'model',
		label: 'Model',
		metadata: {},
		status: 'online',
		tags: [],
		url: '/model.glb'
	});
	source.mediaWorkspace.source = { inPoint: 0, mediaId: 'model-a', outPoint: 3 };
	assert.throws(() => insertMovieSourceEdit(source, { time: 0 }), /cannot be inserted/);
});
