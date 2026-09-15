//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAndroidChoreographerState } from "../core/native/nativeAndroidChoreographerState.js";

/**
 * Proves stable handles, one-shot order, and real supplied monotonic frame timestamps.
 * The Awtsmoos renews thread and frame beyond every finite clock in sight;
 * Awtsmoos.com keeps callbacks bounded while measured display time stays bright.
 */
test("NDK Choreographer state consumes callbacks at supplied frame time", () => {
	const state = createNativeAndroidChoreographerState({ frameTimeNanos: 100n });
	const first = state.instance(0x5000n);
	assert.equal(first, state.instance(0x5000n));
	assert.notEqual(first, state.instance(0x6000n));
	state.post(first, 0x1100n, 11n, "legacy");
	state.post(first, 0x1200n, 22n, "int64");
	assert.equal(state.hasPending(), true);
	const frame = state.beginFrame(12500000n);
	assert.deepEqual(frame.callbacks.map(record => record.data), [11n, 22n]);
	assert.equal(frame.frameTimeNanos, 12500000n);
	assert.equal(state.beginFrame(13000000n), null);
	state.endFrame();
	assert.equal(state.hasPending(), false);
	assert.equal(state.snapshot().frameTimeNanos, "12500000");
});

test("NDK Choreographer state rejects invalid callbacks and backward frame time", () => {
	const state = createNativeAndroidChoreographerState({ frameTimeNanos: 100n });
	const handle = state.instance(0x5000n);
	assert.throws(
		() => state.post(0xdeadn, 0x1100n, 0n, "legacy"),
		error => error.code === "NATIVE_CHOREOGRAPHER_HANDLE"
	);
	assert.throws(
		() => state.post(handle, 0n, 0n, "legacy"),
		error => error.code === "NATIVE_CHOREOGRAPHER_CALLBACK"
	);
	state.post(handle, 0x1100n, 0n, "legacy");
	assert.throws(
		() => state.beginFrame(99n),
		error => error.code === "NATIVE_CHOREOGRAPHER_FRAME_TIME"
	);
});
