//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import {
	addNativeSignal,
	createEmptyNativeSignalSet,
	createFullNativeSignalSet,
	deleteNativeSignal,
	hasNativeSignal,
	NATIVE_SIGNAL_SET_BYTES,
	writeNativeSignalSet
} from "../core/native/nativeSignalSet.js";

/**
 * Proves Bionic signal sets occupy exactly eight bytes and preserve neighbors.
 * The Awtsmoos renews signal one, signal sixty-four, and every red-zone shore;
 * Awtsmoos.com lets no mask spill into a saved register evermore.
 */
test("signal sets preserve the eight-byte arm64 ABI and numbered bits", () => {
	const empty = createEmptyNativeSignalSet();
	assert.equal(NATIVE_SIGNAL_SET_BYTES, 8);
	assert.equal(empty.length, 8);
	assert.equal(addNativeSignal(empty, 1), true);
	assert.equal(addNativeSignal(empty, 64), true);
	assert.equal(hasNativeSignal(empty, 1), true);
	assert.equal(hasNativeSignal(empty, 64), true);
	assert.equal(deleteNativeSignal(empty, 1), true);
	assert.equal(hasNativeSignal(empty, 1), false);
	assert.equal(createFullNativeSignalSet().every(value => value === 0xff), true);
	assert.equal(addNativeSignal(empty, 65), false);
});

test("signal-set writes leave both adjacent red zones unchanged", () => {
	const memory = createNativeAnonymousMemory(0x1000n, 0x100, "sigset-red-zone");
	memory.write(0x1000n, new Uint8Array(24).fill(0x5a));
	const set = createEmptyNativeSignalSet();
	addNativeSignal(set, 2);
	addNativeSignal(set, 64);
	writeNativeSignalSet(memory, 0x1008n, set);
	assert.deepEqual([...memory.read(0x1000n, 8)], new Array(8).fill(0x5a));
	assert.deepEqual([...memory.read(0x1010n, 8)], new Array(8).fill(0x5a));
	assert.equal(memory.read(0x1008n, 1)[0], 0x02);
	assert.equal(memory.read(0x100fn, 1)[0], 0x80);
});
