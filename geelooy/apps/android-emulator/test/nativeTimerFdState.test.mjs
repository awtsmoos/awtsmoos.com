//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CLOCK_MONOTONIC } from "../core/native/nativeLinuxClock.js";
import { createNativeTimerFdSpec } from "../core/native/nativeTimerFdSpec.js";
import {
	createNativeTimerFdState,
	TFD_CLOEXEC,
	TFD_NONBLOCK,
	TFD_TIMER_ABSTIME
} from "../core/native/nativeTimerFdState.js";

test("authentic create accepts monotonic nonblock and cloexec flags", () => {
	const fixture = createFixture();
	const created = fixture.state.create(
		CLOCK_MONOTONIC,
		TFD_NONBLOCK | TFD_CLOEXEC
	);
	assert.equal(created.ok, true);
	assert.equal(created.descriptor, 0x40000000);
	assert.equal(fixture.state.snapshot()[0].flags, 0x80800);
});

test("one-shot readiness consumes one expiration", () => {
	const fixture = createFixture();
	const descriptor = fixture.state.create(CLOCK_MONOTONIC, 0).descriptor;
	fixture.state.settime(descriptor, 0, createNativeTimerFdSpec(0n, 100n));
	assert.equal(fixture.state.events(descriptor), 0);
	fixture.setNow(1100n);
	assert.equal(fixture.state.events(descriptor), 1);
	assert.deepEqual(fixture.state.read(descriptor), {
		count: 1n,
		ok: true,
		ready: true
	});
	assert.equal(fixture.state.events(descriptor), 0);
});

test("periodic and absolute timers count elapsed intervals without loops", () => {
	const fixture = createFixture();
	const descriptor = fixture.state.create(CLOCK_MONOTONIC, 0).descriptor;
	fixture.state.settime(descriptor, TFD_TIMER_ABSTIME,
		createNativeTimerFdSpec(5n, 1010n));
	fixture.setNow(1025n);
	assert.equal(fixture.state.read(descriptor).count, 4n);
	fixture.setNow(1030n);
	assert.equal(fixture.state.read(descriptor).count, 1n);
});

test("close permits lowest descriptor reuse and invalid creation is bounded", () => {
	const fixture = createFixture(1);
	const created = fixture.state.create(CLOCK_MONOTONIC, 0);
	assert.equal(fixture.state.create(CLOCK_MONOTONIC, 0).error, "capacity");
	assert.equal(fixture.state.close(created.descriptor), true);
	assert.equal(fixture.state.create(CLOCK_MONOTONIC, 0).descriptor, created.descriptor);
	assert.equal(fixture.state.create(99, 0).error, "invalid");
});

function createFixture(capacity = 8) {
	let now = 1000n;
	const clock = {
		now(clockId) {
			return clockId === CLOCK_MONOTONIC ? now : null;
		},
		supports(clockId) {
			return clockId === CLOCK_MONOTONIC;
		}
	};
	return {
		setNow(value) {
			now = BigInt(value);
		},
		state: createNativeTimerFdState({ capacity, clock })
	};
}
