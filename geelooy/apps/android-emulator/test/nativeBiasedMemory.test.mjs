//B"H
//Boruch Hashem
//Blessed be He

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

/** Proves the hot segment cache remains exact while execution crosses mappings. */
test("biased segment cache follows repeated and crossed ELF mappings", () => {
	const memory = createNativeBiasedMemory({
		segments: [
			{ start: 0x1000n, end: 0x1100n, flags: 5 },
			{ start: 0x3000n, end: 0x3200n, flags: 6 }
		],
		read() {
			return new Uint8Array(0);
		},
		write() {}
	}, 0x200000000n, "multi-segment");
	assert.equal(memory.contains(0x200001010n, 4), true);
	assert.equal(memory.contains(0x200003100n, 8), true);
	assert.equal(memory.contains(0x200003108n, 8), true);
	assert.equal(memory.contains(0x200001020n, 8), true);
	assert.equal(memory.contains(0x200002000n, 1), false);
	assert.equal(memory.contains(0x2000010ffn, 2), false);
	assert.deepEqual(
		[memory.start, memory.end],
		[0x200001000n, 0x200003200n]
	);
});
