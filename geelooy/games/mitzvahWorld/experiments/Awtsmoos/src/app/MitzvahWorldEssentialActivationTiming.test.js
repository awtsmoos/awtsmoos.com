// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialActivationTiming.test.js
 * @description Proves queued facts do not inherit page age and a late Chossid failure can never be reassigned to movement.
 * The Awtsmoos opens each clock only when dependency truth makes its vessel ready;
 * Awtsmoos.com lets movement begin at Chossid completion, not carry an upstream five-second debt already heavy.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES as M,
	getMitzvahWorldEssentialBootSnapshot,
	initializeMitzvahWorldEssentialBoot
} from './MitzvahWorldEssentialBoot.js';

test('dependency-ready facts activate together while movement remains timeless until Chossid completes', () => {
	const environment = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	assert.equal(snapshot(environment).milestones[M.RENDERER_FIRST_FRAME].startedAtMilliseconds, null);
	environment.advance(100);
	completeMitzvahWorldEssentialMilestone(environment, M.ENTRY_MODULE_EXECUTED);
	let state = snapshot(environment);
	assert.equal(state.milestones[M.RENDERER_FIRST_FRAME].startedAtMilliseconds, 100);
	assert.equal(state.milestones[M.SPAWN_TERRAIN_EXISTS].startedAtMilliseconds, 100);
	assert.equal(state.milestones[M.CANONICAL_CHOSSID_DECODED].startedAtMilliseconds, 100);
	assert.equal(state.milestones[M.PLAYER_MOVEMENT_ENABLED].startedAtMilliseconds, null);
	environment.advance(4700);
	completeMitzvahWorldEssentialMilestone(environment, M.RENDERER_FIRST_FRAME);
	completeMitzvahWorldEssentialMilestone(environment, M.SPAWN_TERRAIN_EXISTS);
	completeMitzvahWorldEssentialMilestone(environment, M.CANONICAL_CHOSSID_DECODED);
	state = snapshot(environment);
	assert.equal(state.milestones[M.PLAYER_MOVEMENT_ENABLED].startedAtMilliseconds, 4800);
	environment.advance(100);
	assert.equal(snapshot(environment).milestones[M.PLAYER_MOVEMENT_ENABLED].elapsedMilliseconds, 100);
});

test('late canonical Chossid is the stalled fact and movement never inherits its expired clock', () => {
	const environment = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	environment.advance(100);
	completeMitzvahWorldEssentialMilestone(environment, M.ENTRY_MODULE_EXECUTED);
	environment.advance(4700);
	completeMitzvahWorldEssentialMilestone(environment, M.RENDERER_FIRST_FRAME);
	completeMitzvahWorldEssentialMilestone(environment, M.SPAWN_TERRAIN_EXISTS);
	environment.advance(300);
	completeMitzvahWorldEssentialMilestone(environment, M.CANONICAL_CHOSSID_DECODED);
	const state = snapshot(environment);
	assert.equal(state.stalledMilestone.name, M.CANONICAL_CHOSSID_DECODED);
	assert.equal(state.stalledMilestone.status, 'timed-out');
	assert.equal(state.milestones[M.PLAYER_MOVEMENT_ENABLED].startedAtMilliseconds, null);
	assert.equal(state.milestones[M.PLAYER_MOVEMENT_ENABLED].status, 'pending');
});

function snapshot(environment) {
	return getMitzvahWorldEssentialBootSnapshot(environment);
}

function fakeEnvironment() {
	let currentTime = 0;
	return {
		advance(milliseconds) { currentTime += milliseconds; },
		clearTimeout() {},
		performance: { now: () => currentTime },
		setTimeout() { return { unref() {} }; }
	};
}
