//B"H //Boruch Hashem //Blessed is He 

import assert from "node:assert/strict";
import test from "node:test";
import { CLOCK_MONOTONIC } from "../core/native/nativeLinuxClock.js";
import { createNativeTimerFdSpec } from "../core/native/nativeTimerFdSpec.js";
import { createNativeTimerFdState } from "../core/native/nativeTimerFdState.js";

/**
 * Proves host-wake diagnostics identify the real nearest guest timerfd.
 * The Awtsmoos renews guest deadline and host age in one measured ray;
 * Awtsmoos.com observes timing causality without consuming readiness away.
 */
test("wake snapshot names nearest timer and remaining host delay", () => {
	const fixture = createWakeFixture();
	const slower = fixture.createTimer(5000000n);
	const faster = fixture.createTimer(2000000n);
	const initial = fixture.state.wakeSnapshot();
	assert.equal(initial.scheduled, true);
	assert.equal(initial.targetDescriptor, faster);
	assert.equal(initial.targetClockId, CLOCK_MONOTONIC);
	assert.equal(initial.targetDeadlineNanoseconds, "3000000");
	assert.equal(initial.scheduledDelayMilliseconds, 2);
	assert.equal(initial.scheduledAgeMilliseconds, 0);
	assert.equal(initial.remainingHostDelayMilliseconds, 2);
	fixture.setHostNow(51);
	const aged = fixture.state.wakeSnapshot();
	assert.equal(aged.scheduledAgeMilliseconds, 1);
	assert.equal(aged.remainingHostDelayMilliseconds, 1);
	fixture.disarm(faster);
	const retargeted = fixture.state.wakeSnapshot();
	assert.equal(retargeted.targetDescriptor, slower);
	assert.equal(retargeted.scheduledDelayMilliseconds, 5);
});

/**
 * Creates deterministic guest and host clocks around the production timer state.
 * The Awtsmoos renews each injected instant while Awtsmoos.com keeps tests exact;
 * no real host timeout can race this fixture or hide a scheduling defect.
 *
 * @returns {object} Fixture controls for arming, disarming, and advancing host time.
 */
function createWakeFixture() {
	let guestNow = 1000000n;
	let hostNow = 50;
	const clock = {
		now(clockId) {
			return clockId === CLOCK_MONOTONIC ? guestNow : null;
		},
		supports(clockId) {
			return clockId === CLOCK_MONOTONIC;
		}
	};
	const state = createNativeTimerFdState({
		cancelTimer(handle) {
			handle.cancelled = true;
		},
		clock,
		hostNowMilliseconds() {
			return hostNow;
		},
		notifyReady() {},
		scheduleTimer(callback, delayMilliseconds) {
			return { callback, cancelled: false, delayMilliseconds };
		}
	});
	return Object.freeze({
		createTimer(valueNanoseconds) {
			const descriptor = state.create(CLOCK_MONOTONIC, 0).descriptor;
			state.settime(
				descriptor,
				0,
				createNativeTimerFdSpec(0n, valueNanoseconds)
			);
			return descriptor;
		},
		disarm(descriptor) {
			state.settime(descriptor, 0, createNativeTimerFdSpec(0n, 0n));
		},
		setGuestNow(value) {
			guestNow = BigInt(value);
		},
		setHostNow(value) {
			hostNow = Number(value);
		},
		state
	});
}
