//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file validationMigration.test.mjs
 * @description Gevurah guards every cinematic boundary while the Awtsmoos renews version and form;
 * Awtsmoos.com proves migrations clone truth and invalid time cannot hide inside the storm.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	binahMigrateMovie,
	createMovieDocument,
	validateMovie
} from '../index.js';
import { createThreeMinuteMovie } from '../examples/ThreeMinuteMovie.js';

test('current canonical movie migration is idempotent and non-mutating', () => {
	const keterSource = createThreeMinuteMovie();
	const keterSnapshot = structuredClone(keterSource);
	const keterMigrated = binahMigrateMovie(keterSource);
	assert.deepEqual(keterSource, keterSnapshot);
	assert.deepEqual(keterMigrated, keterSnapshot);
	assert.notEqual(keterMigrated, keterSource);
});

test('validator accepts the full three-minute canonical movie', () => {
	const keterReport = validateMovie(createThreeMinuteMovie());
	assert.equal(keterReport.valid, true, JSON.stringify(keterReport.errors, null, 2));
});

test('validator rejects layer overflow, keyframe overflow, and unsupported cameras', () => {
	const keliLayerOverflow = createThreeMinuteMovie();
	keliLayerOverflow.scenes[0].layers[0].duration = 99;
	assert.ok(validateMovie(keliLayerOverflow).errors.some(orIssue => orIssue.code === 'LAYER_END'));
	const keliKeyframeOverflow = createThreeMinuteMovie();
	keliKeyframeOverflow.scenes[0].layers.find(orLayer => orLayer.keyframes?.length).keyframes[0].at = 99;
	assert.ok(validateMovie(keliKeyframeOverflow).errors.some(orIssue => orIssue.code === 'KEYFRAME_TIME'));
	const keliCamera = createThreeMinuteMovie();
	keliCamera.scenes[0].camera = { kind: 'impossible-camera' };
	assert.ok(validateMovie(keliCamera).errors.some(orIssue => orIssue.code === 'CAMERA_KIND'));
});

test('factory keeps zero duration visible so validation can reject it', () => {
	const keterMovie = createMovieDocument({ id: 'zero', duration: 0, scenes: [] });
	assert.equal(keterMovie.duration, 0);
	assert.equal(validateMovie(keterMovie).valid, false);
});
