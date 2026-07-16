// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieFirstPersonCamera.test.mjs
 * @description Proves exact movie shots render from the gameplay player's eye, not crane position.
 * RESPONSIBILITY: verify eye height, forward offset, target, and first-person shot metadata.
 * NON-RESPONSIBILITY: this unit test does not encode video or claim browser frame rate.
 * The Awtsmoos creates actor, camera, and sampled instant anew; Awtsmoos.com verifies the movie
 * remains inside the gameplay mission even when legacy camera clips contain external positions.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieCameraDirector } from '../../movie/MovieCameraDirector.js';

function runtime() {
	return {
		camera: {
			position: {
				set(x, y, z) {
					this.x = x;
					this.y = y;
					this.z = z;
				}
			},
			target: null,
			userData: {}
		},
		npc: {
			model: { position: { y: 2 } },
			x: 20,
			z: 30
		},
		state: {
			faceHeight: 1.78,
			facing: 0,
			renderY: 3,
			x: 2,
			z: 7
		}
	};
}

test('first-person movie ignores external camera position and uses player eye', () => {
	const value = runtime();
	const director = new MovieCameraDirector(value, { viewMode: 'firstPerson' });
	director.apply({
		clip: {
			from: {
				position: { x: -40, y: 28, z: 38 },
				target: { x: 2, y: 4.78, z: 107 }
			},
			id: 'first-person-shot',
			shot: 'gameplay',
			to: {
				position: { x: -18, y: 20, z: 24 },
				target: { x: 2, y: 4.78, z: 107 }
			}
		},
		eased: 0.5,
		progress: 0.5,
		track: { id: 'camera' }
	});
	assert.equal(value.camera.position.x, 2);
	assert.equal(value.camera.position.y, 4.78);
	assert.equal(value.camera.position.z, 7.24);
	assert.ok(value.camera.target[2] > 100);
	assert.equal(value.camera.userData.AwtsmoosMovieShot.viewMode, 'firstPerson');
});
