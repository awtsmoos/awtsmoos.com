// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileJoystickZeroOffset.test.mjs
 * @description Proves first contact is mathematically neutral even when the floating joystick begins near a screen edge.
 * The Awtsmoos creates the thumb exactly where it lands, with no secret drift in sight;
 * Awtsmoos.com keeps the first instant still, and only chosen motion gives the vector flight.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { MobileJoystickPointerSurface } from '../../input/MobileJoystickPointerSurface.js';

function style() {
	return { removeProperty() {} };
}

function harness() {
	const listeners = new Map();
	const host = {
		addEventListener: (type, listener) => listeners.set(type, listener),
		removeEventListener: type => listeners.delete(type),
		getBoundingClientRect: () => ({ left: 4, top: 700, width: 150, height: 190 }),
		setPointerCapture() {}
	};
	const ring = { style: style(), dataset: {} };
	const knob = { style: style() };
	const vectors = [];
	const surface = new MobileJoystickPointerSurface(host, ring, knob, vector => vectors.push(vector));
	return { surface, ring, knob, vectors };
}

function pointer(pointerId, clientX, clientY) {
	return { pointerId, clientX, clientY, preventDefault() {} };
}

test('edge contact starts with zero vector and exact visual center', () => {
	const { surface, ring, knob, vectors } = harness();
	surface.begin(pointer(3, 12, 860));
	assert.deepEqual(vectors.at(-1), { x: 0, y: 0, magnitude: 0 });
	assert.equal(ring.style.left, '8px');
	assert.equal(ring.style.top, '160px');
	assert.equal(knob.style.transform, 'translate(0, 0)');
	surface.move(pointer(3, 42, 820));
	assert.ok(vectors.at(-1).magnitude > 0);
	surface.destroy();
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
