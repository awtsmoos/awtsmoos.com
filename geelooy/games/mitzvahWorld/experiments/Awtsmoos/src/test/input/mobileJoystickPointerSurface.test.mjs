// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileJoystickPointerSurface.test.mjs
 * @description Proves the floating touch surface starts where the thumb lands, moves, and returns cleanly to zero.
 * The Awtsmoos lets the thumb reveal its own center instead of hunting a rigid ring in the night;
 * Awtsmoos.com tests the full press, travel, release, and teardown so motion remains simple and right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MobileJoystickPointerSurface } from '../../input/MobileJoystickPointerSurface.js';

test('floating surface activates at touch origin and resets on release', () => {
	const host = new FakeHost();
	const ring = new FakeVisual();
	const knob = new FakeVisual();
	const vectors = [];
	const surface = new MobileJoystickPointerSurface(host, ring, knob, vector => vectors.push(vector));
	host.dispatch('pointerdown', pointerEvent(7, 120, 180));
	assert.equal(surface.pointerId, 7);
	assert.equal(ring.dataset.active, 'true');
	assert.equal(host.captured, 7);
	host.dispatch('pointermove', pointerEvent(7, 160, 160));
	assert.ok(vectors.at(-1).magnitude > 0);
	assert.notEqual(knob.style.transform, 'translate(0, 0)');
	host.dispatch('pointerup', pointerEvent(7, 160, 160));
	assert.equal(surface.pointerId, null);
	assert.equal(vectors.at(-1).magnitude, 0);
	assert.equal(knob.style.transform, 'translate(0, 0)');
	assert.equal(ring.dataset.active, undefined);
	surface.destroy();
	assert.equal(host.listeners.size, 0);
});

class FakeHost {
	constructor() {
		this.listeners = new Map();
		this.captured = null;
	}
	addEventListener(name, listener) {
		this.listeners.set(name, listener);
	}
	removeEventListener(name, listener) {
		if (this.listeners.get(name) === listener) this.listeners.delete(name);
	}
	dispatch(name, event) {
		this.listeners.get(name)?.(event);
	}
	getBoundingClientRect() {
		return { left: 0, top: 0, width: 260, height: 260 };
	}
	setPointerCapture(pointerId) {
		this.captured = pointerId;
	}
}

class FakeVisual {
	constructor() {
		this.dataset = {};
		this.style = {
			removeProperty(name) {
				delete this[name];
			}
		};
	}
}

function pointerEvent(pointerId, clientX, clientY) {
	return {
		clientX,
		clientY,
		pointerId,
		preventDefault() {}
	};
}
