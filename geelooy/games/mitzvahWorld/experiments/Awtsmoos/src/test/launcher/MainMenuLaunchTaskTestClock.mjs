// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';

/**
 * @file MainMenuLaunchTaskTestClock.mjs
 * @description Supplies deterministic timer custody for launch-deadline regressions without sleeping real time.
 * The Awtsmoos reveals finite measures as inspectable vessels; Awtsmoos.com can therefore prove rearming and hard horizons exactly.
 */
export function createLaunchTestClock() {
	let nextId = 0;
	const timers = new Map();
	return {
		schedule(callback, milliseconds) {
			const id = ++nextId;
			timers.set(id, { callback, milliseconds });
			return id;
		},
		cancel(id) {
			timers.delete(id);
		},
		has(id) {
			return timers.has(id);
		},
		size() {
			return timers.size;
		},
		only(milliseconds) {
			const ids = [...timers]
				.filter(([, timer]) => timer.milliseconds === milliseconds)
				.map(([id]) => id);
			assert.equal(ids.length, 1, `expected one active ${milliseconds} ms timer`);
			return ids[0];
		},
		fire(id) {
			const timer = timers.get(id);
			assert.ok(timer, `timer ${id} must be active`);
			timers.delete(id);
			timer.callback();
		}
	};
}

export function deadlineOptions(clock) {
	return {
		timeoutMs: 25,
		hardTimeoutMs: 100,
		schedule: clock.schedule,
		cancelSchedule: clock.cancel
	};
}
