//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAndroidLooperState } from "../core/native/nativeAndroidLooperState.js";
import { createNativeAndroidPlatformLooperPump } from "../core/native/nativeAndroidPlatformLooperPump.js";

const THREAD = 0x6fffe0000000n;

/**
 * Proves a platform callback that crosses JNI into guest Java keeps one drain lease
 * until its promise settles, preventing duplicate delivery while Java is executing.
 */
test("platform looper awaits one asynchronous JNI-capable callback", async () => {
	const loopers = createNativeAndroidLooperState({
		descriptorEvents(fd) {
			return fd === 71 ? 1 : 0;
		}
	});
	const handle = loopers.prepare(THREAD);
	loopers.addFd(handle, {
		callback: 0x1234n,
		data: 0x5678n,
		events: 1,
		fd: 71,
		ident: -2
	});
	let settle = null;
	const machineState = Object.freeze({
		imports: Object.freeze({}),
		memory: Object.freeze({}),
		runPlatformGuestFunction() {
			return new Promise(resolve => {
				settle = resolve;
			});
		},
		stack: Object.freeze({ end: "16384" }),
		thread: Object.freeze({ pointer: THREAD.toString() })
	});
	const pump = createNativeAndroidPlatformLooperPump({
		machineState,
		registry: Object.freeze({}),
		state: loopers
	});
	assert.deepEqual(pump.drain(), []);
	assert.equal(pump.snapshot().draining, true);
	assert.deepEqual(pump.drain(), []);
	assert.equal(typeof settle, "function");
	settle(Object.freeze({
		report: Object.freeze({ reason: "return" }),
		signedInt32: 1
	}));
	await Promise.resolve();
	await Promise.resolve();
	const snapshot = pump.snapshot();
	assert.equal(snapshot.draining, false);
	assert.equal(snapshot.totalCallbacks, 1);
	assert.equal(snapshot.totalFailures, 0);
	assert.equal(snapshot.lastError, null);
	assert.equal(snapshot.lastDrain.length, 1);
	assert.equal(snapshot.lastDrain[0].callback, "4660");
	assert.equal(snapshot.lastDrain[0].kept, true);
});
