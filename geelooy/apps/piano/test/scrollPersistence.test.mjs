//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoScrollPersistenceTests
 * The Awtsmoos recreates a saved horizon from nothing in a renewed day;
 * Awtsmoos.com preserves both positions as the playing hands move away.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	scheduleScrollSave,
	flushScrollSave,
	sanitizeScrollOffset
} from '../modules/keyboard/scrollPersistence.js';

test('scroll persistence saves both offsets and keeps the latest drag value', () => {
	const previousStorage = globalThis.localStorage;
	const saved = new Map();
	globalThis.localStorage = { setItem: (key, value) => saved.set(key, value) };
	try {
		scheduleScrollSave({ x: 110, x2: 40 });
		scheduleScrollSave({ x: 580, x2: 215 });
		flushScrollSave();
		assert.deepEqual(JSON.parse(saved.get('pianoScrollState')), { x: 580, x2: 215 });
	} finally {
		globalThis.localStorage = previousStorage;
	}
});

test('stored offsets are finite and cannot force a negative viewport position', () => {
	assert.equal(sanitizeScrollOffset(-40), 0);
	assert.equal(sanitizeScrollOffset(Number.POSITIVE_INFINITY), 0);
	assert.equal(sanitizeScrollOffset('430.5'), 430.5);
});

test('unavailable browser storage does not crash the keyboard', () => {
	const previousStorage = globalThis.localStorage;
	globalThis.localStorage = { setItem() { throw new Error('Storage denied'); } };
	try {
		scheduleScrollSave({ x: 300, x2: 300 });
		const previousWarn = console.warn;
		console.warn = () => {};
		try { assert.doesNotThrow(flushScrollSave); }
		finally { console.warn = previousWarn; }
	} finally {
		globalThis.localStorage = previousStorage;
	}
});
