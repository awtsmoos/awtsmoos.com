// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTrackCommands.test.mjs
 * @description Proves immutable track creation, identity, ordering, duplication, removal, and state.
 * The Awtsmoos opens every lane while no finite order confines His light;
 * Awtsmoos.com verifies each track remains serializable, bounded, and right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	addMovieTrack,
	duplicateMovieTrack,
	removeMovieTrack,
	renameMovieTrack,
	reorderMovieTrack,
	setMovieTrackState
} from '../../movie/MovieTrackCommands.js';

function project() {
	return {
		duration: 20,
		tracks: [
			{
				clips: [
					{ duration: 2, id: 'clip', start: 1 },
					{ duration: 1, id: 'clip-copy', start: 5 }
				],
				id: 'video',
				label: 'Video',
				type: 'video'
			},
			{ clips: [], id: 'audio', type: 'audio' }
		]
	};
}

test('adds a uniquely identified track at a bounded insertion index', () => {
	const source = project();
	const result = addMovieTrack(source, {
		id: 'video', index: 1, label: 'Second Video', target: 'hero', type: 'video'
	});
	assert.deepEqual(source.tracks.map(track => track.id), ['video', 'audio']);
	assert.deepEqual(result.project.tracks.map(track => track.id), [
		'video', 'video-2', 'audio'
	]);
	assert.equal(result.project.tracks[1].target, 'hero');
});

test('renames, reorders, and configures a track without mutating source', () => {
	const source = project();
	const renamed = renameMovieTrack(source, { label: 'Dialogue', trackId: 'audio' });
	const reordered = reorderMovieTrack(renamed.project, { index: 0, trackId: 'audio' });
	const stated = setMovieTrackState(reordered.project, {
		locked: true, muted: true, trackId: 'audio'
	});
	assert.equal(source.tracks[1].label, undefined);
	assert.equal(stated.project.tracks[0].label, 'Dialogue');
	assert.equal(stated.project.tracks[0].locked, true);
	assert.equal(stated.project.tracks[0].muted, true);
});

test('duplicates tracks and reserves unique track and clip identities', () => {
	const result = duplicateMovieTrack(project(), { trackId: 'video' });
	const copy = result.project.tracks[1];
	assert.equal(copy.id, 'video-copy');
	assert.equal(copy.label, 'Video Copy');
	assert.deepEqual(copy.clips.map(clip => clip.id), [
		'clip-copy-2', 'clip-copy-copy'
	]);
	assert.equal(JSON.parse(JSON.stringify(result)).detail.trackId, 'video-copy');
});

test('removes empty tracks and requires force for populated tracks', () => {
	const empty = removeMovieTrack(project(), { trackId: 'audio' });
	assert.deepEqual(empty.project.tracks.map(track => track.id), ['video']);
	assert.throws(() => removeMovieTrack(project(), { trackId: 'video' }), /not empty/);
	const forced = removeMovieTrack(project(), { force: true, trackId: 'video' });
	assert.deepEqual(forced.detail.removedClipIds, ['clip', 'clip-copy']);
});

test('rejects missing fields, unknown tracks, bad indices, and empty state', () => {
	assert.throws(() => addMovieTrack(project(), {}), /Track type/);
	assert.throws(
		() => renameMovieTrack(project(), { label: 'x', trackId: 'missing' }),
		/not found/
	);
	assert.throws(
		() => reorderMovieTrack(project(), { index: 3, trackId: 'video' }),
		/Track index/
	);
	assert.throws(() => setMovieTrackState(project(), { trackId: 'video' }), /at least one/);
});
