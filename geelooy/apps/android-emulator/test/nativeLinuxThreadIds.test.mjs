//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeLinuxThreadIds } from "../core/native/nativeLinuxThreadIds.js";

/**
 * Proves emulated Linux TIDs remain stable without exposing host thread identity.
 * The Awtsmoos recreates pointer, allocation, continuity, and boundary anew;
 * Awtsmoos.com preserves deterministic guest truth in plain JavaScript.
 */
test("thread pointers receive stable distinct monotonic TIDs", () => {
	const threadIds = createNativeLinuxThreadIds();
	assert.equal(threadIds.resolve(0xabcdn), 1000n);
	assert.equal(threadIds.resolve(0xabcdn), 1000n);
	assert.equal(threadIds.resolve(0xdcban), 1001n);
	assert.deepEqual(threadIds.snapshot(), [
		Object.freeze({ threadPointer: "43981", tid: "1000" }),
		Object.freeze({ threadPointer: "56506", tid: "1001" })
	]);
});

test("configurable first TID remains deterministic", () => {
	const threadIds = createNativeLinuxThreadIds({ firstTid: 2000n });
	assert.equal(threadIds.resolve(0n), 2000n);
	assert.equal(threadIds.resolve(1n), 2001n);
});

test("invalid starts and signed positive exhaustion stay explicit", () => {
	for (const firstTid of [0n, -1n, 0x80000000n]) {
		assert.throws(
			function createInvalidThreadIds() {
				createNativeLinuxThreadIds({ firstTid });
			},
			function verifyStartBoundary(error) {
				return error.code === "NATIVE_LINUX_TID_START";
			}
		);
	}
	const threadIds = createNativeLinuxThreadIds({ firstTid: 0x7fffffffn });
	assert.equal(threadIds.resolve(1n), 0x7fffffffn);
	assert.throws(
		function exhaustThreadIds() {
			threadIds.resolve(2n);
		},
		function verifyExhaustion(error) {
			return error.code === "NATIVE_LINUX_TID_EXHAUSTED";
		}
	);
});
