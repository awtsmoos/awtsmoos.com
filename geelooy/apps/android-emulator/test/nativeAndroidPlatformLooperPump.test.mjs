//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createPlatformTimerPumpFixture, PLATFORM_THREAD } from "./nativeAndroidPlatformLooperPumpFixture.mjs";

/** Proves an expired timerfd executes guest read and receives the first callback ordinal. */
test("platform timerfd callback executes guest read and records ordinal", () => {
	const fixture = createPlatformTimerPumpFixture();
	fixture.arm(5n, 10n);
	fixture.setNow(1020n);
	const delivered = fixture.pump.drain();
	assert.equal(delivered.length, 1);
	assert.equal(delivered[0].callbackOrdinal, 1);
	assert.equal(delivered[0].callTransitions, null);
	assert.equal(delivered[0].kept, true);
	assert.equal(delivered[0].thread, PLATFORM_THREAD.toString());
	assert.equal(fixture.readExpirationCount(), 3n);
	assert.equal(fixture.timers.events(fixture.descriptor), 0);
	assert.equal(fixture.pump.snapshot().totalCallbacks, 1);
	assert.deepEqual(fixture.pump.drain(), []);
});

/** Proves zero-return lifetime semantics remain unchanged beside ordinal testimony. */
test("zero callback return unregisters the platform looper descriptor", () => {
	const fixture = createPlatformTimerPumpFixture({ callbackReturn: 0 });
	fixture.arm(0n, 10n);
	fixture.setNow(1010n);
	const delivered = fixture.pump.drain();
	assert.equal(delivered.length, 1);
	assert.equal(delivered[0].callbackOrdinal, 1);
	assert.equal(delivered[0].kept, false);
	assert.equal(fixture.readExpirationCount(), 1n);
	const looper = fixture.loopers.snapshot()[0];
	assert.equal(looper.descriptors.some(record => record.fd === fixture.descriptor), false);
});

/** Proves host service never steals wake or callback-free events from guest polling. */
test("platform pump preserves wake and callback-free events for guest polling", () => {
	const fixture = createPlatformTimerPumpFixture();
	assert.equal(fixture.loopers.addFd(fixture.handle, {
		callback: 0n,
		data: 0x2222n,
		events: 1,
		fd: 88,
		ident: 42
	}), true);
	assert.equal(fixture.loopers.enqueue(fixture.handle, 88, 1), true);
	assert.equal(fixture.loopers.wake(fixture.handle), true);
	assert.deepEqual(fixture.pump.drain(), []);
	assert.equal(fixture.loopers.poll(PLATFORM_THREAD).kind, "wake");
	const event = fixture.loopers.poll(PLATFORM_THREAD);
	assert.equal(event.kind, "event");
	assert.equal(event.fd, 88);
	assert.equal(event.ident, 42);
});
