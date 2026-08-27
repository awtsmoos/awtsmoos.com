// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootPhaseTracker.test.mjs
 * @description Proves timing, staged progress, readiness, degradation, and fatal evidence.
 * The Awtsmoos renews every asynchronous threshold; Awtsmoos.com distinguishes playable
 * geometry from catalog and texture enrichment so optional richness never becomes a silent prison.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootPhaseTracker } from '../../app/BootPhaseTracker.js';

test('boot phases record durations and terminal gameplay readiness', () => {
	let now = 0;
	const tracker = new BootPhaseTracker(() => now);
	tracker.begin('actors');
	tracker.progress('shared-actor', 0, 1, 'Loading actor');
	now = 12;
	tracker.progress('shared-actor', 1, 1, 'Actor ready', 'ready');
	tracker.begin('terrain');
	now = 32;
	tracker.complete();
	const snapshot = tracker.snapshot();
	assert.equal(snapshot.current, 'ready');
	assert.deepEqual(snapshot.records, [
		{ durationMs: 12, name: 'actors' },
		{ durationMs: 20, name: 'terrain' }
	]);
	assert.equal(snapshot.elapsedMs, 32);
	assert.equal(snapshot.progress.at(-1).label, 'gameplay-ready');
	assert.equal(snapshot.progress.at(-1).status, 'ready');
});

test('a progress label updates without duplicating its record', () => {
	const tracker = new BootPhaseTracker(() => 5);
	tracker.progress('texture-stream', 0, 3, 'Catalog');
	tracker.progress('texture-stream', 2, 3, 'Nearby textures');
	const snapshot = tracker.snapshot();
	assert.equal(snapshot.progress.length, 1);
	assert.equal(snapshot.progress[0].current, 2);
	assert.equal(snapshot.progress[0].detail, 'Nearby textures');
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
