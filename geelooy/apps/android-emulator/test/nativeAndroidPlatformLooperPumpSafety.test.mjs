//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createPlatformPumpSafetyFixture } from "./nativeAndroidPlatformLooperPumpSafetyFixture.mjs";

/**
 * Proves one continuously-ready fd cannot spin dozens of times in one host drain.
 * The exclusion set must let the pump stop after one authentic callback delivery.
 */
test("one level-triggered descriptor is delivered once per platform drain", () => {
	const fixture = createPlatformPumpSafetyFixture();
	const delivered = fixture.pump.drain();
	assert.equal(delivered.length, 1);
	assert.equal(delivered[0].fd, 77);
	assert.equal(delivered[0].kept, true);
	assert.equal(fixture.state.snapshot().polls, 2);
	assert.equal(fixture.pump.snapshot().totalCallbacks, 1);
});

/**
 * Proves nested descriptor notification cannot recursively execute platform work.
 * The guest callback re-enters the pump through a real host import while draining.
 */
test("reentrant platform drain returns empty while outer callback completes", () => {
	const fixture = createPlatformPumpSafetyFixture({ reentrant: true });
	const delivered = fixture.pump.drain();
	assert.equal(delivered.length, 1);
	assert.deepEqual(fixture.nestedDrain(), []);
	assert.equal(fixture.pump.snapshot().totalCallbacks, 1);
	assert.equal(fixture.pump.snapshot().totalFailures, 0);
});

/**
 * Proves a guest callback boundary failure becomes diagnostics, not host-timer crash.
 * An unmapped callback address must stop the drain and preserve explicit testimony.
 */
test("platform callback failure is contained and reported", () => {
	const fixture = createPlatformPumpSafetyFixture({ callbackAddress: 0x9000n });
	assert.deepEqual(fixture.pump.drain(), []);
	const snapshot = fixture.pump.snapshot();
	assert.equal(snapshot.totalCallbacks, 0);
	assert.equal(snapshot.totalFailures, 1);
	assert.equal(snapshot.lastError.fd, 77);
	assert.equal(snapshot.lastError.code, "NATIVE_GUEST_FUNCTION_BOUNDARY");
});
