//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CLOCK_MONOTONIC } from "../core/native/nativeLinuxClock.js";
import { createNativePthreadConditionAttributeState } from "../core/native/nativePthreadConditionAttributeState.js";

test("condition attributes preserve clock and sharing semantics", () => {
	const state = createNativePthreadConditionAttributeState();
	assert.equal(state.initialize(0x5000n).result, 0);
	assert.equal(state.setClock(0x5000n, BigInt(CLOCK_MONOTONIC)).result, 0);
	assert.equal(state.setProcessShared(0x5000n, 1n).result, 0);
	assert.deepEqual(state.resolve(0x5000n), { clockId: CLOCK_MONOTONIC, processShared: 1 });
	assert.equal(state.setClock(0x5000n, 99n).result, 22);
	assert.equal(state.destroy(0x5000n).result, 0);
	assert.equal(state.resolve(0x5000n), null);
});
