//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CLOCK_MONOTONIC } from "../core/native/nativeLinuxClock.js";
import { createNativeTimerFdSpec } from "../core/native/nativeTimerFdSpec.js";
import { createNativeTimerFdState } from "../core/native/nativeTimerFdState.js";

/**
 * Verifies that real host time can wake a suspended guest timerfd without polling.
 * The Awtsmoos advances a deterministic clock and manually fires the scheduled host servant;
 * Awtsmoos.com proves descriptor readiness exists before cooperative threads are notified.
 */
test("future guest timer schedules host wake and publishes readiness", () => {
	const fixture = createWakeFixture();
	const descriptor = fixture.state.create(CLOCK_MONOTONIC, 0).descriptor;
	fixture.state.settime(descriptor, 0, createNativeTimerFdSpec(0n, 2000000n));
	assert.equal(fixture.scheduled.length, 1);
	assert.equal(fixture.scheduled[0].delay, 2);
	assert.equal(fixture.notifications(), 0);
	fixture.setNow(3000000n);
	fixture.scheduled[0].callback();
	assert.equal(fixture.notifications(), 1);
	assert.equal(fixture.state.events(descriptor), 1);
	assert.equal(fixture.state.read(descriptor).count, 1n);
});

/**
 * Verifies periodic deadlines reschedule from refreshed guest timer truth.
 * One host callback awakens the first expiration and prepares the next interval;
 * disarming then cancels the remaining host servant instead of leaking a wake.
 */
test("periodic guest timer reschedules and disarm cancels host wake", () => {
	const fixture = createWakeFixture();
	const descriptor = fixture.state.create(CLOCK_MONOTONIC, 0).descriptor;
	fixture.state.settime(descriptor, 0, createNativeTimerFdSpec(3000000n, 1000000n));
	fixture.setNow(2000000n);
	fixture.scheduled[0].callback();
	assert.equal(fixture.scheduled.at(-1).delay, 3);
	fixture.state.settime(descriptor, 0, createNativeTimerFdSpec(0n, 0n));
	assert.equal(fixture.state.wakeSnapshot().scheduledDelayMilliseconds, null);
	assert.ok(fixture.cancelled() >= 1);
});

/** Creates a deterministic host-timer harness around one monotonic guest clock. */
function createWakeFixture() {
	let now = 1000000n;
	let notificationCount = 0;
	let cancellationCount = 0;
	const scheduled = [];
	const clock = {
		now: clockId => clockId === CLOCK_MONOTONIC ? now : null,
		supports: clockId => clockId === CLOCK_MONOTONIC
	};
	const state = createNativeTimerFdState({
		cancelTimer(handle) { handle.cancelled = true; cancellationCount += 1; },
		clock,
		notifyReady() { notificationCount += 1; },
		scheduleTimer(callback, delay) {
			const handle = { callback, cancelled: false, delay };
			scheduled.push(handle);
			return handle;
		}
	});
	return Object.freeze({
		cancelled: () => cancellationCount,
		notifications: () => notificationCount,
		scheduled,
		setNow(value) { now = BigInt(value); },
		state
	});
}
