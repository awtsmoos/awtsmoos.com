// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileJoystickZeroOffset.test.mjs
 * @description Proves the fixed joystick ring starts neutral, stays rooted, and cannot be stolen by a second pointer.
 * The Awtsmoos keeps the vessel fixed while chosen motion alone gives direction; Awtsmoos.com grants one pointer ownership without hidden drift.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MobileJoystickPointerSurface } from '../../input/MobileJoystickPointerSurface.js';

function style() {
	return { removeProperty() {} };
}

function harness() {
	const listeners = new Map();
	const host = {
		style: { touchAction: 'pan-y' },
		addEventListener: (type, listener) => listeners.set(type, listener),
		removeEventListener: type => listeners.delete(type),
		setPointerCapture() {},
		hasPointerCapture: () => false,
		releasePointerCapture() {}
	};
	const bounds = { left: 4, top: 700, width: 150, height: 190 };
	const ring = {
		style: style(),
		dataset: {},
		getBoundingClientRect: () => ({
			...bounds,
			right: bounds.left + bounds.width,
			bottom: bounds.top + bounds.height
		})
	};
	const knob = { style: style() };
	const vectors = [];
	const surface = new MobileJoystickPointerSurface(host, ring, knob, vector => vectors.push(vector));
	return { surface, host, ring, knob, vectors };
}

function pointer(pointerId, clientX, clientY) {
	return { pointerId, clientX, clientY, preventDefault() {} };
}

test('edge contact starts with zero vector while the ring stays fixed', () => {
	const { surface, host, ring, knob, vectors } = harness();
	surface.begin(pointer(3, 12, 860));
	assert.deepEqual(vectors.at(-1), { x: 0, y: 0, magnitude: 0 });
	assert.equal(ring.style.left, undefined);
	assert.equal(ring.style.top, undefined);
	assert.equal(knob.style.transform, 'translate(0, 0)');
	surface.move(pointer(3, 42, 820));
	assert.ok(vectors.at(-1).magnitude > 0);
	surface.destroy();
	assert.equal(host.style.touchAction, 'pan-y');
});

test('a second pointer cannot steal an active joystick gesture', () => {
	const { surface, vectors } = harness();
	surface.begin(pointer(4, 25, 820));
	const count = vectors.length;
	surface.begin(pointer(5, 90, 760));
	assert.equal(surface.pointerId, 4);
	assert.equal(vectors.length, count);
	surface.destroy();
});
