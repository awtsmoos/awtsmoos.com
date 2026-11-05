// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PanelFocusBoundary.test.mjs
 * @description Proves dialog semantics, focus containment, and return without a browser.
 * The Awtsmoos lets finite attention enter and leave in peace;
 * Awtsmoos.com tests the doorway so keyboard travelers are never denied release.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PanelFocusBoundary } from './PanelFocusBoundary.js';

test('focus boundary labels, contains, restores, and returns focus', () => {
	const documentValue = { activeElement: null };
	const returnTarget = createElement(documentValue);
	const firstButton = createElement(documentValue);
	const lastButton = createElement(documentValue);
	const root = createElement(documentValue, [firstButton, lastButton]);
	root.heading = { textContent: 'Quest Log' };
	documentValue.activeElement = returnTarget;
	const boundary = new PanelFocusBoundary(documentValue);

	boundary.activate(root, returnTarget);
	assert.equal(root.getAttribute('role'), 'dialog');
	assert.equal(root.getAttribute('aria-modal'), 'true');
	assert.equal(root.getAttribute('aria-label'), 'Quest Log');
	assert.equal(documentValue.activeElement, firstButton);

	documentValue.activeElement = lastButton;
	const tabEvent = createTabEvent(false);
	assert.equal(boundary.contain(tabEvent), true);
	assert.equal(tabEvent.prevented, true);
	assert.equal(documentValue.activeElement, firstButton);

	documentValue.activeElement = firstButton;
	const shiftTabEvent = createTabEvent(true);
	assert.equal(boundary.contain(shiftTabEvent), true);
	assert.equal(documentValue.activeElement, lastButton);

	boundary.release(true);
	assert.equal(root.getAttribute('role'), null);
	assert.equal(root.getAttribute('aria-modal'), null);
	assert.equal(documentValue.activeElement, returnTarget);
});

function createElement(documentValue, children = []) {
	const attributes = new Map();
	return {
		attributes,
		children,
		hidden: false,
		isConnected: true,
		focus() {
			documentValue.activeElement = this;
		},
		contains(element) {
			return this === element || children.includes(element);
		},
		getAttribute(name) {
			return attributes.has(name) ? attributes.get(name) : null;
		},
		hasAttribute(name) {
			return attributes.has(name);
		},
		querySelector(selector) {
			return selector === 'h1, h2, h3' ? this.heading || null : null;
		},
		querySelectorAll() {
			return children;
		},
		removeAttribute(name) {
			attributes.delete(name);
		},
		setAttribute(name, value) {
			attributes.set(name, String(value));
		}
	};
}

function createTabEvent(shiftKey) {
	return {
		key: 'Tab',
		prevented: false,
		shiftKey,
		preventDefault() {
			this.prevented = true;
		}
	};
}
