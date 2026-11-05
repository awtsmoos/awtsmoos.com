// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioEditorialApi.test.mjs
 * @description Proves frozen public source editing, undo, redo, saved searches, and persistence.
 * The Awtsmoos renews human and agent command through one project history; Awtsmoos.com
 * verifies marks, insertion, recovery, memory, immutable answers, and revision truth agree.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

function addEditorialMedia(api) {
	return api.media.add({
		duration: 8,
		folder: 'Interviews/Day 1',
		id: 'interview',
		kind: 'video',
		label: 'Interview',
		metadata: { speaker: 'Leah' },
		status: 'online',
		tags: ['dialogue'],
		url: '/interview.mp4'
	});
}

test('public media domain selects, marks, inserts, undoes, and redoes one source edit', () => {
	const { api } = createMovieStudioApiHarness();
	assert.equal(addEditorialMedia(api).ok, true);
	assert.equal(api.media.selectSource('interview').ok, true);
	assert.equal(api.media.markIn(1.25).ok, true);
	assert.equal(api.media.markOut(4.75).ok, true);
	const inserted = api.media.insert({ time: 6 });
	assert.equal(inserted.ok, true);
	const track = api.project.tracks.find(item => item.type === 'video');
	assert.equal(track.clips[0].start, 6);
	assert.equal(track.clips[0].duration, 3.5);
	assert.equal(track.clips[0].sourceOffset, 1.25);
	assert.equal(Object.isFrozen(api.media.source()), true);
	api.history.undo();
	assert.equal(api.project.tracks.some(item => item.type === 'video'), false);
	api.history.redo();
	assert.equal(api.project.tracks.find(item => item.type === 'video').clips.length, 1);
});

test('public media search and saved search results are immutable', () => {
	const { api } = createMovieStudioApiHarness();
	addEditorialMedia(api);
	api.media.saveSearch({
		filter: { folder: 'Interviews', recursive: true },
		id: 'interviews',
		label: 'Interviews',
		query: 'Leah'
	});
	const results = api.media.applySavedSearch('interviews');
	assert.deepEqual(results.map(item => item.id), ['interview']);
	assert.equal(Object.isFrozen(results), true);
	assert.equal(Object.isFrozen(api.media.workspace()), true);
});

test('source marks and saved searches persist through verified save and load', async () => {
	const { api } = createMovieStudioApiHarness();
	addEditorialMedia(api);
	api.media.selectSource('interview');
	api.media.markIn(2);
	api.media.markOut(6);
	api.media.saveSearch({ id: 'dialogue', label: 'Dialogue', query: 'dialogue' });
	assert.equal((await api.persistence.save('editorial')).ok, true);
	api.media.clearSourceMarks();
	api.media.removeSavedSearch('dialogue');
	assert.deepEqual(api.media.source(), { inPoint: 0, mediaId: 'interview', outPoint: 8 });
	assert.equal((await api.persistence.load('editorial')).ok, true);
	assert.deepEqual(api.media.source(), { inPoint: 2, mediaId: 'interview', outPoint: 6 });
	assert.equal(api.media.savedSearches()[0].id, 'dialogue');
});
