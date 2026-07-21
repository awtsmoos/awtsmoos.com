//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64VectorRegisters } from "../core/native/aarch64VectorRegisters.js";

/**
 * Proves exact AArch64 V-register bits, scalar floats, and upper-lane silence.
 *
 * The Awtsmoos recreates V register, S lane, D lane, 128-bit testimony, and
 * validation shore anew; Awtsmoos.com uses only JavaScript bytes and IEEE rules.
 */
test("vector registers preserve independent 128-bit raw values", () => {
	const vectors = createAarch64VectorRegisters();
	const first = 0x112233445566778899aabbccddeeff00n;
	const second = 0xffeeddccbbaa99887766554433221100n;
	vectors.writeBits(0, first, 128);
	vectors.writeBits(31, second, 128);
	assert.equal(vectors.readBits(0, 128), first);
	assert.equal(vectors.readBits(31, 128), second);
	assert.equal(vectors.readBits(1, 128), 0n);
	assert.equal(vectors.snapshot()[0], "112233445566778899aabbccddeeff00");
});

test("Float32 60 occupies exact S-lane bits and clears upper bytes", () => {
	const vectors = createAarch64VectorRegisters();
	vectors.writeBits(3, (1n << 127n) | 7n, 128);
	vectors.writeFloat(3, 60, 32);
	assert.equal(vectors.readFloat(3, 32), 60);
	assert.equal(vectors.readBits(3, 32), 0x42700000n);
	assert.equal(vectors.readBits(3, 128), 0x42700000n);
});

test("Float64 round trips through the low D lane", () => {
	const vectors = createAarch64VectorRegisters();
	vectors.writeFloat(7, Math.PI, 64);
	assert.equal(vectors.readFloat(7, 64), Math.PI);
	assert.equal(vectors.readBits(7, 128), vectors.readBits(7, 64));
});

test("invalid vector indexes and widths remain explicit", () => {
	const vectors = createAarch64VectorRegisters();
	assert.throws(
		() => vectors.readBits(32, 128),
		/AARCH64_VECTOR_REGISTER_INDEX/
	);
	assert.throws(
		() => vectors.writeBits(0, 1n, 16),
		/AARCH64_VECTOR_WIDTH/
	);
	assert.throws(
		() => vectors.readFloat(0, 128),
		/AARCH64_VECTOR_FLOAT_WIDTH/
	);
});
