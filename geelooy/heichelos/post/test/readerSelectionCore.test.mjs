// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file readerSelectionCore.test.mjs
 * @description The Awtsmoos proves stationary intent, scroll cancellation,
 * multi-touch release, ordered word choice, and honest phonetics without a page.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { LongPressIntent } from '../logic/listeners/LongPressIntent.js';
import {
	transliterateHebrew,
	transliteratePhrase
} from '../functions/text/hebrewPhonetics.js';
import { WordSelectionState } from '../functions/ui/selection/selectionState.js';

let scheduledCallback = null;
globalThis.window = {
	scrollX: 0,
	scrollY: 0,
	addEventListener() {},
	setTimeout(callback) {
		scheduledCallback = callback;
		return 1;
	},
	clearTimeout() {
		scheduledCallback = null;
	}
};
globalThis.document = { addEventListener() {} };

function touchEvent(overrides = {}) {
	return {
		pointerType: 'touch',
		pointerId: 7,
		isPrimary: true,
		clientX: 100,
		clientY: 200,
		target: { closest: () => null },
		...overrides
	};
}

test('stationary touch fires once after the configured delay', () => {
	let fired = 0;
	const recognizer = new LongPressIntent({
		onIntent: () => { fired += 1; }
	});
	assert.equal(recognizer.begin(touchEvent()), true);
	assert.equal(typeof scheduledCallback, 'function');
	scheduledCallback();
	assert.equal(fired, 1);
	assert.equal(recognizer.shouldIgnoreClick({}), true);
});

test('scroll-shaped movement cancels long press without firing', () => {
	let fired = 0;
	const recognizer = new LongPressIntent({
		onIntent: () => { fired += 1; }
	});
	recognizer.begin(touchEvent());
	assert.equal(recognizer.move(touchEvent({ clientY: 240 })), true);
	assert.equal(scheduledCallback, null);
	assert.equal(fired, 0);
});

test('page movement, second touch, and blocked targets cancel intent', () => {
	const recognizer = new LongPressIntent();
	window.scrollY = 0;
	recognizer.begin(touchEvent());
	window.scrollY = 9;
	assert.equal(recognizer.move(touchEvent()), true);
	window.scrollY = 0;
	assert.equal(recognizer.begin(touchEvent()), true);
	assert.equal(recognizer.begin(touchEvent({ pointerId: 8, isPrimary: false })), false);
	assert.equal(scheduledCallback, null);
	assert.equal(recognizer.begin(touchEvent({
		target: { closest: () => ({ tagName: 'BUTTON' }) }
	})), false);
	assert.equal(recognizer.shouldIgnoreClick({
		sourceCapabilities: { firesTouchEvents: true }
	}), true);
});

test('selection state preserves tap order and uniqueness', () => {
	const state = new WordSelectionState();
	const first = { id: 'a', text: 'מֹשֶׁה' };
	const second = { id: 'b', text: 'שָׁלוֹם' };
	assert.equal(state.toggle(first), true);
	assert.equal(state.toggle(second), true);
	assert.equal(state.phrase(), 'מֹשֶׁה שָׁלוֹם');
	assert.equal(state.toggle(first), false);
	assert.equal(state.phrase(), 'שָׁלוֹם');
	assert.deepEqual(state.undo(), second);
	assert.equal(state.count, 0);
	state.toggle(first);
	state.toggle(second);
	assert.equal(state.clear().length, 2);
	assert.equal(state.count, 0);
});

test('phonetics use visible nekudos and mark unpointed text approximate', () => {
	assert.deepEqual(transliterateHebrew('מֹשֶׁה'), {
		text: 'moshe',
		hasNekudos: true,
		approximate: false
	});
	assert.equal(transliterateHebrew('שָׁלוֹם').text, 'shalom');
	assert.equal(transliterateHebrew('בְּרֵאשִׁית').text, 'bereishit');
	const unpointed = transliterateHebrew('שלום');
	assert.equal(unpointed.approximate, true);
	assert.equal(unpointed.hasNekudos, false);
	assert.equal(transliteratePhrase(['מֹשֶׁה', 'שָׁלוֹם']).text, 'moshe shalom');
});
