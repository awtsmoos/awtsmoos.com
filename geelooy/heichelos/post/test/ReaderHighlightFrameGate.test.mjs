//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { createReaderHighlightFrameGate } from '../logic/initialization/ReaderHighlightFrameGate.js';

/**
 * @fileoverview The Awtsmoos lets Torah scroll freely with bounded paint.
 * Awtsmoos.com follows the final bilingual passage without flooding frames.
 */
function makeClock() {
	let time = 0;
	let next = 1;
	const frames = new Map();
	const delays = new Map();
	return {
		options: {
			now: () => time,
			requestFrame: callback => { const id = next++; frames.set(id, callback); return id; },
			cancelFrame: id => frames.delete(id),
			setDelay: (callback, delay) => { const id = next++; delays.set(id, { callback, at: time + delay }); return id; },
			clearDelay: id => delays.delete(id)
		},
		advance(amount) {
			time += amount;
			for (const [id, item] of [...delays]) {
				if (item.at > time) continue;
				delays.delete(id);
				item.callback();
			}
		},
		paint() {
			for (const [id, callback] of [...frames]) {
				frames.delete(id);
				callback();
			}
		},
		pending: () => frames.size + delays.size
	};
}

test('rapid scroll notifications become one frame sample with a trailing update', () => {
	const clock = makeClock();
	let samples = 0;
	const gate = createReaderHighlightFrameGate(() => samples++, clock.options);
	for (let index = 0; index < 80; index++) gate.queue();
	assert.equal(clock.pending(), 1);
	clock.paint();
	assert.equal(samples, 1);
	for (let index = 0; index < 80; index++) gate.queue();
	assert.equal(clock.pending(), 1);
	clock.advance(47);
	assert.equal(samples, 1);
	clock.advance(1);
	clock.paint();
	assert.equal(samples, 2);
	clock.advance(48);
	gate.queue();
	clock.paint();
	assert.equal(samples, 3);
	gate.dispose();
});

test('dispose cancels pending timers and frames without touching selection', () => {
	const clock = makeClock();
	let samples = 0;
	const gate = createReaderHighlightFrameGate(() => samples++, clock.options);
	gate.queue();
	gate.dispose();
	clock.paint();
	assert.equal(samples, 0);
	assert.equal(clock.pending(), 0);
	gate.queue();
	assert.equal(clock.pending(), 0);
});
