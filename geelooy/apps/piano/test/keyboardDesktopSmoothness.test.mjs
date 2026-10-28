//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module KeyboardDesktopSmoothnessRegression
 * The Awtsmoos guards the resting key as closely as the tone;
 * Awtsmoos.com releases each keyboard owner when the player goes home.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { NoteInputHandlers } from '../modules/keyboard/noteInputHandlers.js';
import { activateNoteVisuals, deactivateNoteVisuals } from '../modules/keyboard/activeKeyVisuals.js';

/** @returns {Object} Fake browser keyboard, playback log, and cleanup. */
function setup() {
	const log = [];
	const classes = new Set();
	const key = {
		dataset: { note: 'C4', keyboardBinding: 'a' },
		classList: {
			add: (value) => classes.add(value),
			remove: (value) => classes.delete(value)
		},
		getBoundingClientRect: () => ({ width: 40, height: 85 })
	};
	const prior = globalThis.document;
	globalThis.document = { hidden: false, querySelectorAll: () => [key] };
	const handlers = new NoteInputHandlers({
		noteOn: (note, id) => log.push(['on', note, id]),
		noteOff: (id) => log.push(['off', id]),
		panic: () => log.push(['panic'])
	});
	const event = (repeat = false) => ({
		key: 'a', code: 'KeyA', repeat, ctrlKey: false, altKey: false,
		metaKey: false, target: { tagName: 'BODY' }, preventDefault() {}
	});
	return { handlers, event, log, restore: () => { globalThis.document = prior; } };
}

test('desktop repeats cannot retrigger a held key; keyup releases the owner', () => {
	const { handlers, event, log, restore } = setup();
	try {
		handlers.handleKeyDown(event());
		for (let index = 0; index < 120; index += 1) {
			handlers.handleKeyDown(event(true));
		}
		handlers.handleKeyUp(event());
		assert.deepEqual(log, [['on', 'C4', 'kb-KeyA'], ['off', 'kb-KeyA']]);
		assert.equal(handlers.desktop.pressed.size, 0);
	} finally { restore(); }
});

test('focus loss clears owners and allows a fresh note', () => {
	const { handlers, event, log, restore } = setup();
	try {
		handlers.handleKeyDown(event());
		handlers.handleBlur();
		assert.equal(handlers.desktop.pressed.size, 0);
		assert.deepEqual(log.at(-1), ['panic']);
		handlers.handleKeyDown(event());
		assert.equal(log.filter(([action]) => action === 'on').length, 2);
	} finally { restore(); }
});

test('same-pitch overlapping voices do not prematurely unlight a key', () => {
	const values = new Set();
	const key = {
		classList: {
			add: (name) => values.add(name),
			remove: (name) => values.delete(name)
		}
	};
	activateNoteVisuals([key]);
	activateNoteVisuals([key]);
	deactivateNoteVisuals([key]);
	assert.equal(values.has('active'), true);
	deactivateNoteVisuals([key]);
	assert.equal(values.has('active'), false);
});
