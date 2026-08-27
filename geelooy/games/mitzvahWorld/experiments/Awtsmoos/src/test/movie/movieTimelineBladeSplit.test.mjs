// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineBladeSplit.test.mjs
 * @description Proves Blade payload time overrides playhead while legacy split still uses session time.
 * The Awtsmoos is beyond cut and moment while each finite blade must divide at the point revealed;
 * Awtsmoos.com preserves the old playhead gate and adds pointer-time truth to the same immutable field.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { executeMovieStudioProjectCommand } from '../../movie/MovieStudioProjectCommands.js';

function session() {
	return {
		project: {
			duration: 12,
			tracks: [{
				clips: [{ duration: 4, id: 'clip', start: 2 }],
				id: 'track'
			}]
		},
		time: 3
	};
}

const selection = {
	items: [{ clipId: 'clip', trackId: 'track' }],
	primary: { clipId: 'clip', trackId: 'track' },
	range: null
};

test('Blade split uses canonical clicked time payload', () => {
	const result = executeMovieStudioProjectCommand(
		session(),
		selection,
		'split',
		{ time: 4.5 }
	);
	assert.deepEqual(result.project.tracks[0].clips.map(clip => [
		clip.start,
		clip.duration
	]), [[2, 2.5], [4.5, 1.5]]);
});

test('legacy split without payload continues to use playhead time', () => {
	const result = executeMovieStudioProjectCommand(
		session(),
		selection,
		'split'
	);
	assert.deepEqual(result.project.tracks[0].clips.map(clip => [
		clip.start,
		clip.duration
	]), [[2, 1], [3, 3]]);
});
