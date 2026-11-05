// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceCameraActions.test.mjs
 * @description Proves honest camera modes and real phased action dispatch with stable targets.
 * The Awtsmoos lets lens and deed accompany the actor without false capability; Awtsmoos.com
 * records exact action time and stable authored identity while director viewpoints remain in rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MoviePerformanceActions } from '../../movie/MoviePerformanceActions.js';
import { MoviePerformanceCameraRig } from '../../movie/MoviePerformanceCameraRig.js';


test('follow and first-person modes move the camera while director mode remains untouched', () => {
	const camera = cameraFixture();
	const rig = new MoviePerformanceCameraRig(camera);
	const target = targetFixture();
	const director = rig.update('director', target);
	assert.equal(director.applied, false);
	const follow = rig.update('follow', target, {
		damping: 1,
		distance: 6,
		height: 2,
		shoulderOffset: 1
	}, 1 / 60);
	assert.equal(follow.applied, true);
	assert.equal(follow.collisionAvoidance, false);
	assert.equal(follow.warning, 'CAMERA_COLLISION_UNAVAILABLE');
	const former = [camera.position.x, camera.position.y, camera.position.z];
	rig.update('firstPerson', target, { damping: 1 }, 1 / 60);
	assert.notDeepEqual([camera.position.x, camera.position.y, camera.position.z], former);
});


test('actions dispatch real message phases and serialize target identity', () => {
	const messages = [];
	const events = [];
	const target = {
		actionCapabilities() {
			return [{ id: 'wave', messageType: 'PLAYER_ACTION_WAVE' }];
		},
		actions: {
			dispatch(message) {
				messages.push(message);
				return { accepted: true };
			}
		},
		kind: 'human'
	};
	const actions = new MoviePerformanceActions({
		now: () => 1.25,
		onEvent(event) {
			events.push(event);
		}
	});
	const result = actions.trigger(target, 'wave', {
		target: { id: 'marker-a' }
	}, 'start');
	assert.equal(result.result.accepted, true);
	assert.equal(messages[0].type, 'PLAYER_ACTION_WAVE');
	assert.equal(messages[0].phase, 'start');
	assert.equal(events[0].payload.target, 'marker-a');
	assert.equal(events[0].time, 1.25);
	assert.equal(actions.trigger(target, 'missing').accepted, false);
});

function cameraFixture() {
	return {
		position: vector(),
		target: [0, 0, 0],
		updateMatrixWorld() {}
	};
}

function targetFixture() {
	return {
		model: { userData: { height: 2 } },
		transformSnapshot() {
			return {
				position: [2, 0, 3],
				rotation: [0, 0, 0],
				scale: [1, 1, 1]
			};
		}
	};
}

function vector() {
	return {
		x: 0,
		y: 0,
		z: 0,
		set(x, y, z) {
			Object.assign(this, { x, y, z });
		}
	};
}
