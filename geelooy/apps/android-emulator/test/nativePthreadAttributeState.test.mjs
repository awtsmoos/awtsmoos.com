//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativePthreadAttributeState,
	NATIVE_PTHREAD_STACK_MIN
} from "../core/native/nativePthreadAttributeState.js";

test("pthread attributes expose Android defaults and valid transitions", () => {
	const state = createNativePthreadAttributeState();
	assert.equal(state.initialize(0n).result, 22);
	assert.equal(state.initialize(0x4000n).result, 0);
	assert.equal(state.getDetachState(0x4000n).value, 0);
	assert.equal(state.getGuardSize(0x4000n).value, "4096");
	assert.equal(state.getStackSize(0x4000n).value, "1048576");
	assert.equal(state.getStack(0x4000n).stackAddress, "0");
	assert.equal(state.setDetachState(0x4000n, 1n).result, 0);
	assert.equal(state.setStackSize(0x4000n, NATIVE_PTHREAD_STACK_MIN).result, 0);
	assert.equal(state.setGuardSize(0x4000n, 0x1000n).result, 0);
	assert.equal(state.setDetachState(0x4000n, 7n).result, 22);
	assert.equal(state.setStackSize(0x4000n, NATIVE_PTHREAD_STACK_MIN - 1n).result, 22);
	assert.equal(state.destroy(0x4000n).result, 0);
	assert.equal(state.destroy(0x4000n).result, 22);
});

test("snapshot preserves stack, guard, detach, and pointer evidence", () => {
	const state = createNativePthreadAttributeState();
	state.initialize(0x5000n);
	assert.deepEqual(state.snapshot(), [{
		detachState: 0,
		guardSize: "4096",
		pointer: "20480",
		stackAddress: "0",
		stackSize: "1048576"
	}]);
});
