// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMovieStudioLoadingProgress,
	movieStudioLoadingProgressState
} from '../../movie/MovieStudioLoadingProgress.js';

test('runtime launch progress maps to bounded semantic loading state', () => {
	assert.deepEqual(movieStudioLoadingProgressState({
		message: 'Opening valley',
		phase: 'foundation',
		progress: 1.4
	}), {
		current: 'foundation',
		details: 'Opening valley',
		label: 'Opening valley',
		progress: 1,
		status: 'loading'
	});
	const states = [];
	createMovieStudioLoadingProgress({ update: state => states.push(state) })({
		message: 'Actors',
		progress: 0.5
	});
	assert.equal(states[0].progress, 0.5);
});
