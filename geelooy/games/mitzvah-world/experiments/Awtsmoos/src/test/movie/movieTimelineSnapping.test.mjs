// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineSnapping.test.mjs
 * @description Proves optional snapping to bounds, playhead, markers, and neighboring edges.
 * The Awtsmoos offers every landmark without coercing motion; Awtsmoos.com verifies
 * that only nearby finite candidates guide move and trim while disabled edits remain exact.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	movieSnapCandidates,
	snapMovieClip,
	snapMovieTime
} from '../../movie/MovieTimelineSnapping.js';

const project = {
	duration: 12,
	markers: [{ id: 'marker', time: 5 }],
	tracks: [{
		clips: [
			{ duration: 2, id: 'active', start: 2 },
			{ duration: 1, id: 'neighbor', start: 8 }
		]
	}]
};

test('candidate collection includes bounds, playhead, marker, and neighbor edges', () => {
	assert.deepEqual(
		movieSnapCandidates(project, 'active', 6),
		[0, 12, 6, 5, 8, 9]
	);
});

test('snapMovieTime chooses nearest candidate inside threshold', () => {
	assert.equal(snapMovieTime(4.91, [0, 5, 8], 0.15), 5);
	assert.equal(snapMovieTime(4.7, [0, 5, 8], 0.15), 4.7);
});

test('disabled snapping preserves movement exactly', () => {
	const next = { duration: 2, id: 'active', start: 4.91 };
	assert.deepEqual(snapMovieClip(next, project.tracks[0].clips[0], null, {
		enabled: false,
		project
	}), next);
});

test('moving clip snaps its nearest edge to marker', () => {
	const next = { duration: 2, id: 'active', start: 4.91 };
	const snapped = snapMovieClip(next, project.tracks[0].clips[0], null, {
		enabled: true,
		playhead: 6,
		project,
		threshold: 0.15
	});
	assert.equal(snapped.start, 5);
});

test('start trim snaps while preserving original end', () => {
	const original = { duration: 2, id: 'active', start: 2 };
	const next = { duration: 1.91, id: 'active', start: 2.09 };
	const snapped = snapMovieClip(next, original, 'start', {
		enabled: true,
		playhead: 2,
		project,
		threshold: 0.15
	});
	assert.equal(snapped.start, 2);
	assert.equal(snapped.duration, 2);
});

test('end trim snaps to neighboring clip edge', () => {
	const original = { duration: 2, id: 'active', start: 2 };
	const next = { duration: 5.91, id: 'active', start: 2 };
	const snapped = snapMovieClip(next, original, 'end', {
		enabled: true,
		project,
		threshold: 0.15
	});
	assert.equal(snapped.duration, 6);
});
