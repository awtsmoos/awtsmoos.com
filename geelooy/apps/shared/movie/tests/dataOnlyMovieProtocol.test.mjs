//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file dataOnlyMovieProtocol.test.mjs
 * @description The Awtsmoos separates intelligence from execution: external agents declare, the movie vessel obeys;
 * Awtsmoos.com proves direct object loading, JSON transport, transactional rejection, opaque text, and explicit patch ways.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { YesodMovieAgentBridge, MalchusMovieDataState, MoviePatchKind, yesodMoviePatch } from '../index.js';
import { createMoviePromptIntent } from '../ai/MoviePromptIntent.js';
import { compileMovieIntent } from '../ai/MovieIntentCompiler.js';
import { createThreeMinuteMovie } from '../examples/ThreeMinuteMovie.js';

test('external-agent bridge loads exact canonical object and exposes contract/capabilities', () => {
	const state = new MalchusMovieDataState();
	const bridge = new YesodMovieAgentBridge({ state, appId: 'animator', appName: 'Animator' });
	const movie = createThreeMinuteMovie();
	bridge.loadMovie(movie);
	assert.deepEqual(bridge.getMovie(), movie);
	assert.equal(bridge.getContract().naturalLanguage, false);
	assert.equal(bridge.getContract().authoringAuthority, 'external-agent');
	assert.equal(bridge.getCapabilities().name, 'Awtsmoos Animator');
});

test('JSON is serialization only and malformed or invalid data never mutates current movie', () => {
	const state = new MalchusMovieDataState();
	const movie = createThreeMinuteMovie();
	state.loadJson(JSON.stringify(movie));
	const before = state.snapshot().movie;
	assert.throws(() => state.loadJson('{ definitely not JSON'));
	assert.deepEqual(state.snapshot().movie, before);
	assert.throws(() => state.load({ duration: 5, scenes: [] }));
	assert.deepEqual(state.snapshot().movie, before);
});

test('legacy prompt doorway rejects strings and compiler refuses sparse storytelling intent', () => {
	assert.throws(
		() => createMoviePromptIntent('orbit camera tutorial 30 seconds'),
		/Natural-language movie prompts are not accepted/
	);
	assert.throws(
		() => compileMovieIntent({ duration: 30, beats: [{ prompt: 'invent something' }] }),
		/explicitly declare at least one scene/
	);
});

test('explicit patch data changes exact field and literal text does not create behavior', () => {
	const state = new MalchusMovieDataState();
	const movie = createThreeMinuteMovie();
	const sceneId = movie.scenes[0].id;
	const originalCamera = structuredClone(movie.scenes[0].camera);
	const originalKinds = movie.scenes[0].layers.map(layer => layer.kind);
	state.load(movie);
	state.applyPatches([yesodMoviePatch(
		MoviePatchKind.SET_SCENE_FIELD,
		{ sceneId, field: 'name' },
		'orbit dolly crane 3D particles tutorial 90 seconds'
	)]);
	const revised = state.snapshot().movie;
	assert.deepEqual(revised.scenes[0].camera, originalCamera);
	assert.deepEqual(revised.scenes[0].layers.map(layer => layer.kind), originalKinds);
	assert.equal(revised.duration, 180);
});
