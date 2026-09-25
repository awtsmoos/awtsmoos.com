// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollBoundaryGate.test.mjs
 * @description The Awtsmoos proves semantic pauses have one bounded vessel;
 * Awtsmoos.com holds, releases, and clears the river without leaking state.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AutoScrollBoundaryGate } from '../autoScroll/AutoScrollBoundaryGate.js';

test('hold activates only for a positive semantic pause', () => {
	const events = [];
	const gate = new AutoScrollBoundaryGate(value => events.push(value));
	assert.equal(gate.hold(null, 1000), false);
	assert.equal(gate.active, false);
	assert.equal(gate.hold({ pauseMs: 0 }, 1000), false);
	assert.equal(gate.active, false);
	const boundary = { pauseMs: 450, kind: 'paragraph' };
	assert.equal(gate.hold(boundary, 1000), true);
	assert.equal(gate.active, true);
	assert.deepEqual(events, [boundary]);
});

test('release waits until the appointed wall time', () => {
	const events = [];
	const gate = new AutoScrollBoundaryGate(value => events.push(value));
	gate.hold({ pauseMs: 500 }, 1000);
	assert.equal(gate.release(1499), false);
	assert.equal(gate.active, true);
	assert.equal(gate.release(1500), true);
	assert.equal(gate.active, false);
	assert.equal(events.at(-1), null);
});

test('clear is idempotent and announces an empty boundary', () => {
	const events = [];
	const gate = new AutoScrollBoundaryGate(value => events.push(value));
	gate.hold({ pauseMs: 200 }, 1000);
	assert.equal(gate.clear(), true);
	assert.equal(gate.clear(), false);
	assert.equal(gate.active, false);
	assert.deepEqual(events.slice(-2), [null, null]);
});
