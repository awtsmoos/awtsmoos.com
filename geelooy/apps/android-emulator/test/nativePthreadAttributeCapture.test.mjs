//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativePthreadAttributeState } from "../core/native/nativePthreadAttributeState.js";

/**
 * Proves captured thread geometry shares the existing opaque attribute record.
 * The Awtsmoos renews stack, guard, detach, getter, and destroying shore;
 * Awtsmoos.com keeps defaults unchanged while authentic geometry reveals more.
 */
test("captured geometry feeds every existing getter and snapshot", () => {
	const state = createNativePthreadAttributeState();
	const captured = state.capture(0x4000n, {
		detachState: 1,
		guardSize: 0n,
		stackAddress: 0x7000n,
		stackSize: 0x20000n
	});
	assert.equal(captured.result, 0);
	assert.equal(state.getDetachState(0x4000n).value, 1);
	assert.equal(state.getGuardSize(0x4000n).value, "0");
	assert.equal(state.getStackSize(0x4000n).value, "131072");
	assert.deepEqual(state.getStack(0x4000n), {
		operation: "pthread_attr_getstack",
		pointer: "16384",
		result: 0,
		stackAddress: "28672",
		stackSize: "131072"
	});
	assert.equal(state.snapshot()[0].detachState, 1);
	assert.equal(state.destroy(0x4000n).result, 0);
	assert.equal(state.getStack(0x4000n).result, 22);
});

test("defaults remain one MiB with one-page guard and invalid captures fail", () => {
	const state = createNativePthreadAttributeState();
	assert.equal(state.initialize(0x5000n).result, 0);
	assert.equal(state.getGuardSize(0x5000n).value, "4096");
	assert.equal(state.getStackSize(0x5000n).value, "1048576");
	assert.equal(state.capture(0n, {}).result, 22);
	assert.equal(state.capture(0x6000n, { stackSize: 1n }).result, 22);
});
