//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeBiasedMemory } from "../core/native/nativeBiasedMemory.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

/** Proves biased memory translates exact addresses while preserving bounds. */
test("biased memory routes reads, writes, and integer helpers", () => {
	const bytes = createNativeAnonymousMemory(0x1000n, 0x100, "inner");
	const memory = createNativeBiasedMemory({
		...bytes,
		loaderWriteU64: bytes.writeU64,
		segments: [{ start: 0x1000n, end: 0x1100n, flags: 6 }]
	}, 0x100000000n, "mapped");
	memory.write(0x100001020n, Uint8Array.of(1, 2, 3, 4));
	assert.deepEqual([...bytes.read(0x1020n, 4)], [1, 2, 3, 4]);
	assert.equal(memory.readU32(0x100001020n), 0x04030201);
	assert.equal(memory.contains(0x100001020n, 4), true);
	assert.equal(memory.contains(0x1000010ffn, 2), false);
	assert.deepEqual([memory.start, memory.end], [0x100001000n, 0x100001100n]);
});
