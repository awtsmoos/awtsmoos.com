//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAndroidLooperState } from "../core/native/nativeAndroidLooperState.js";
import { CLOCK_MONOTONIC } from "../core/native/nativeLinuxClock.js";
import { createNativeTimerFdSpec } from "../core/native/nativeTimerFdSpec.js";
import { createNativeTimerFdState } from "../core/native/nativeTimerFdState.js";

const THREAD = 0x5000n;

test("expired timerfd becomes ALooper input readiness without consumption", () => {
	const fixture = createFixture();
	const handle = fixture.loopers.prepare(THREAD);
	assert.equal(fixture.loopers.addFd(handle, {
		callback: 0n,
		data: 0xabcden,
		events: 1,
		fd: fixture.descriptor,
		ident: 42
	}), true);
	assert.equal(fixture.loopers.poll(THREAD).kind, "timeout");
	fixture.setNow(1100n);
	const event = fixture.loopers.poll(THREAD);
	assert.equal(event.kind, "event");
	assert.equal(event.fd, fixture.descriptor);
	assert.equal(event.events, 1);
	assert.equal(event.ident, 42);
	assert.equal(fixture.timers.read(fixture.descriptor).count, 1n);
	assert.equal(fixture.loopers.poll(THREAD).kind, "timeout");
});

test("explicit wake and queued events retain priority over timer readiness", () => {
	const fixture = createFixture();
	const handle = fixture.loopers.prepare(THREAD);
	fixture.loopers.addFd(handle, {
		callback: 0n,
		data: 0n,
		events: 1,
		fd: fixture.descriptor,
		ident: 42
	});
	fixture.loopers.enqueue(handle, fixture.descriptor, 1);
	fixture.loopers.wake(handle);
	fixture.setNow(1100n);
	assert.equal(fixture.loopers.poll(THREAD).kind, "wake");
	assert.equal(fixture.loopers.poll(THREAD).kind, "event");
	assert.equal(fixture.loopers.poll(THREAD).kind, "event");
});

function createFixture() {
	let now = 1000n;
	const clock = {
		now() { return now; },
		supports(clockId) { return clockId === CLOCK_MONOTONIC; }
	};
	const timers = createNativeTimerFdState({ clock });
	const descriptor = timers.create(CLOCK_MONOTONIC, 0).descriptor;
	timers.settime(descriptor, 0, createNativeTimerFdSpec(0n, 100n));
	const loopers = createNativeAndroidLooperState({
		descriptorEvents: fd => timers.events(fd)
	});
	return {
		descriptor,
		loopers,
		setNow(value) { now = BigInt(value); },
		timers
	};
}
