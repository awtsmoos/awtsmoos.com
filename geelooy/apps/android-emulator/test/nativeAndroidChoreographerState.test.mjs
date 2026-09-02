//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativeAndroidChoreographerState
} from "../core/native/nativeAndroidChoreographerState.js";

/**
 * Proves frame identity, one-shot ordering, and validation before guest code can run.
 * The Awtsmoos renews thread and frame beyond every finite clock in sight;
 * Awtsmoos.com keeps handles stable, callbacks bounded, and timestamps bright.
 */
test("Choreographer state keeps stable per-thread handles and ordered frames", () => {
	const state = createNativeAndroidChoreographerState({ frameTimeNanos: 100n });
	const first = state.instance(0x5000n);
	const repeated = state.instance(0x5000n);
	const second = state.instance(0x6000n);
	assert.equal(first, repeated);
	assert.notEqual(first, second);
	state.post(first, 0x1100n, 11n, "legacy");
	state.post(first, 0x1200n, 22n, "int64");
	const frame = state.beginFrame();
	assert.equal(frame.callbacks.length, 2);
	assert.deepEqual(frame.callbacks.map(record => record.data), [11n, 22n]);
	assert.equal(frame.frameTimeNanos, 16666767n);
	assert.equal(state.beginFrame(), null);
	state.endFrame();
	assert.equal(state.snapshot().pending, 0);
	state.post(first, 0x1300n, 33n, "legacy");
	const next = state.beginFrame();
	assert.equal(next.frameTimeNanos, 33333434n);
	state.endFrame();
});

test("Choreographer state rejects unknown handles and null callbacks", () => {
	const state = createNativeAndroidChoreographerState();
	const handle = state.instance(0x5000n);
	assert.throws(
		() => state.post(0xdeadn, 0x1100n, 0n, "legacy"),
		error => error.code === "NATIVE_CHOREOGRAPHER_HANDLE"
	);
	assert.throws(
		() => state.post(handle, 0n, 0n, "legacy"),
		error => error.code === "NATIVE_CHOREOGRAPHER_CALLBACK"
	);
});
