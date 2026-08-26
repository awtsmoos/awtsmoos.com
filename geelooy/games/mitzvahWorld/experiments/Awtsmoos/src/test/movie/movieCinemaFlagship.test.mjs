// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCinemaFlagship.test.mjs
 * @description Proves the flagship is sixty seconds of six patient views using ten wardrobe-indexed Chossid actors and real-world intent.
 * The Awtsmoos renews speaker, river, tree, garment, and camera before a test may count them;
 * Awtsmoos.com verifies a living crowd without surrendering water, wind, dialogue, measured lenses, or determinism.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMovieAgentManifest } from '../../movie/MovieAgentCompiler.js';
import { analyzeMovieCinemaManifest } from '../../movie/MovieCinemaAnalyzer.js';
import { createMovieCinemaFlagship } from '../../movie/MovieCinemaFlagship.js';

const CHOSSID_MODEL = 'assets/models/player/chossid.glb';

test('flagship composes one minute as six rich ten-person Chossid village views', () => {
	const manifest = createMovieCinemaFlagship();
	const analysis = analyzeMovieCinemaManifest(manifest);
	assert.equal(manifest.duration, 60);
	assert.equal(manifest.fps, 24);
	assert.equal(manifest.scenes.length, 6);
	assert.equal(manifest.characters.length, 10);
	assert.equal(new Set(manifest.characters.map(actor => actor.costume?.outfitId)).size, 10);
	assert.deepEqual(manifest.characters.map(actor => actor.friendlyNpcIndex), Array.from({ length: 10 }, (_, index) => index));
	assert.equal(analysis.expectedFrames, 1440);
	assert.equal(analysis.segmentCount, 4);
	assert.equal(analysis.cameraRigs.length, 6);
	assert.equal(analysis.dialogueBeatCount, 3);
	assert.deepEqual(analysis.ambienceKinds, ['water', 'wind']);
	assert.equal(analysis.hasMusic, false);
	assert.equal(analysis.hasSoundEffects, false);
	assert.deepEqual(analysis.warnings, []);
	for (const feature of ['grass', 'trees', 'river', 'water', 'buildings', 'courtyard', 'paths', 'mountains', 'village']) {
		assert.ok(analysis.environmentFeatures.includes(feature), feature);
	}
	for (const actor of manifest.characters) {
		assert.equal(actor.model, CHOSSID_MODEL);
		assert.equal(actor.source, 'friendlyNpc');
	}
});

test('flagship compiles to six ten-second camera clips with dense truthful crowd choreography', () => {
	const project = compileMovieAgentManifest(createMovieCinemaFlagship());
	const scenes = track(project, 'scene').clips;
	const cameras = track(project, 'camera').clips;
	const dialogue = track(project, 'dialogue').clips;
	const audio = track(project, 'audio').clips;
	const crowd = tracks(project, 'crowd').flatMap(candidate => candidate.clips);
	assert.equal(project.duration, 60);
	assert.equal(scenes.length, 6);
	assert.equal(cameras.length, 6);
	assert.ok(crowd.length >= 20);
	assert.deepEqual(scenes.map(scene => scene.start), [0, 10, 20, 30, 40, 50]);
	assert.ok(scenes.every(scene => scene.duration === 10));
	assert.ok(cameras.every(camera => camera.duration === 10));
	assert.equal(dialogue.length, 3);
	assert.ok(audio.some(clip => clip.kind === 'wind'));
	assert.ok(audio.some(clip => clip.kind === 'water'));
	assert.ok(crowd.some(clip => clip.action === 'greet'));
	assert.ok(crowd.some(clip => clip.action === 'pray'));
	assert.ok(crowd.some(clip => clip.action === 'talk'));
	assert.doesNotThrow(() => JSON.stringify(project));
});

test('flagship keeps real-world and safe-human intent explicit', () => {
	const manifest = createMovieCinemaFlagship();
	const world = manifest.scenes[0].world;
	assert.equal(world.id, 'cinema-flagship-village-613');
	assert.equal(world.regionId, 'cedar-terraces');
	assert.equal(world.packageId, 'kedem-highlands');
	assert.match(world.prompt, /river and lake water/i);
	assert.match(world.atmosphere.ambience, /wind.*river water/i);
	assert.ok(world.assets.includes('assets/models/player/chossid.glb'));
	assert.ok(world.assets.includes('world/river-water'));
	for (const actor of manifest.characters) {
		for (const forbidden of ['bones', 'boneTransforms', 'deform', 'morphTargets', 'skeleton', 'skinWeights']) {
			assert.equal(Object.hasOwn(actor, forbidden), false, `${actor.id}:${forbidden}`);
		}
	}
});

function track(project, type) {
	const value = project.tracks.find(candidate => candidate.type === type);
	assert.ok(value, `${type} track missing`);
	return value;
}

function tracks(project, type) {
	return project.tracks.filter(candidate => candidate.type === type);
}
