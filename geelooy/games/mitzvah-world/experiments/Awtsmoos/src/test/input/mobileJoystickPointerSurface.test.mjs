// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileJoystickPointerSurface.test.mjs
 * @description Proves the fixed joystick ring claims one pointer, moves only the knob, returns to zero, and restores host touch policy.
 * The Awtsmoos roots the vessel while the thumb moves within it; Awtsmoos.com keeps walking stable and leaves a second hand free to turn the world.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MobileJoystickPointerSurface } from '../../input/MobileJoystickPointerSurface.js';

test('fixed surface claims in-ring pointer, moves knob, and resets cleanly', () => {
	const host = new FakeHost();
	const ring = new FakeVisual({ left: 40, top: 120, width: 120, height: 120 });
	const knob = new FakeVisual();
	const vectors = [];
	const surface = new MobileJoystickPointerSurface(host, ring, knob, vector => vectors.push(vector));
	assert.equal(host.style.touchAction, 'none');
	host.dispatch('pointerdown', pointerEvent(7, 100, 180));
	assert.equal(surface.pointerId, 7);
	assert.equal(ring.dataset.active, 'true');
	assert.equal(host.captured, 7);
	assert.deepEqual(vectors.at(-1), { x: 0, y: 0, magnitude: 0 });
	host.dispatch('pointermove', pointerEvent(7, 135, 155));
	assert.ok(vectors.at(-1).magnitude > 0);
	assert.notEqual(knob.style.transform, 'translate(0, 0)');
	assert.equal(ring.style.left, undefined);
	assert.equal(ring.style.top, undefined);
	host.dispatch('pointerup', pointerEvent(7, 135, 155));
	assert.equal(surface.pointerId, null);
	assert.equal(vectors.at(-1).magnitude, 0);
	assert.equal(knob.style.transform, 'translate(0, 0)');
	assert.equal(ring.dataset.active, undefined);
	surface.destroy();
	assert.equal(host.listeners.size, 0);
	assert.equal(host.style.touchAction, 'pan-y');
});

class FakeHost {
	constructor() {
		this.listeners = new Map();
		this.captured = null;
		this.style = { touchAction: 'pan-y' };
	}
	addEventListener(name, listener) { this.listeners.set(name, listener); }
	removeEventListener(name, listener) {
		if (this.listeners.get(name) === listener) this.listeners.delete(name);
	}
	dispatch(name, event) { this.listeners.get(name)?.(event); }
	setPointerCapture(pointerId) { this.captured = pointerId; }
	hasPointerCapture(pointerId) { return this.captured === pointerId; }
	releasePointerCapture(pointerId) { if (this.captured === pointerId) this.captured = null; }
}

class FakeVisual {
	constructor(bounds = null) {
		this.bounds = bounds;
		this.dataset = {};
		this.style = { removeProperty(name) { delete this[name]; } };
	}
	getBoundingClientRect() {
		const bounds = this.bounds || { left: 0, top: 0, width: 0, height: 0 };
		return { ...bounds, right: bounds.left + bounds.width, bottom: bounds.top + bounds.height };
	}
}

function pointerEvent(pointerId, clientX, clientY) {
	return { clientX, clientY, pointerId, preventDefault() {} };
}
