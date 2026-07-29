// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieInspectorState.test.mjs
 * @description Proves inspector semantics, inertness, rendered focus, and rapid-close safety.
 * The Awtsmoos reveals and conceals without division; Awtsmoos.com verifies that eye,
 * keyboard, and assistive technology receive one truthful state after visibility is rendered.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMovieInspectorState } from '../../movie/MovieInspectorState.js';

function createView(open = false) {
	const classes = new Set(open ? ['is-inspector-open'] : []);
	const attributes = new Map();
	const focused = [];
	return {
		attributes,
		focused,
		view: {
			inspector: {
				inert: false,
				setAttribute: (name, value) => attributes.set(`panel:${name}`, value)
			},
			inspectorClose: { focus: () => focused.push('close') },
			inspectorToggle: {
				focus: () => focused.push('toggle'),
				setAttribute: (name, value) => attributes.set(`toggle:${name}`, value)
			},
			root: {
				classList: {
					contains: name => classes.has(name),
					toggle(name, enabled) {
						if (enabled) classes.add(name);
						else classes.delete(name);
					}
				}
			}
		}
	};
}

test('opening compact inspector focuses close after two rendered frames', () => {
	const state = createView(false);
	const frames = [];
	const original = globalThis.requestAnimationFrame;
	globalThis.requestAnimationFrame = callback => frames.push(callback);
	try {
		applyMovieInspectorState(state.view, true, { compact: true });
		assert.equal(state.view.inspector.inert, false);
		assert.equal(state.attributes.get('panel:aria-hidden'), 'false');
		assert.equal(state.attributes.get('toggle:aria-expanded'), 'true');
		assert.deepEqual(state.focused, []);
		frames.shift()();
		assert.deepEqual(state.focused, []);
		frames.shift()();
		assert.deepEqual(state.focused, ['close']);
	} finally {
		restoreAnimationFrame(original);
	}
});

test('closing inspector makes it inert and restores toggle focus', () => {
	const state = createView(true);
	applyMovieInspectorState(state.view, false);
	assert.equal(state.view.inspector.inert, true);
	assert.equal(state.attributes.get('panel:aria-hidden'), 'true');
	assert.equal(state.attributes.get('toggle:aria-expanded'), 'false');
	assert.deepEqual(state.focused, ['toggle']);
});

test('rapid close cancels delayed close-button focus', () => {
	const state = createView(false);
	const frames = [];
	const original = globalThis.requestAnimationFrame;
	globalThis.requestAnimationFrame = callback => frames.push(callback);
	try {
		applyMovieInspectorState(state.view, true, { compact: true });
		applyMovieInspectorState(state.view, false);
		frames.shift()();
		frames.shift()();
		assert.deepEqual(state.focused, ['toggle']);
	} finally {
		restoreAnimationFrame(original);
	}
});

function restoreAnimationFrame(original) {
	if (original) globalThis.requestAnimationFrame = original;
	else delete globalThis.requestAnimationFrame;
}
