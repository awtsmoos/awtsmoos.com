//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	CLOCK_BOOTTIME,
	CLOCK_MONOTONIC,
	CLOCK_REALTIME,
	createNativeLinuxClock
} from "../core/native/nativeLinuxClock.js";

test("injected Linux clocks expose exact nanosecond testimony", () => {
	const clock = createNativeLinuxClock({
		monotonicNanoseconds: () => 1234n,
		realtimeNanoseconds: () => 5678n
	});
	assert.equal(clock.now(CLOCK_REALTIME), 5678n);
	assert.equal(clock.now(CLOCK_MONOTONIC), 1234n);
	assert.equal(clock.now(CLOCK_BOOTTIME), 1234n);
	assert.equal(clock.now(99), null);
	assert.equal(clock.supports(CLOCK_MONOTONIC), true);
	assert.equal(clock.supports(99), false);
});

test("negative injected values clamp to the beginning of time", () => {
	const clock = createNativeLinuxClock({
		monotonicNanoseconds: () => -1n,
		realtimeNanoseconds: () => -2n
	});
	assert.equal(clock.now(CLOCK_REALTIME), 0n);
	assert.equal(clock.now(CLOCK_MONOTONIC), 0n);
});
