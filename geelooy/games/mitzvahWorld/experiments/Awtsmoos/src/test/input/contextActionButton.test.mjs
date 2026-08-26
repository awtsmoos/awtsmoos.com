// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file contextActionButton.test.mjs
 * @description Proves one contextual action remains hidden until meaningful, keyboard-safe, geometry-tagged, and silent beneath advanced controls.
 * The Awtsmoos gives one deed only when purpose reaches the hand while Awtsmoos.com refuses to steal E from writing or trigger a hidden act beneath the inner veil;
 * click, key, suppression, measured-zone identity, and teardown all remain one clean covenant without another permanent rail.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ContextActionButton } from '../../input/ContextActionButton.js';

test('context action appears only when meaningful and activates by click or E', () => {
	const documentValue = createDocument();
	const environment = new FakeTarget();
	environment.document = documentValue;
	const host = new FakeTarget('div', documentValue);
	const resolver = createResolver();
	const control = new ContextActionButton(host, resolver, environment);
	assert.equal(control.button.dataset.directHudZone, 'context');
	assert.equal(control.button.hidden, true);
	resolver.current = visibleState('Talk');
	control.refresh();
	control.button.dispatch('click', {});
	const event = keyEvent('KeyE');
	environment.dispatch('keydown', event);
	assert.equal(event.prevented, true);
	assert.equal(resolver.activations, 2);
	control.destroy();
	assert.equal(control.button.removed, true);
	assert.equal(environment.listeners.size, 0);
});

test('context action ignores editable, repeated, and advanced-sheet keyboard events', () => {
	const documentValue = createDocument();
	const environment = new FakeTarget();
	environment.document = documentValue;
	const resolver = createResolver(visibleState('Begin'));
	const control = new ContextActionButton(new FakeTarget('div', documentValue), resolver, environment);
	environment.dispatch('keydown', keyEvent('KeyE', 'textarea'));
	environment.dispatch('keydown', { ...keyEvent('KeyE'), repeat: true });
	documentValue.documentElement.dataset.awtsmoosAdvancedControls = 'true';
	const suppressed = keyEvent('KeyE');
	environment.dispatch('keydown', suppressed);
	assert.equal(resolver.activations, 0);
	assert.equal(suppressed.prevented, false);
	control.destroy();
});

class FakeTarget {
	constructor(tagName = 'div', ownerDocument = null) {
		this.tagName = tagName.toUpperCase();
		this.ownerDocument = ownerDocument;
		this.listeners = new Map();
		this.children = [];
		this.attributes = new Map();
		this.dataset = {};
		this.hidden = false;
		this.isContentEditable = false;
		this.removed = false;
	}
	addEventListener(name, listener) { this.listeners.set(name, listener); }
	removeEventListener(name, listener) {
		if (this.listeners.get(name) === listener) this.listeners.delete(name);
	}
	dispatch(name, event) { this.listeners.get(name)?.(event); }
	append(child) { this.children.push(child); }
	closest(selector) {
		return selector.split(',').some(part => part.trim() === this.tagName.toLowerCase()) ? this : null;
	}
	remove() { this.removed = true; }
	setAttribute(name, value) { this.attributes.set(name, String(value)); }
}

function createDocument() {
	const documentValue = { documentElement: { dataset: {} }, nodeType: 9 };
	documentValue.createElement = tagName => new FakeTarget(tagName, documentValue);
	return documentValue;
}

function createResolver(current = hiddenState()) {
	return {
		activations: 0,
		current,
		state() { return this.current; },
		activate() { this.activations += 1; return true; }
	};
}

function hiddenState() {
	return { enabled: false, hint: '', kind: 'hidden', label: '', visible: false };
}

function visibleState(label) {
	return { enabled: true, hint: label, kind: label.toLowerCase(), label, visible: true };
}

function keyEvent(code, tagName = 'div') {
	return {
		code,
		repeat: false,
		prevented: false,
		target: new FakeTarget(tagName),
		preventDefault() { this.prevented = true; }
	};
}
