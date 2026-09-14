//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createPlatformTimerPumpFixture,
	PLATFORM_THREAD
} from "./nativeAndroidPlatformLooperPumpFixture.mjs";

/**
 * Proves an expired timerfd enters authentic guest AArch64 and is consumed by read().
 * The callback itself performs the production native `read` import; JavaScript only
 * advances deterministic guest time and inspects resulting guest/runtime testimony.
 */
test("platform timerfd callback executes guest read and consumes expirations", () => {
	const fixture = createPlatformTimerPumpFixture();
	fixture.arm(5n, 10n);
	fixture.setNow(1020n);
	assert.equal(fixture.timers.events(fixture.descriptor), 1);
	const delivered = fixture.pump.drain();
	assert.equal(delivered.length, 1);
	assert.equal(delivered[0].kept, true);
	assert.equal(delivered[0].thread, PLATFORM_THREAD.toString());
	assert.equal(fixture.readExpirationCount(), 3n);
	assert.equal(fixture.timers.events(fixture.descriptor), 0);
	assert.equal(fixture.pump.snapshot().totalCallbacks, 1);
	assert.deepEqual(fixture.pump.drain(), []);
});

/** Proves the Android callback zero-return contract removes the fd registration. */
test("zero callback return unregisters the platform looper descriptor", () => {
	const fixture = createPlatformTimerPumpFixture({ callbackReturn: 0 });
	fixture.arm(0n, 10n);
	fixture.setNow(1010n);
	const delivered = fixture.pump.drain();
	assert.equal(delivered.length, 1);
	assert.equal(delivered[0].kept, false);
	assert.equal(fixture.readExpirationCount(), 1n);
	const looper = fixture.loopers.snapshot()[0];
	assert.equal(looper.descriptors.some(record => {
		return record.fd === fixture.descriptor;
	}), false);
});

/**
 * Proves host platform service cannot steal wake or identifier-only poll results.
 * Those events remain queued until the guest explicitly performs ordinary polling.
 */
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
