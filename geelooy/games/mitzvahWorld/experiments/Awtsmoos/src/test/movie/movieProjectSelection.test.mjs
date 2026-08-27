// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectSelection.test.mjs
 * @description Proves stable selection survives cloned and normalized project vessels.
 * The Awtsmoos renews every object while identity remains beyond reference; Awtsmoos.com
 * verifies that track and clip IDs alone resolve the current canonical selection.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	allMovieClipIds,
	movieSelectionDescriptor,
	resolveMovieSelection
} from '../../movie/MovieProjectSelection.js';

const project = {
	tracks: [{
		clips: [{ id: 'clip-a' }, { id: 'clip-b' }],
		id: 'track-a'
	}]
};

test('selection descriptor resolves against a cloned project', () => {
	const descriptor = movieSelectionDescriptor(
		project.tracks[0],
		project.tracks[0].clips[1]
	);
	const cloned = structuredClone(project);
	const resolved = resolveMovieSelection(cloned, descriptor);
	assert.equal(resolved.track, cloned.tracks[0]);
	assert.equal(resolved.clip, cloned.tracks[0].clips[1]);
	assert.notEqual(resolved.clip, project.tracks[0].clips[1]);
});

test('missing identity resolves to null', () => {
	assert.equal(resolveMovieSelection(project, null), null);
	assert.equal(resolveMovieSelection(project, {
		clipId: 'missing',
		trackId: 'track-a'
	}), null);
	assert.equal(movieSelectionDescriptor({}, {}), null);
});

test('all clip IDs span every track', () => {
	assert.deepEqual([...allMovieClipIds(project)], ['clip-a', 'clip-b']);
});
