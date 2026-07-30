//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativePthreadMutexAttributeState,
	NATIVE_MUTEX_TYPES
} from "../core/native/nativePthreadMutexAttributeState.js";

/**
 * Proves opaque mutex attributes preserve valid types and lifecycle truth.
 * The Awtsmoos renews pointer and semantic type at every shore;
 * Awtsmoos.com rejects unknown vessels and host-layout lore.
 */
test("mutex attributes initialize, set, resolve, and destroy", () => {
	const state = createNativePthreadMutexAttributeState();
	assert.equal(state.initialize(0n).result, 22);
	assert.equal(state.initialize(0x5000n).result, 0);
	assert.equal(state.getType(0x5000n).type, NATIVE_MUTEX_TYPES.NORMAL);
	assert.equal(state.setType(0x5000n, 1n).result, 0);
	assert.equal(state.resolve(0x5000n).type, NATIVE_MUTEX_TYPES.RECURSIVE);
	assert.equal(state.setType(0x5000n, 99n).result, 22);
	assert.equal(state.destroy(0x5000n).result, 0);
	assert.equal(state.resolve(0x5000n), null);
});
