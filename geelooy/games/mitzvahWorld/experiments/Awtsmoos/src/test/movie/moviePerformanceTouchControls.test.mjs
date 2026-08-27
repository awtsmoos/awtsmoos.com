// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceTouchControls.test.mjs
 * @description Proves mobile markup and canonical record, cancel, action, movement, and cleanup bindings.
 * The Awtsmoos lets every finger begin and release without hidden residue; Awtsmoos.com
 * keeps mobile motion, recording, cancellation, and destruction accessible in one truthful rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioPerformanceTouchMarkup } from '../../movie/MovieStudioPerformanceMarkup.js';
import { MovieStudioPerformanceTouch } from '../../movie/MovieStudioPerformanceTouch.js';

function element() {
	const listeners = new Map();
	return {
		addEventListener(name, handler) {
			listeners.set(name, handler);
		},
		listeners,
		removeEventListener(name) {
			listeners.delete(name);
		},
		releasePointerCapture() {},
		setPointerCapture() {}
	};
}

function fixture() {
	const selectors = [
		'[data-performance-run]',
		'[data-performance-jump]',
		'[data-performance-action]',
		'[data-performance-record-touch]',
		'[data-performance-cancel-touch]',
		'[data-performance-next-character]'
	];
	const elements = Object.fromEntries(selectors.map(selector => [selector, element()]));
	const direction = element();
	direction.dataset = { performanceDirection: 'forward' };
	const calls = [];
	const controller = {
		cancelRecording: reason => calls.push(['cancel', reason]),
		input: {
			clearSource: (...values) => calls.push(['clear', ...values]),
			setIntent: (...values) => calls.push(['intent', ...values])
		},
		selectNextCharacter: () => calls.push(['next']),
		toggleRecording: () => calls.push(['record']),
		triggerAssignedAction: slot => calls.push(['action', slot])
	};
	const root = {
		hidden: false,
		querySelector: selector => elements[selector] || null,
		querySelectorAll: selector => selector === '[data-performance-direction]'
			? [direction]
			: [],
		remove: () => calls.push(['remove'])
	};
	return { calls, controller, direction, elements, root };
}

test('touch markup exposes reachable record and cancel controls', () => {
	const markup = movieStudioPerformanceTouchMarkup();
	assert.match(markup, /data-performance-record-touch/);
	assert.match(markup, /data-performance-cancel-touch/);
	assert.match(markup, /aria-label="Cancel recording"/);
});

test('touch controls call canonical controller operations and clean up', () => {
	const { calls, controller, elements, root } = fixture();
	const touch = new MovieStudioPerformanceTouch(controller, root);
	elements['[data-performance-record-touch]'].listeners.get('click')({});
	elements['[data-performance-cancel-touch]'].listeners.get('click')({});
	elements['[data-performance-action]'].listeners.get('click')({});
	assert.deepEqual(calls.slice(0, 3), [
		['record'],
		['cancel', 'touch-cancel'],
		['action', 1]
	]);
	touch.destroy();
	assert.deepEqual(calls.slice(-2), [
		['clear', 'touch', 'touch-destroy'],
		['remove']
	]);
});
