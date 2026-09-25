// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialLiveSnapshot.test.js
 * @description Proves the public boot receipt tells time while waiting and reserves "stalled" for witnessed failure.
 * The Awtsmoos renews the clock while Awtsmoos.com makes hidden waiting bright;
 * a living milestone may be active without being condemned before its five-second night.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	getMitzvahWorldEssentialBootSnapshot,
	initializeMitzvahWorldEssentialBoot
} from './MitzvahWorldEssentialBoot.js';

/** Pending evidence ages, exposes its timeout, and remains distinct from failure. */
test('pending essential fact exposes live elapsed time and active milestone', () => {
	const environment = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	environment.advance(1234);
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	const entry = snapshot.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED];
	assert.equal(entry.elapsedMilliseconds, 1234);
	assert.equal(entry.timeoutMilliseconds, 5000);
	assert.equal(snapshot.activeMilestone.name, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	assert.equal(snapshot.stalledMilestone, null);
});

/** The active fact advances through the dependency graph as truths complete. */
test('active milestone advances without inventing a failure', () => {
	const environment = fakeEnvironment();
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	environment.advance(250);
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.activeMilestone.name, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME);
	assert.equal(snapshot.activeMilestone.elapsedMilliseconds, 250);
	assert.equal(snapshot.stalledMilestone, null);
});

/** Five seconds converts actionable waiting into a concrete timed-out failure. */
test('watchdog converts active milestone into actionable stalled evidence', () => {
	const environment = fakeEnvironment();
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	environment.advance(5001);
	environment.fireTimeout();
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.stalledMilestone.name, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME);
	assert.equal(snapshot.stalledMilestone.status, 'timed-out');
	assert.ok(snapshot.stalledMilestone.elapsedMilliseconds >= 5000);
});

/** Minimal monotonic browser-like clock and watchdog vessel. */
function fakeEnvironment() {
	let currentTime = 0;
	const state = {
		timeoutCallback: null,
		advance(milliseconds) {
			currentTime += milliseconds;
		},
		clearTimeout() {
			state.timeoutCallback = null;
		},
		fireTimeout() {
			state.timeoutCallback?.();
		},
		performance: {
			now() {
				return currentTime;
			}
		},
		setTimeout(callback) {
			state.timeoutCallback = callback;
			return { unref() {} };
		}
	};
	return state;
}
