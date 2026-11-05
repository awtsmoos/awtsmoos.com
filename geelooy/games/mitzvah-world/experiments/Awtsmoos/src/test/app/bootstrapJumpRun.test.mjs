//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file bootstrapJumpRun.test.mjs
 * @description Proves bounded jumping and meaningful run pace using realistic frame cadence.
 * The Awtsmoos renews each footfall frame by frame, never confusing one frozen instant with a journey's name;
 * Awtsmoos.com keeps the test aligned with the same bounded delta law that protects the living game.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { BootstrapJumpController } from '../../app/BootstrapJumpController.js';
import { BootstrapMovementController } from '../../app/BootstrapMovementController.js';

const FRAME_SECONDS = 1 / 60;
const ONE_SECOND_FRAMES = 60;

/**
 * @description Creates canonical grounded player state for movement and jump tests.
 * @returns {object} Fresh player state.
 */
function createPlayerState() {
	return {
		airPhase: 'ground',
		facing: 0,
		grounded: true,
		moving: false,
		renderY: 0,
		runMode: false,
		velY: 0,
		x: 0,
		y: 0,
		z: 0
	};
}

/**
 * @description Creates the smallest movement runtime needed to compare walk and Shift-run travel.
 * @param {boolean} running Whether Shift running is held.
 * @returns {object} Minimal movement runtime.
 */
function createMovementRuntime(running) {
	const keys = new Set(['KeyW']);

	if (running) {
		keys.add('ShiftLeft');
	}

	return {
		camera: { position: { set() {} }, target: null },
		input: { axis: () => ({ turn: 0, x: 0, y: -1 }), keys },
		joystick: { vector: { magnitude: 0, x: 0, y: 0 } },
		jumpButton: { consume: () => false },
		model: new Group(),
		multiplayerBridge: null,
		state: createPlayerState()
	};
}

/**
 * @description Advances a movement controller through one real-time second at sixty frames.
 * @param {BootstrapMovementController} controller Movement controller under test.
 * @returns {void}
 */
function advanceOneSecond(controller) {
	for (let frame = 0; frame < ONE_SECOND_FRAMES; frame += 1) {
		controller.update(FRAME_SECONDS);
	}
}

test('jump rises, falls, and lands exactly on zero', () => {
	const jump = new BootstrapJumpController();
	const player = createPlayerState();
	jump.update(player, FRAME_SECONDS, true);
	let highest = player.y;

	for (let frame = 0; frame < 240 && !player.grounded; frame += 1) {
		jump.update(player, FRAME_SECONDS, false);
		highest = Math.max(highest, player.y);
	}

	assert.ok(highest > 1);
	assert.equal(player.y, 0);
	assert.equal(player.velY, 0);
	assert.equal(player.airPhase, 'ground');
	assert.equal(jump.snapshot().jumpCount, 1);
});

test('Shift run travels materially farther than walk over one real second', () => {
	const walking = createMovementRuntime(false);
	const running = createMovementRuntime(true);
	advanceOneSecond(new BootstrapMovementController(walking));
	advanceOneSecond(new BootstrapMovementController(running));
	assert.ok(running.state.z > walking.state.z * 1.5);
	assert.equal(walking.state.runMode, false);
	assert.equal(running.state.runMode, true);
});
