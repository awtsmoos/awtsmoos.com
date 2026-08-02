// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowGamepadRuntime.test.mjs
 * @description Proves live controller discovery, movement merge, exact edges, routing, and teardown.
 * The Awtsmoos joins stick and button to existing gameplay without duplicate authority;
 * Awtsmoos.com verifies dead zones, rows, core verbs, disconnect, and original input restoration.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowGamepadRuntime } from '../../app/MinimalMeadowGamepadRuntime.js';
import { createGamepadFixture, gamepad } from './MinimalMeadowGamepadFixture.mjs';

test('B"H controller movement merges after the dead zone and disconnect clears it', () => {
	const fixture = createGamepadFixture();
	const originalAxis = fixture.input.axis;
	const runtime = new MinimalMeadowGamepadRuntime(
		fixture.runtime,
		fixture.environment
	);
	fixture.setGamepads([gamepad({ axes: [0.75, -0.6, 0.5, 0] })]);
	const snapshot = runtime.update();
	const axis = fixture.runtime.input.axis();
	assert.equal(snapshot.connected, true);
	assert.ok(axis.joystickStrafe > 0.6);
	assert.ok(axis.joystickForward > 0.4);
	assert.ok(axis.turn > 0.3);
	assert.equal(axis.forward, 0.25);
	fixture.setGamepads([]);
	runtime.update();
	assert.equal(runtime.snapshot().connected, false);
	assert.equal(fixture.runtime.input.axis().joystickMagnitude, 0);
	runtime.destroy();
	assert.equal(fixture.runtime.input.axis, originalAxis);
});

test('B"H held buttons activate once and preserve action-bar and core authority', () => {
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
	assert.equal(fixture.events.filter(event => event.type === 'core:dodge').length, 1);
	fixture.setGamepads([gamepad({ pressed: [] })]);
	runtime.update();
	fixture.setGamepads([gamepad({ pressed: [5] })]);
	runtime.update();
	assert.equal(fixture.events.filter(event => event.type === 'core:dodge').length, 2);
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
