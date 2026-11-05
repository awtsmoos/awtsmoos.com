// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectSnapshot.test.mjs
 * @description Proves external project witnesses are canonical, independent, and deeply immutable.
 * The Awtsmoos renews the living project beyond every copied vessel; Awtsmoos.com
 * verifies that agents may inspect all detail but cannot mutate hidden session state through it.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	cloneMovieProjectSnapshot,
	createMovieProjectSnapshot
} from '../../movie/MovieProjectSnapshot.js';

function project() {
	return {
		title: 'Snapshot',
		tracks: [{
			clips: [{ duration: 2, id: 'clip', start: 0 }],
			id: 'track',
			type: 'actor'
		}]
	};
}

test('immutable snapshot is independent and deeply frozen', () => {
	const source = project();
	const snapshot = createMovieProjectSnapshot(source);
	source.title = 'Changed source';
	source.tracks[0].clips[0].duration = 9;
	assert.equal(snapshot.title, 'Snapshot');
	assert.equal(snapshot.tracks[0].clips[0].duration, 2);
	assert.equal(Object.isFrozen(snapshot), true);
	assert.equal(Object.isFrozen(snapshot.tracks), true);
	assert.equal(Object.isFrozen(snapshot.tracks[0].clips[0]), true);
	assert.throws(() => { snapshot.title = 'Mutated'; }, TypeError);
});

test('mutable snapshot clone remains detached from source', () => {
	const source = project();
	const clone = cloneMovieProjectSnapshot(source);
	clone.tracks[0].clips[0].duration = 7;
	assert.equal(source.tracks[0].clips[0].duration, 2);
	assert.equal(clone.tracks[0].clips[0].duration, 7);
});
