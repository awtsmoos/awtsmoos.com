// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cameraGestureScreenSurface.test.mjs
 * @description Proves a world-screen touch may rotate the camera while joystick-origin touches stay reserved.
 * The Awtsmoos gives the open world a turning hand and each control a faithful wall;
 * Awtsmoos.com restores the wide camera field of old without letting one touch command them all.
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

function makeTouch(pointerId, x, y, node) {
	return {
		clientX: x,
		clientY: y,
		pointerId,
		pointerType: 'touch',
		preventDefault() {},
		composedPath: () => [node]
	};
}

function makeNode(blockedId = '') {
	return {
		matches(selector) {
			return blockedId ? selector.includes(`#${blockedId}`) : false;
		}
	};
}

test('screen-wide world touch rotates orbit while joystick touch stays reserved', () => {
	const view = new ListenerVessel();
	const document = new ListenerVessel();
	document.defaultView = view;
	document.hidden = false;
	document.pointerLockElement = null;
	const captured = new Set();
	const canvas = new ListenerVessel();
	canvas.ownerDocument = document;
	canvas.style = {};
	canvas.setPointerCapture = id => captured.add(id);
	canvas.hasPointerCapture = id => captured.has(id);
	canvas.releasePointerCapture = id => captured.delete(id);
	const orbit = { distance: 10, pitch: 0, yaw: 0 };
	const controller = new CameraGestureController(canvas, orbit);

	assert.equal(document.options('pointerdown'), true);
	assert.equal(document.options('pointerup'), true);
	assert.equal(canvas.listeners.has('pointerdown'), false);

	const world = makeNode();
	document.emit('pointerdown', makeTouch(11, 100, 200, world));
	document.emit('pointermove', makeTouch(11, 160, 200, world));
	assert.ok(Math.abs(orbit.yaw + 0.42) < 0.000001);
	document.emit('pointerup', makeTouch(11, 160, 200, world));
	assert.equal(controller.pointers.size, 0);

	const yawAfterWorldDrag = orbit.yaw;
	const joystick = makeNode('joy');
	document.emit('pointerdown', makeTouch(22, 100, 200, joystick));
	document.emit('pointermove', makeTouch(22, 260, 200, joystick));
	assert.equal(orbit.yaw, yawAfterWorldDrag);
	assert.equal(controller.pointers.size, 0);

	controller.destroy();
});
