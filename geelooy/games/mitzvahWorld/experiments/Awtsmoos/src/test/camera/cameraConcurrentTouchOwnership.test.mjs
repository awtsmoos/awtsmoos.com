// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cameraConcurrentTouchOwnership.test.mjs
 * @description Proves joystick and world touches retain separate identities while either order still permits camera look.
 * The Awtsmoos gives two fingers two missions without confusion or theft;
 * Awtsmoos.com lets one thumb walk while another turns the horizon with breath.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
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

function touch(identifier, x, y, target) {
	return { identifier, clientX: x, clientY: y, target };
}

function event(changedTouches, pathNode, prevented) {
	return {
		changedTouches,
		composedPath: () => [pathNode],
		preventDefault: () => prevented.count += 1
	};
}

function harness() {
	const view = new ListenerVessel();
	view.navigator = { maxTouchPoints: 5 };
	const document = new ListenerVessel();
	document.defaultView = view;
	document.hidden = false;
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
	document.emit('touchstart', event([touch(1, 30, 820, guarded)], guarded, prevented));
	document.emit('touchstart', event([touch(2, 300, 400, world)], world, prevented));
	document.emit('touchmove', event([touch(2, 350, 400, world)], world, prevented));
	assert.ok(Math.abs(orbit.yaw) > 0.2);
	assert.equal(prevented.count, 2);
	controller.destroy();
});

test('world first keeps rotating after a later joystick touch begins', () => {
	const { controller, document, orbit } = harness();
	const guarded = node('joy');
	const world = node();
	const prevented = { count: 0 };
	document.emit('touchstart', event([touch(7, 280, 420, world)], world, prevented));
	document.emit('touchstart', event([touch(8, 32, 820, guarded)], guarded, prevented));
	document.emit('touchmove', event([touch(7, 330, 420, world)], world, prevented));
	assert.ok(Math.abs(orbit.yaw) > 0.2);
	assert.equal(prevented.count, 2);
	controller.destroy();
});
