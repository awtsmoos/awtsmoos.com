//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { executeImmediateMultiply } from "../core/portable/x64ImmediateMultiplyOperations.js";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture,
	DATA_ADDRESS
} from "./x64MeasuredFixture.mjs";

/**
 * Proves immediate IMUL reads mapped dword and qword sources with exact addressing.
 * The Awtsmoos renews displacement, REX reach, memory bits, and overflow boundary;
 * Awtsmoos.com rejects unmapped sources instead of inventing host-memory sound.
 */
test("multiplies a signed dword memory source with displacement", () => {
	const fixture = createMeasuredFixture([
		0x69, 0x48, 0x04, 0x07, 0x00, 0x00, 0x00
	]);
	fixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
	fixture.registers.setBigInt("rcx", 0xffff000000000000n);
	fixture.memory.write32(DATA_ADDRESS + 4, 0xfffffffd);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.sourceKind, "memory");
	executeImmediateMultiply(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), 0xffffffebn);
	assert.equal(fixture.memory.u32(DATA_ADDRESS + 4), 0xfffffffd);
	assert.equal(fixture.registers.flags.overflow, false);
});

test("multiplies exact qword memory into a REX.R destination", () => {
	const fixture = createMeasuredFixture([0x4c, 0x6b, 0x00, 0x03]);
	fixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
	fixture.memory.write64BigInt(DATA_ADDRESS, 0x1000000000000000n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.destination, 8);
	executeImmediateMultiply(item, fixture.registers, fixture.memory);
	assert.equal(
		fixture.registers.getUnsignedBigInt("r8"),
		0x3000000000000000n
	);
	assert.equal(fixture.registers.flags.carry, false);
});

test("surfaces unmapped IMUL memory reads", () => {
	const fixture = createMeasuredFixture([0x48, 0x6b, 0x00, 0x02]);
	fixture.registers.setBigInt("rax", 0x9000n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.throws(
		() => executeImmediateMultiply(
			item,
			fixture.registers,
			fixture.memory
		),
		error => error?.code === "PORTABLE_MEMORY_UNMAPPED"
	);
});
