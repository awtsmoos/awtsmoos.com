// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCinemaFlagship.test.mjs
 * @description Proves the flagship is a real sixty-second, twelve-scene, environment-rich Chossid cinema manifest.
 * The Awtsmoos renews every scene before enumeration; Awtsmoos.com verifies that many
 * camera vessels, intact humans, grass, trees, buildings, courtyard, paths, and mountains remain one film.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMovieAgentManifest } from '../../movie/MovieAgentCompiler.js';
import { analyzeMovieCinemaManifest } from '../../movie/MovieCinemaAnalyzer.js';
import { createMovieCinemaFlagship } from '../../movie/MovieCinemaFlagship.js';

test('flagship composes one minute, twelve shots, eight Chossid actors, and rich environment', () => {
	const manifest = createMovieCinemaFlagship();
	const analysis = analyzeMovieCinemaManifest(manifest);
	assert.equal(manifest.duration, 60);
	assert.equal(manifest.fps, 24);
	assert.equal(manifest.scenes.length, 12);
	assert.equal(manifest.characters.length, 8);
	assert.equal(analysis.expectedFrames, 1440);
	assert.equal(analysis.segmentCount, 4);
	assert.equal(analysis.cameraRigs.length, 12);
	assert.equal(analysis.hasMusic, false);
	assert.equal(analysis.hasSoundEffects, false);
	assert.deepEqual(analysis.warnings, []);
	for (const feature of ['grass', 'trees', 'buildings', 'courtyard', 'paths', 'mountains']) {
		assert.ok(analysis.environmentFeatures.includes(feature), feature);
	}
});

test('flagship compiles into deterministic project tracks without empty scene gaps', () => {
	const project = compileMovieAgentManifest(createMovieCinemaFlagship());
	const scenes = project.tracks.find(track => track.type === 'scene').clips;
	const cameras = project.tracks.find(track => track.type === 'camera').clips;
	assert.equal(project.duration, 60);
	assert.equal(scenes.length, 12);
	assert.equal(cameras.length, 12);
	assert.deepEqual(scenes.map(scene => scene.start), [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
	assert.ok(cameras.every(camera => camera.duration === 5));
	assert.doesNotThrow(() => JSON.stringify(project));
});
