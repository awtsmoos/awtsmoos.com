// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectQuery.test.mjs
 * @description Proves bounded immutable track/clip queries and exact JSON Pointer dependency discovery.
 * The Awtsmoos knows every vessel and relation beyond finite search; Awtsmoos.com verifies
 * agents can inspect stable metadata and reference paths without receiving mutable project objects.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { queryMovieProject } from '../../movie/MovieProjectQuery.js';
import { findMovieProjectReferences } from '../../movie/MovieProjectReferences.js';

const project = {
	duration: 12,
	metadata: { featuredTrackId: 'dialogue' },
	tracks: [
		{
			clips: [
				{ duration: 2, id: 'hello', speaker: 'Narrator', start: 1, text: 'Hello world' },
				{ duration: 3, id: 'answer', speaker: 'Child', start: 5, text: 'A bright answer' }
			],
			id: 'dialogue',
			label: 'Dialogue',
			target: 'player',
			type: 'dialogue'
		},
		{
			clips: [{ duration: 4, id: 'music', start: 0, url: '/music.ogg' }],
			id: 'audio',
			label: 'Music',
			type: 'audio'
		}
	]
};

test('project query filters clips by type, target, text, time, and stable IDs', () => {
	const result = queryMovieProject(project, {
		entity: 'clip',
		target: 'player',
		text: 'bright',
		time: { start: 4, end: 7 },
		type: 'dialogue'
	});
	assert.equal(result.clips.length, 1);
	assert.deepEqual(result.clips[0].descriptor, {
		clipId: 'answer',
		trackId: 'dialogue'
	});
	assert.equal(result.clips[0].end, 8);
	assert.equal(Object.isFrozen(result), true);
});

test('track queries return bounded metadata without live clips', () => {
	const result = queryMovieProject(project, {
		entity: 'track',
		text: 'dialogue'
	});
	assert.deepEqual(result.tracks, [{
		clipCount: 2,
		id: 'dialogue',
		label: 'Dialogue',
		target: 'player',
		type: 'dialogue'
	}]);
	assert.equal(Object.hasOwn(result.tracks[0], 'clips'), false);
});

test('query limits are bounded and malformed entities or times are coded failures', () => {
	assert.equal(queryMovieProject(project, { limit: 9999 }).query.limit, 500);
	assert.throws(
		() => queryMovieProject(project, { entity: 'scene-object' }),
		error => error.code === 'INVALID_MOVIE_PROJECT_QUERY_ENTITY'
	);
	assert.throws(
		() => queryMovieProject(project, { time: { start: 'bad', end: 2 } }),
		error => error.code === 'INVALID_MOVIE_PROJECT_QUERY_TIME'
	);
});

test('reference discovery returns exact immutable JSON Pointer paths', () => {
	const result = findMovieProjectReferences(project, 'dialogue');
	assert.deepEqual(result.references.map(item => item.path), [
		'/metadata/featuredTrackId',
		'/tracks/0/id'
	]);
	assert.equal(result.truncated, false);
	assert.equal(Object.isFrozen(result), true);
});

test('reference discovery rejects empty targets and obeys result limits', () => {
	assert.throws(
		() => findMovieProjectReferences(project, ''),
		error => error.code === 'INVALID_MOVIE_REFERENCE_TARGET'
	);
	const result = findMovieProjectReferences(project, 'dialogue', { limit: 1 });
	assert.equal(result.references.length, 1);
	assert.equal(result.truncated, true);
});
