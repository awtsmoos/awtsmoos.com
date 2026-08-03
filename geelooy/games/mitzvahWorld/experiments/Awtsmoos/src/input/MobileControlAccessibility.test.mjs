// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileControlAccessibility.test.mjs
 * @description Proves bounded vectors, focused arrow control, typing safety, and teardown.
 * The Awtsmoos guides touch and key without stealing a writer's space;
 * Awtsmoos.com tests every listener so no abandoned motion haunts the place.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { JumpButton } from './JumpButton.js';
import { MobileJoystickKeyboard } from './MobileJoystickKeyboard.js';
import {
	joystickDirectionLabel,
	joystickVectorFromOffset
} from './MobileJoystickVector.js';

test('joystick math bounds travel and names direction', () => {
	const result = joystickVectorFromOffset(100, -100, 46);
	assert.ok(Math.hypot(result.knob.x, result.knob.y) <= 46.0001);
	assert.ok(result.vector.magnitude <= 1);
	assert.equal(joystickDirectionLabel(result.vector), 'up right');
	assert.equal(joystickVectorFromOffset(1, 1, 46).vector.magnitude, 0);
});

test('focused keyboard joystick publishes and removes arrow listeners', () => {
	const target = new FakeTarget();
	const vectors = [];
	const keyboard = new MobileJoystickKeyboard(target, vector => vectors.push(vector));
	target.dispatch('keydown', keyEvent('ArrowUp'));
	target.dispatch('keydown', keyEvent('ArrowRight'));
	assert.ok(Math.abs(vectors.at(-1).x - Math.SQRT1_2) < 0.001);
	assert.ok(Math.abs(vectors.at(-1).y + Math.SQRT1_2) < 0.001);
	target.dispatch('blur', {});
	assert.equal(vectors.at(-1).magnitude, 0);
	keyboard.destroy();
	assert.equal(target.listeners.size, 0);
});

test('jump ignores editable Space and removes global listeners', () => {
	const environment = new FakeTarget();
	environment.document = createDocument();
	const host = new FakeTarget();
	const jump = new JumpButton(host, environment);
	const editableEvent = keyEvent('Space', 'textarea');
	environment.dispatch('keydown', editableEvent);
	assert.equal(editableEvent.prevented, false);
	assert.equal(jump.consume(), false);
	const gameplayEvent = keyEvent('Space', 'div');
	environment.dispatch('keydown', gameplayEvent);
	assert.equal(gameplayEvent.prevented, true);
	assert.equal(jump.consume(), true);
	environment.dispatch('keyup', gameplayEvent);
	jump.destroy();
	assert.equal(environment.listeners.size, 0);
	assert.equal(jump.button.removed, true);
});

class FakeTarget {
	constructor(tagName = 'div') {
		this.tagName = tagName.toUpperCase();
		this.listeners = new Map();
		this.children = [];
		this.attributes = new Map();
		this.isContentEditable = false;
		this.removed = false;
	}
	addEventListener(name, listener) {
		this.listeners.set(name, listener);
	}
	removeEventListener(name, listener) {
		if (this.listeners.get(name) === listener) {
			this.listeners.delete(name);
		}
	}
	dispatch(name, event) {
		this.listeners.get(name)?.(event);
	}
	append(child) {
		this.children.push(child);
	}
	closest(selector) {
		const tagName = this.tagName.toLowerCase();
		return selector.split(',').some(part => part.trim() === tagName) ? this : null;
	}
	remove() {
		this.removed = true;
	}
	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}
	setPointerCapture() {}
}

function createDocument() {
	const body = new FakeTarget('body');
	return {
		body,
		createElement(tagName) {
			return new FakeTarget(tagName);
		}
	};
}

function keyEvent(code, tagName = 'div') {
	return {
		code,
		key: code,
		prevented: false,
		target: new FakeTarget(tagName),
		preventDefault() {
			this.prevented = true;
		}
	};
}
