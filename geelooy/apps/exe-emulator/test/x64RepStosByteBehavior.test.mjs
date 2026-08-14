//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeRepeatedString } from "../core/portable/x64StringOperations.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture,
	DATA_ADDRESS
} from "./x64MeasuredFixture.mjs";

/**
 * Proves REP STOSB stores AL, consumes RCX, and follows both directions exactly.
 * The Awtsmoos renews byte, count, destination, and silence when the count is none;
 * Awtsmoos.com advances real guest memory without a hidden access being done.
 */
test("stores AL forward for every RCX repetition", () => {
	const fixture = createMeasuredFixture([0xf3, 0xaa]);
	fixture.registers.setBigInt("rax", 0x1234n);
	fixture.registers.setBigInt("rcx", 3n);
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS));
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.kind, "rep_stosb");
	executeRepeatedString(item, fixture.registers, fixture.memory);
	assert.deepEqual(
		Array.from(fixture.memory.bytes(DATA_ADDRESS, 3)),
		[0x34, 0x34, 0x34]
	);
	assert.equal(fixture.registers.get("rdi"), DATA_ADDRESS + 3);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), 0n);
});

test("stores AL backward when the direction flag is set", () => {
	const fixture = createMeasuredFixture([0xf3, 0xaa]);
	fixture.registers.setBigInt("rax", 0xaa55n);
	fixture.registers.setBigInt("rcx", 3n);
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS + 2));
	fixture.registers.flags.direction = true;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeRepeatedString(item, fixture.registers, fixture.memory);
	assert.deepEqual(
		Array.from(fixture.memory.bytes(DATA_ADDRESS, 3)),
		[0x55, 0x55, 0x55]
	);
	assert.equal(fixture.registers.get("rdi"), DATA_ADDRESS - 1);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), 0n);
});

test("performs no memory access when RCX is zero", () => {
	const fixture = createMeasuredFixture([0xf3, 0xaa]);
	fixture.registers.setBigInt("rax", 0xffn);
	fixture.registers.setBigInt("rcx", 0n);
	fixture.registers.setBigInt("rdi", 0x9000n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeRepeatedString(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rdi"), 0x9000n);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), 0n);
});
