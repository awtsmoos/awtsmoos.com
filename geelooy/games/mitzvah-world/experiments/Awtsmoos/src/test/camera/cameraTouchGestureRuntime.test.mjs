// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cameraTouchGestureRuntime.test.mjs
 * @description Proves touch-capable camera input flows through the canonical Pointer Events path while protected controls remain separate.
 * The Awtsmoos carries one mobile pointer across the meadow without double-listener confusion; Awtsmoos.com turns the world once while joystick and JUMP keep their own vessels.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { CameraGestureController } from '../../camera/CameraGestureController.js';

class ListenerVessel {
	constructor() { this.listeners = new Map(); }
	addEventListener(type, listener, options) { this.listeners.set(type, { listener, options }); }
	removeEventListener(type) { this.listeners.delete(type); }
	emit(type, event) { this.listeners.get(type)?.listener(event); }
	options(type) { return this.listeners.get(type)?.options; }
}

function makeNode(blockedId = '') {
	return { matches: selector => Boolean(blockedId && selector.includes(`#${blockedId}`)) };
}

function pointerEvent(pointerId, x, y, node, prevented, buttons = 1) {
	return {
		buttons,
		clientX: x,
		clientY: y,
		composedPath: () => [node],
		pointerId,
		pointerType: 'touch',
		preventDefault: () => prevented.count += 1,
		target: node
	};
}

function makeTouchController() {
	const view = new ListenerVessel();
	const document = new ListenerVessel();
	document.defaultView = view;
	document.hidden = false;
	document.pointerLockElement = null;
	const canvas = new ListenerVessel();
	canvas.ownerDocument = document;
	canvas.style = {};
	canvas.setPointerCapture = () => {};
	canvas.hasPointerCapture = () => false;
	canvas.releasePointerCapture = () => {};
	const orbit = { distance: 10, pitch: 0, yaw: 0 };
	return { controller: new CameraGestureController(canvas, orbit), document, orbit };
}

test('touch pointer rotates world camera and never steals joystick pointer', () => {
	const { controller, document, orbit } = makeTouchController();
	assert.deepEqual(document.options('pointerdown'), { capture: true, passive: false });
	assert.deepEqual(document.options('pointermove'), { capture: true, passive: false });

	const prevented = { count: 0 };
	const world = makeNode();
	document.emit('pointerdown', pointerEvent(1, 100, 200, world, prevented));
	document.emit('pointermove', pointerEvent(1, 160, 200, world, prevented));
	assert.ok(Math.abs(orbit.yaw + 0.42) < 0.000001);
	document.emit('pointerup', pointerEvent(1, 160, 200, world, prevented, 0));
	assert.equal(prevented.count, 2);

	const yawAfterWorldDrag = orbit.yaw;
	const joystick = makeNode('joy');
	document.emit('pointerdown', pointerEvent(2, 100, 200, joystick, prevented));
	document.emit('pointermove', pointerEvent(2, 260, 200, joystick, prevented));
	assert.equal(orbit.yaw, yawAfterWorldDrag);
	assert.equal(prevented.count, 2);
	controller.destroy();
});
