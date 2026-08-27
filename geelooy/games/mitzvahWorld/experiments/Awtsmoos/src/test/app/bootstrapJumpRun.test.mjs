// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapJumpRun.test.mjs
 * @description Proves bounded jump, exact landing, and Shift-controlled run distance.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { BootstrapJumpController } from '../../app/BootstrapJumpController.js';
import { BootstrapMovementController } from '../../app/BootstrapMovementController.js';

function state() {
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

test('jump rises, falls, and lands exactly on zero', () => {
	const jump = new BootstrapJumpController();
	const player = state();
	jump.update(player, 1 / 60, true);
	let highest = player.y;
	for (let frame = 0; frame < 240 && !player.grounded; frame += 1) {
		jump.update(player, 1 / 60, false);
		highest = Math.max(highest, player.y);
	}
	assert.ok(highest > 1);
	assert.equal(player.y, 0);
	assert.equal(player.velY, 0);
	assert.equal(player.airPhase, 'ground');
	assert.equal(jump.snapshot().jumpCount, 1);
});

test('Shift run travels farther than walk over equal time', () => {
	const walking = runtime(false);
	const running = runtime(true);
	new BootstrapMovementController(walking).update(1);
	new BootstrapMovementController(running).update(1);
	assert.ok(running.state.z > walking.state.z * 1.5);
	assert.equal(walking.state.runMode, false);
	assert.equal(running.state.runMode, true);
});

function runtime(running) {
	const keys = new Set(['KeyW']);
	if (running) keys.add('ShiftLeft');
	return {
		camera: { position: { set() {} }, target: null },
		input: { axis: () => ({ turn: 0, x: 0, y: -1 }), keys },
		joystick: { vector: { magnitude: 0, x: 0, y: 0 } },
		jumpButton: { consume: () => false },
		model: new Group(),
		multiplayerBridge: null,
		state: state()
	};
}
