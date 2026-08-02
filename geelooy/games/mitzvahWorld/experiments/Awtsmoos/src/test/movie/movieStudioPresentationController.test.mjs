// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioPresentationController.test.mjs
 * @description Proves cinema focus, timeline disclosure, Escape priority, revision neutrality, and teardown.
 * The Awtsmoos renews every visible posture beyond authored history; Awtsmoos.com verifies
 * the artist can clear space and restore tools while project revision remains perfectly still.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioPresentationController } from '../../movie/MovieStudioPresentationController.js';

function createButton() {
	const listeners = new Map();
	const attributes = new Map();
	return {
		focusCount: 0,
		addEventListener(type, listener) {
			listeners.set(type, listener);
		},
		click() {
			listeners.get('click')?.();
		},
		focus() {
			this.focusCount += 1;
		},
		getAttribute(name) {
			return attributes.get(name);
		},
		removeEventListener(type) {
			listeners.delete(type);
		},
		setAttribute(name, value) {
			attributes.set(name, String(value));
		}
	};
}

function createRoot(focusButton, timelineButton) {
	const classes = new Set();
	return {
		classList: {
			contains: name => classes.has(name),
			remove: (...names) => names.forEach(name => classes.delete(name)),
			toggle(name, value) {
				if (value) classes.add(name);
				else classes.delete(name);
			}
		},
		dataset: {},
		querySelector(selector) {
			return selector === '[data-focus-3d]' ? focusButton : timelineButton;
		}
	};
}

test('controller changes only presentation state and cleans every trace', () => {
	const focusButton = createButton();
	const timelineButton = createButton();
	const root = createRoot(focusButton, timelineButton);
	const events = [];
	const session = {
		events: { emit: (type, detail) => events.push({ detail, type }) },
		interactions: { toggleInspector() {} },
		revision: 17
	};
	const controller = new MovieStudioPresentationController(session, { root });
	focusButton.click();
	timelineButton.click();
	assert.equal(root.classList.contains('is-cinema-focus'), true);
	assert.equal(root.classList.contains('is-timeline-expanded'), true);
	assert.equal(session.revision, 17);
	const event = { key: 'Escape', preventDefault() {} };
	assert.equal(controller.onKeyDown(event), true);
	assert.equal(root.classList.contains('is-cinema-focus'), false);
	assert.equal(focusButton.focusCount, 1);
	controller.destroy();
	assert.equal(root.classList.contains('is-timeline-expanded'), false);
	assert.equal(root.dataset.presentationMode, undefined);
	assert.ok(events.length >= 3);
});
