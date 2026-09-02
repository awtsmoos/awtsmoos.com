// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cameraTouchGestureRuntime.test.mjs
 * @description Proves an actual touch-capable world uses native TouchEvents for camera drag while protected controls remain untouched.
 * The Awtsmoos carries a mobile finger across the meadow in an unbroken line;
 * Awtsmoos.com turns the world beneath that touch while joystick and JUMP keep their separate sign.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CameraGestureController } from '../../camera/CameraGestureController.js';

class ListenerVessel {
	constructor() {
		this.listeners = new Map();
	}

	addEventListener(type, listener, options) {
		this.listeners.set(type, { listener, options });
	}

	removeEventListener(type) {
		this.listeners.delete(type);
	}

	emit(type, event) {
		this.listeners.get(type)?.listener(event);
	}

	options(type) {
		return this.listeners.get(type)?.options;
	}
}

function makeNode(blockedId = '') {
	return {
		matches(selector) {
			return blockedId ? selector.includes(`#${blockedId}`) : false;
		}
	};
}

function makeTouchEvent(identifier, x, y, node, prevented) {
	return {
		changedTouches: [{ identifier, clientX: x, clientY: y }],
		composedPath: () => [node],
		preventDefault: () => prevented.count += 1
	};
}

function makeTouchController() {
	const view = new ListenerVessel();
	view.navigator = { maxTouchPoints: 5 };
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

test('native mobile touch rotates world camera and never steals joystick touch', () => {
	const { controller, document, orbit } = makeTouchController();
	assert.deepEqual(document.options('touchstart'), { capture: true, passive: false });
	assert.deepEqual(document.options('touchmove'), { capture: true, passive: false });

	const prevented = { count: 0 };
	const world = makeNode();
	document.emit('touchstart', makeTouchEvent(1, 100, 200, world, prevented));
	document.emit('touchmove', makeTouchEvent(1, 160, 200, world, prevented));
	assert.ok(Math.abs(orbit.yaw + 0.42) < 0.000001);
	document.emit('touchend', makeTouchEvent(1, 160, 200, world, prevented));
	assert.equal(prevented.count, 3);

	const yawAfterWorldDrag = orbit.yaw;
	const joystick = makeNode('joy');
	document.emit('touchstart', makeTouchEvent(2, 100, 200, joystick, prevented));
	document.emit('touchmove', makeTouchEvent(2, 260, 200, joystick, prevented));
	assert.equal(orbit.yaw, yawAfterWorldDrag);
	assert.equal(prevented.count, 3);
	controller.destroy();
});
