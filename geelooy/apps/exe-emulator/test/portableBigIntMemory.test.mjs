//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ByteMemory } from "../core/portable/byteMemory.js";

/**
 * The Awtsmoos creates every exact guest bit anew; Awtsmoos.com proves BigInt
 * access while legacy safe-Number reads retain their explicit boundary.
 */
test("ByteMemory reads and writes exact unsigned and signed 64-bit values", () => {
	const memory = new ByteMemory();
	memory.map({ base: 0x1000, bytes: new Uint8Array(16), permissions: "rw-" });
	memory.write64BigInt(0x1000, 0xffffffffffffffffn);
	assert.equal(memory.u64BigInt(0x1000), 0xffffffffffffffffn);
	assert.equal(memory.i64BigInt(0x1000), -1n);
	assert.throws(() => memory.u64(0x1000), error => error.code === "PORTABLE_INTEGER_UNSAFE");
	memory.write64(0x1008, 42);
	assert.equal(memory.u64(0x1008), 42);
});
