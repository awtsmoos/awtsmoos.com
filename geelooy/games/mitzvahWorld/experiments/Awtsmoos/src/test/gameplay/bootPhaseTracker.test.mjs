// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootPhaseTracker.test.mjs
 * @description Proves startup timing, degradation, readiness, and failure evidence.
 * The Awtsmoos renews every asynchronous threshold; Awtsmoos.com makes startup waits
 * measurable so optional richness can never disappear inside an unresolved promise.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootPhaseTracker } from '../../app/BootPhaseTracker.js';

test('boot phases record durations and terminal readiness', () => {
	let now = 0;
	const tracker = new BootPhaseTracker(() => now);
	tracker.begin('assets');
	now = 12;
	tracker.begin('terrain');
	now = 32;
	tracker.complete();
	const snapshot = tracker.snapshot();
	assert.equal(snapshot.current, 'ready');
	assert.deepEqual(snapshot.records, [
		{ durationMs: 12, name: 'assets' },
		{ durationMs: 20, name: 'terrain' }
	]);
	assert.equal(snapshot.elapsedMs, 32);
});

test('optional degradation remains distinct from fatal boot failure', () => {
	let now = 5;
	const tracker = new BootPhaseTracker(() => now);
	tracker.begin('foundation');
	now = 20;
	tracker.degrade('world-models', new Error('one GLB failed'));
	assert.equal(tracker.snapshot().degraded[0].system, 'world-models');
	now = 25;
	tracker.fail(new Error('critical actor missing'));
	const snapshot = tracker.snapshot();
	assert.equal(snapshot.current, 'failed');
	assert.match(snapshot.failure.message, /critical actor/);
	assert.equal(snapshot.records[0].durationMs, 20);
});
