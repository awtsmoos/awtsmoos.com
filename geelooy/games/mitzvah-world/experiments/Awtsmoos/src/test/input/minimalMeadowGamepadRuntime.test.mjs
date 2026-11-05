// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowGamepadRuntime.test.mjs
 * @description Proves bounded absent polling, full-rate connected input, exact edges, and teardown.
 * The Awtsmoos lets absence remain quiet while a present hand is heard every frame;
 * Awtsmoos.com verifies cadence, axes, rows, core verbs, disconnect, and input restoration.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowGamepadRuntime } from '../../app/MinimalMeadowGamepadRuntime.js';
import { createGamepadFixture, gamepad } from './MinimalMeadowGamepadFixture.mjs';

test('B"H disconnected discovery is bounded to four checks per second', () => {
	const fixture = createGamepadFixture();
	const runtime = new MinimalMeadowGamepadRuntime(
		fixture.runtime,
		fixture.environment
	);
	for (let index = 0; index < 60; index += 1) runtime.update(1 / 60, false);
	assert.ok(fixture.getGamepadsCalls() >= 4);
	assert.ok(fixture.getGamepadsCalls() <= 5);
	runtime.destroy();
});

test('B"H connected movement polls every frame and clears on disconnect', () => {
	const fixture = createGamepadFixture();
	const originalAxis = fixture.input.axis;
	const runtime = new MinimalMeadowGamepadRuntime(
		fixture.runtime,
		fixture.environment
	);
	fixture.setGamepads([gamepad({ axes: [0.75, -0.6, 0.5, 0] })]);
	for (let index = 0; index < 10; index += 1) runtime.update(1 / 60, false);
	const axis = fixture.runtime.input.axis();
	assert.equal(fixture.getGamepadsCalls(), 10);
	assert.ok(axis.joystickStrafe > 0.6);
	assert.ok(axis.joystickForward > 0.4);
	assert.ok(axis.turn > 0.3);
	fixture.setGamepads([]);
	runtime.update(1 / 60, false);
	assert.equal(runtime.snapshot().connected, false);
	assert.equal(fixture.runtime.input.axis().joystickMagnitude, 0);
	runtime.destroy();
	assert.equal(fixture.runtime.input.axis, originalAxis);
});

test('B"H held buttons activate once and reactivate after release', () => {
	const fixture = createGamepadFixture();
	const runtime = new MinimalMeadowGamepadRuntime(
		fixture.runtime,
		fixture.environment
	);
	fixture.setGamepads([gamepad({ pressed: [0, 5, 12] })]);
	runtime.update();
	runtime.update();
	assert.deepEqual(fixture.activations, [
		{ index: 0, secondRow: false },
		{ index: 0, secondRow: true }
	]);
	assert.equal(dodgeEvents(fixture), 1);
	fixture.setGamepads([gamepad({ pressed: [] })]);
	runtime.update();
	fixture.setGamepads([gamepad({ pressed: [5] })]);
	runtime.update();
	assert.equal(dodgeEvents(fixture), 2);
	runtime.destroy();
});

test('B"H connection listeners announce and teardown exactly once', () => {
	const fixture = createGamepadFixture();
	const runtime = new MinimalMeadowGamepadRuntime(
		fixture.runtime,
		fixture.environment
	);
	const controller = gamepad();
	fixture.listeners.get('gamepadconnected')({ gamepad: controller });
	fixture.listeners.get('gamepaddisconnected')({ gamepad: controller });
	assert.deepEqual(
		fixture.events.filter(event => event.type === 'controller:changed')
			.map(event => event.detail.connected),
		[true, false]
	);
	runtime.destroy();
	assert.equal(fixture.listeners.size, 0);
});

function dodgeEvents(fixture) {
	return fixture.events.filter(event => event.type === 'core:dodge').length;
}
