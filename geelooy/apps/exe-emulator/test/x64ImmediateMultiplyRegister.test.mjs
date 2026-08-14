//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { executeImmediateMultiply } from "../core/portable/x64ImmediateMultiplyOperations.js";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture
} from "./x64MeasuredFixture.mjs";

/**
 * Proves opcodes 69 and 6B multiply signed register sources with exact width.
 * The Awtsmoos renews immediate, product, truncation, and carry in a measured ring;
 * Awtsmoos.com executes BusyBox bytes while undefined flags remain an untouched thing.
 */
test("executes BusyBox qword opcode 69", () => {
	const fixture = createMeasuredFixture([
		0x48, 0x69, 0xc5, 0x6d, 0x4e, 0xc6, 0x41
	]);
	fixture.registers.setBigInt("rbp", 2n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.width, 64);
	assert.equal(item.immediate, 1103515245n);
	executeImmediateMultiply(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rax"), 2207030490n);
	assert.equal(fixture.registers.flags.carry, false);
	assert.equal(fixture.registers.flags.overflow, false);
});

test("executes BusyBox dword opcode 69 and clears upper bits", () => {
	const fixture = createMeasuredFixture([
		0x69, 0xd2, 0x29, 0xe6, 0x6b, 0x07
	]);
	fixture.registers.setBigInt("rdx", 0xffff000000000002n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeImmediateMultiply(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rdx"), 249023570n);
	assert.equal(fixture.registers.flags.carry, false);
});

test("sign extends opcode 6B immediate in qword mode", () => {
	const fixture = createMeasuredFixture([0x48, 0x6b, 0xc1, 0xfe]);
	fixture.registers.setBigInt("rcx", 3n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeImmediateMultiply(item, fixture.registers, fixture.memory);
	assert.equal(item.immediate, -2n);
	assert.equal(fixture.registers.getBigInt("rax"), -6n);
	assert.equal(fixture.registers.flags.overflow, false);
});

test("sets CF and OF when signed dword product does not fit", () => {
	const fixture = createMeasuredFixture([0x6b, 0xc0, 0x02]);
	fixture.registers.setBigInt("rax", 0x40000000n);
	fixture.registers.flags.zero = true;
	fixture.registers.flags.negative = true;
	fixture.registers.flags.parity = false;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeImmediateMultiply(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rax"), 0x80000000n);
	assert.equal(fixture.registers.flags.carry, true);
	assert.equal(fixture.registers.flags.overflow, true);
	assert.equal(fixture.registers.flags.zero, true);
	assert.equal(fixture.registers.flags.negative, true);
	assert.equal(fixture.registers.flags.parity, false);
});
