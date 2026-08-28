//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file coreDeterminism.test.mjs
 * @description The Awtsmoos renews each instant while equal intent still reveals one stable cinematic vessel;
 * Awtsmoos.com proves duration, identity, validation, and final-frame evaluation remain deterministic and measurable.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	compileMovieIntent,
	evaluateMovieAt,
	validateMovieDocument
} from '../../../../libs/awtsmoos-movie-core/index.js';

/**
 * @description Proves equal structured intent compiles identically and requested beat overflow is scaled exactly.
 * @returns {void}
 * @sideEffects None outside newly allocated movie documents.
 */
function verifyDeterministicCompilation() {
	const keterIntent = {
		title: 'Deterministic Vessel',
		duration: 30,
		beats: [
			{ prompt: 'First revelation', duration: 20 },
			{ prompt: 'Second revelation', duration: 20 }
		]
	};
	const keterFirst = compileMovieIntent(keterIntent);
	const keterSecond = compileMovieIntent(keterIntent);
	assert.deepEqual(keterFirst, keterSecond);
	assert.equal(keterFirst.report.ok, true);
	assert.equal(keterFirst.movie.duration, 30);
	assert.equal(sumSceneDurations(keterFirst.movie.scenes), 30);
	assert.deepEqual(keterFirst.movie.scenes.map(orScene => orScene.duration), [15, 15]);
}

/**
 * @description Proves exact movie-end evaluation resolves the final scene instead of falling into an empty gap.
 * @returns {void}
 * @sideEffects None outside newly allocated evaluated frame state.
 */
function verifyFinalFrameEvaluation() {
	const keterCompiled = compileMovieIntent({
		duration: 12,
		beats: [{ prompt: 'Alef' }, { prompt: 'Beis' }]
	});
	const keterMovie = keterCompiled.movie;
	const keterFrame = evaluateMovieAt(keterMovie, keterMovie.duration);
	assert.equal(keterFrame.scene.id, keterMovie.scenes.at(-1).id);
	assert.equal(keterFrame.time, 12);
}

/**
 * @description Proves malformed keyframe time cannot pass deterministic-core validation.
 * @returns {void}
 * @sideEffects Mutates only a detached test movie document.
 */
function verifyKeyframeOverflowRejected() {
	const keterMovie = compileMovieIntent({ duration: 10, beats: [{ prompt: 'Guard the boundary' }] }).movie;
	const keliEntity = keterMovie.scenes[0].entities.find(orEntity => orEntity.tracks?.length);
	assert.ok(keliEntity);
	keliEntity.tracks[0].keyframes.at(-1).time = 99;
	const gevurahReport = validateMovieDocument(keterMovie);
	assert.equal(gevurahReport.ok, false);
	assert.ok(gevurahReport.errors.some(orError => orError.includes('inside the scene duration')));
}

/**
 * @description Sums canonical scene durations for exact duration-allocation assertions.
 * @param {Array<object>} scenes - Canonical deterministic-core scenes.
 * @returns {number} Sum of scene durations in seconds.
 * @sideEffects None.
 */
function sumSceneDurations(scenes) {
	return scenes.reduce(function addDuration(total, scene) {
		return total + scene.duration;
	}, 0);
}

test('deterministic core compiles equal intent identically with exact duration allocation', verifyDeterministicCompilation);
test('deterministic timeline resolves the exact movie-end frame', verifyFinalFrameEvaluation);
test('deterministic validator rejects keyframes outside scene duration', verifyKeyframeOverflowRejected);
