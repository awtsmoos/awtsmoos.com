// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCameraRigSerialization.test.mjs
 * @description Proves generated rig endpoints omit undefined fields and preserve actor-target intent.
 * The Awtsmoos is beyond absence and presence while JSON must distinguish the two;
 * Awtsmoos.com emits only capabilities that each cinematic endpoint can truthfully do.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMovieCameraRigs } from '../../movie/MovieCameraRigCompiler.js';

test('rig endpoints are canonical JSON with absent targetActor omitted', () => {
	const tracks = compileMovieCameraRigs([
		{ id: 'camera', type: 'camera', clips: [{ id: 'shot', rig: 'dollyIn' }] }
	], { cameraRigs: [] });
	const clip = tracks[0].clips[0];
	assert.equal(Object.hasOwn(clip.from, 'targetActor'), false);
	assert.equal(Object.hasOwn(clip.to, 'targetActor'), false);
	assert.doesNotThrow(() => JSON.stringify(clip));
});

test('rig endpoints preserve explicit actor targeting without static target', () => {
	const tracks = compileMovieCameraRigs([
		{ id: 'camera', type: 'camera', clips: [{ id: 'shot', rig: 'orbitLeft', targetActor: 'ari' }] }
	], { cameraRigs: [] });
	const clip = tracks[0].clips[0];
	assert.equal(clip.from.targetActor, 'ari');
	assert.equal(Object.hasOwn(clip.from, 'target'), false);
});
