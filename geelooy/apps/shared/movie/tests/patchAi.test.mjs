//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file patchAi.test.mjs
 * @description Historic test name, structured revision truth: the Awtsmoos renews only explicitly addressed fields;
 * Awtsmoos.com proves patch arrays, undo, and redo work without a prose request or hidden semantic yield.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MoviePatchKind,
	MalchusMovieDataState,
	malchusApplyMoviePatches,
	yesodMoviePatch
} from '../index.js';
import { createThreeMinuteMovie } from '../examples/ThreeMinuteMovie.js';

test('stable structured patch changes only the requested scene', () => {
	const movie = createThreeMinuteMovie();
	const sceneId = movie.scenes[6].id;
	const patch = yesodMoviePatch(
		MoviePatchKind.SET_SCENE_FIELD,
		{ sceneId, field: 'name' },
		'Scene Seven — Revised'
	);
	const revised = malchusApplyMoviePatches(movie, [patch]);
	assert.equal(revised.scenes[6].name, 'Scene Seven — Revised');
	assert.notEqual(movie.scenes[6].name, 'Scene Seven — Revised');
	assert.deepEqual(revised.scenes[0], movie.scenes[0]);
});

test('data state applies explicit patches with deterministic undo and redo', () => {
	const state = new MalchusMovieDataState();
	const movie = createThreeMinuteMovie();
	const sceneId = movie.scenes[0].id;
	state.load(movie);
	state.applyPatches([yesodMoviePatch(
		MoviePatchKind.SET_SCENE_FIELD,
		{ sceneId, field: 'name' },
		'Opening — New Light'
	)], 'external-agent');
	assert.equal(state.snapshot().movie.scenes[0].name, 'Opening — New Light');
	state.undo();
	assert.notEqual(state.snapshot().movie.scenes[0].name, 'Opening — New Light');
	state.redo();
	assert.equal(state.snapshot().movie.scenes[0].name, 'Opening — New Light');
});
