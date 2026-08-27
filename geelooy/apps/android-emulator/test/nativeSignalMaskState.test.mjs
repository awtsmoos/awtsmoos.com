//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeSignalMaskState } from "../core/native/nativeSignalMaskState.js";
import { addNativeSignal, createEmptyNativeSignalSet, hasNativeSignal } from "../core/native/nativeSignalSet.js";

test("thread masks block, unblock, replace, and clear unmaskable signals", () => {
	const state = createNativeSignalMaskState();
	const incoming = createEmptyNativeSignalSet();
	for (const signal of [2, 9, 19]) addNativeSignal(incoming, signal);
	assert.equal(state.apply(0x5000n, 0, incoming).ok, true);
	assert.equal(hasNativeSignal(state.get(0x5000n), 2), true);
	assert.equal(hasNativeSignal(state.get(0x5000n), 9), false);
	assert.equal(hasNativeSignal(state.get(0x5000n), 19), false);
	assert.equal(state.apply(0x5000n, 1, incoming).ok, true);
	assert.equal(hasNativeSignal(state.get(0x5000n), 2), false);
	assert.equal(state.apply(0x5000n, 99, incoming).ok, false);
});
