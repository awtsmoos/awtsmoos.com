// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cameraModeToggle.test.mjs
 * @description Proves third-person defaults and deterministic switching to and from first person.
 * RESPONSIBILITY: verify controller mode, UI presentation, next-mode logic, and event delivery.
 * NON-RESPONSIBILITY: this test does not claim measured FPS or inspect browser pixels.
 * The Awtsmoos renews every viewpoint while time continues independently; Awtsmoos.com checks
 * that perspective switches cleanly without changing the meaning of frames per second.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { CameraOrbitController } from '../../camera/CameraOrbitController.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import {
	cameraModePresentation,
	nextCameraMode
} from '../../ui/CameraModePresentation.js';

function fakeCanvas() {
	return {
		addEventListener() {},
		setPointerCapture() {},
		style: {}
	};
}

test('camera controller defaults to third-person orbit', () => {
	const controller = new CameraOrbitController(fakeCanvas());
	assert.equal(controller.mode, 'orbit');
	assert.equal(controller.isFirstPerson(), false);
	assert.equal(controller.distance, 7);
});

test('camera modes alternate in both directions', () => {
	assert.equal(nextCameraMode('orbit'), 'firstPerson');
	assert.equal(nextCameraMode('firstPerson'), 'orbit');
	const controller = new CameraOrbitController(fakeCanvas());
	controller.setMode('firstPerson');
	assert.equal(controller.isFirstPerson(), true);
	controller.setMode('orbit');
	assert.equal(controller.isFirstPerson(), false);
});

test('visible presentation describes current and next viewpoints', () => {
	const third = cameraModePresentation('orbit');
	assert.equal(third.activeLabel, '3rd Person');
	assert.equal(third.pressed, false);
	assert.match(third.ariaLabel, /first-person/);
	const first = cameraModePresentation('firstPerson');
	assert.equal(first.activeLabel, '1st Person');
	assert.equal(first.pressed, true);
	assert.match(first.ariaLabel, /third-person/);
});

test('event bus delivers the camera toggle intention', () => {
	const bus = new AwtsmoosEventBus();
	let calls = 0;
	const unsubscribe = bus.on('camera:toggle', () => {
		calls += 1;
	});
	bus.emit('camera:toggle');
	unsubscribe();
	bus.emit('camera:toggle');
	assert.equal(calls, 1);
	assert.equal(bus.history[0].type, 'camera:toggle');
});
