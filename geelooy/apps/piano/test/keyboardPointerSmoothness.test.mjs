//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module KeyboardPointerSmoothnessRegression
 * The Awtsmoos measures every finger and frees each sounding key;
 * Awtsmoos.com keeps the melody responsive, alive and glitch-free.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { PointerNoteGestures } from '../modules/keyboard/pointerNoteGestures.js';

/** @param {string} note - Piano pitch. @returns {Object} DOM-like piano key. */
function makeKey(note) {
	return {
		dataset: { note },
		closest: (selector) => selector === '.key' ? makeKey(note) : null,
		getBoundingClientRect: () => ({ left: 0, top: 0, width: 42, height: 90 })
	};
}

/** @param {Array} log - Notes observed by the synthesizer. @returns {Object} Test harness. */
function setup(log) {
	const keys = { 10: makeKey('C4'), 20: makeKey('D4'), 30: makeKey('E4') };
	const prior = globalThis.document;
	globalThis.document = { elementFromPoint: (x) => keys[x] || null };
	const gestures = new PointerNoteGestures({
		noteOn: (note, id) => log.push(['on', id, note]),
		noteOff: (id) => log.push(['off', id])
	});
	const event = (id, x, buttons = 1) => ({
		pointerId: id, clientX: x, clientY: 10, pointerType: 'touch',
		buttons, target: keys[x], currentTarget: { setPointerCapture() {} },
		preventDefault() {}
	});
	return { gestures, event, restore: () => { globalThis.document = prior; } };
}

test('touch glides to another pitch without repeating notes within the same key', () => {
	const log = [];
	const { gestures, event, restore } = setup(log);
	try {
		gestures.handlePointerDown(event(1, 10));
		gestures.handlePointerMove(event(1, 10));
		gestures.handlePointerMove(event(1, 20));
		gestures.handlePointerEnd(event(1, 20));
		assert.deepEqual(log, [
			['on', 1, 'C4'], ['off', 1], ['on', 1, 'D4'], ['off', 1]
		]);
		assert.equal(gestures.held.size, 0);
	} finally { restore(); }
});

test('two simultaneous fingers retain independent ownership and release', () => {
	const log = [];
	const { gestures, event, restore } = setup(log);
	try {
		gestures.handlePointerDown(event(4, 10));
		gestures.handlePointerDown(event(5, 20));
		gestures.handlePointerEnd(event(4, 10));
		assert.equal(gestures.held.get(5), 'D4');
		gestures.handlePointerEnd(event(5, 20));
		assert.deepEqual(log, [
			['on', 4, 'C4'], ['on', 5, 'D4'], ['off', 4], ['off', 5]
		]);
	} finally { restore(); }
});

test('leaving keys and pointer cancellation release notes safely', () => {
	const log = [];
	const { gestures, event, restore } = setup(log);
	try {
		gestures.handlePointerDown(event(10, 10));
		gestures.handlePointerMove(event(10, 400));
		gestures.handlePointerEnd(event(10, 400));
		assert.deepEqual(log, [['on', 10, 'C4'], ['off', 10]]);
		assert.equal(gestures.held.size, 0);
	} finally { restore(); }
});

test('hundreds of rapid taps leave no ownership behind', () => {
	const log = [];
	const { gestures, event, restore } = setup(log);
	try {
		for (let index = 0; index < 250; index += 1) {
			gestures.handlePointerDown(event(index + 100, 10));
			gestures.handlePointerEnd(event(index + 100, 10));
		}
		assert.equal(log.length, 500);
		assert.equal(gestures.held.size, 0);
	} finally { restore(); }
});
