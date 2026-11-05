// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCameraLensAndRig.test.mjs
 * @description Proves absolute cinematic rigs retain position, target, and FOV through compilation and direction.
 * The Awtsmoos renews distance and breadth of sight in one frame; Awtsmoos.com verifies
 * that named default cameras become real live camera coordinates and lenses rather than metadata alone.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieCameraDirector } from '../../movie/MovieCameraDirector.js';
import { compileMovieCameraRigs } from '../../movie/MovieCameraRigCompiler.js';
import { createDefaultCameraRigs } from '../../movie/MovieDefaultCameraRigs.js';

function runtime() {
	let projectionUpdates = 0;
	return {
		camera: {
			fov: 45,
			position: {
				set(x, y, z) {
					Object.assign(this, { x, y, z });
				}
			},
			target: null,
			updateProjectionMatrix() {
				projectionUpdates += 1;
			},
			userData: {}
		},
		projectionUpdates: () => projectionUpdates,
		state: { faceHeight: 1.7, facing: 0, renderY: 0, x: 0, z: 0 }
	};
}

test('absolute default rig compiles its authored position, target, and lens', () => {
	const tracks = compileMovieCameraRigs([
		{ clips: [{ id: 'shot', rig: 'establishing-wide' }], id: 'camera', type: 'camera' }
	], { cameraRigs: createDefaultCameraRigs() });
	const clip = tracks[0].clips[0];
	assert.deepEqual(clip.from.position, { x: 0, y: 7, z: 16 });
	assert.deepEqual(clip.to.position, { x: 0, y: 7, z: 16 });
	assert.deepEqual(clip.from.target, { x: 0, y: 1.6, z: 0 });
	assert.equal(clip.fieldOfView, 38);
});

test('offset preset remains movable and omits an absent lens', () => {
	const tracks = compileMovieCameraRigs([
		{ clips: [{ anchor: [1, 2, 3], id: 'shot', rig: 'dollyIn' }], id: 'camera', type: 'camera' }
	], { cameraRigs: [] });
	const clip = tracks[0].clips[0];
	assert.deepEqual(clip.from.position, { x: 1, y: 6, z: 21 });
	assert.deepEqual(clip.to.position, { x: 1, y: 5.2, z: 10 });
	assert.equal(Object.hasOwn(clip, 'fieldOfView'), false);
});

test('director applies the compiled lens to the live camera and records it', () => {
	const value = runtime();
	const director = new MovieCameraDirector(value, { viewMode: 'legacy' });
	director.apply({
		clip: {
			fieldOfView: 68,
			from: { position: { x: 0, y: 2, z: 4 }, target: { x: 0, y: 1, z: 0 } },
			id: 'portrait',
			shot: 'portrait-close',
			to: { position: { x: 0, y: 2, z: 4 }, target: { x: 0, y: 1, z: 0 } }
		},
		eased: 0.5,
		progress: 0.5,
		track: { id: 'camera' }
	});
	assert.equal(value.camera.fov, 68);
	assert.equal(value.projectionUpdates(), 1);
	assert.equal(value.camera.userData.AwtsmoosMovieShot.fieldOfView, 68);
});
