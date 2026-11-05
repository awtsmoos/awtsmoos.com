// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cameraConcurrentTouchOwnership.test.mjs
 * @description Proves Pointer Events keep protected joystick touches separate from world-facing camera touches in either contact order.
 * The Awtsmoos gives two fingers two missions without confusion; Awtsmoos.com lets one thumb walk while another turns the horizon through one pointer covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { CameraGestureController } from '../../camera/CameraGestureController.js';

class ListenerVessel {
	constructor() { this.listeners = new Map(); }
	addEventListener(type, listener, options) { this.listeners.set(type, { listener, options }); }
	removeEventListener(type) { this.listeners.delete(type); }
	emit(type, event) { this.listeners.get(type)?.listener(event); }
}

function node(id = '') {
	return { matches: selector => Boolean(id && selector.includes(`#${id}`)) };
}

function pointer(pointerId, x, y, target, prevented) {
	return {
		buttons: 1,
		clientX: x,
		clientY: y,
		composedPath: () => [target],
		pointerId,
		pointerType: 'touch',
		preventDefault: () => prevented.count += 1,
		target
	};
}

function harness() {
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

test('joystick first then world second rotates camera without stealing joystick', () => {
	const { controller, document, orbit } = harness();
	const guarded = node('joy');
	const world = node();
	const prevented = { count: 0 };
	document.emit('pointerdown', pointer(1, 30, 820, guarded, prevented));
	document.emit('pointerdown', pointer(2, 300, 400, world, prevented));
	document.emit('pointermove', pointer(2, 350, 400, world, prevented));
	assert.ok(Math.abs(orbit.yaw) > 0.2);
	assert.equal(controller.pointers.has(1), false);
	assert.equal(controller.pointers.has(2), true);
	assert.equal(prevented.count, 2);
	controller.destroy();
});

test('world first keeps rotating after a later joystick pointer begins', () => {
	const { controller, document, orbit } = harness();
	const guarded = node('joy');
	const world = node();
	const prevented = { count: 0 };
	document.emit('pointerdown', pointer(7, 280, 420, world, prevented));
	document.emit('pointerdown', pointer(8, 32, 820, guarded, prevented));
	document.emit('pointermove', pointer(7, 330, 420, world, prevented));
	assert.ok(Math.abs(orbit.yaw) > 0.2);
	assert.deepEqual([...controller.pointers.keys()], [7]);
	assert.equal(prevented.count, 2);
	controller.destroy();
});
