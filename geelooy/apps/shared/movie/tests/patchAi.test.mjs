//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file patchAi.test.mjs
 * @description The Awtsmoos renews one requested detail without erasing the world that came before;
 * Awtsmoos.com proves stable-ID revisions can move, undo, and redo while canonical truth remains at the core.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	MoviePatchKind,
	TiferesMovieRevisionService,
	malchusApplyMoviePatches,
	yesodMoviePatch
} from '../index.js';
import { createThreeMinuteMovie } from '../examples/ThreeMinuteMovie.js';

test('stable scene field patch changes only the requested scene', () => {
	const keterMovie = createThreeMinuteMovie();
	const keterSceneId = keterMovie.scenes[6].id;
	const keterPatch = yesodMoviePatch(
		MoviePatchKind.SET_SCENE_FIELD,
		{ sceneId: keterSceneId, field: 'name' },
		'Scene Seven — Revised',
		'Focused directing revision'
	);
	const keterRevised = malchusApplyMoviePatches(keterMovie, [keterPatch]);
	assert.equal(keterRevised.scenes[6].name, 'Scene Seven — Revised');
	assert.equal(keterMovie.scenes[6].name === 'Scene Seven — Revised', false);
	assert.deepEqual(keterRevised.scenes[0], keterMovie.scenes[0]);
});

test('revision service supports explicit patches with undo and redo', async () => {
	const keterMovie = createThreeMinuteMovie();
	const keterSceneId = keterMovie.scenes[0].id;
	const keterService = new TiferesMovieRevisionService(keterMovie);
	const keterPatch = yesodMoviePatch(
		MoviePatchKind.SET_SCENE_FIELD,
		{ sceneId: keterSceneId, field: 'name' },
		'Opening — New Light'
	);
	const keterRevised = await keterService.revise('Rename opening', [keterPatch]);
	assert.equal(keterRevised.scenes[0].name, 'Opening — New Light');
	assert.notEqual(keterService.undo().scenes[0].name, 'Opening — New Light');
	assert.equal(keterService.redo().scenes[0].name, 'Opening — New Light');
});
