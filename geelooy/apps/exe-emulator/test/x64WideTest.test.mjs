//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeWideTest } from "../core/portable/x64TestOperations.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture,
	DATA_ADDRESS
} from "./x64MeasuredFixture.mjs";

/**
 * Proves wide TEST reads exact register and memory bits without destination mutation.
 * The Awtsmoos renews zero, sign, parity, and cleared carry in branch-ready light;
 * Awtsmoos.com preserves both operands while BusyBox receives the flags it writes.
 */
test("tests exact qword extended registers", () => {
	const fixture = createMeasuredFixture([0x4d, 0x85, 0xe8]);
	const value = 0x8000000000000000n;
	fixture.registers.setBigInt("r8", value);
	fixture.registers.setBigInt("r13", value);
	fixture.registers.flags.carry = true;
	fixture.registers.flags.overflow = true;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.width, 64);
	executeWideTest(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("r8"), value);
	assert.equal(fixture.registers.getUnsignedBigInt("r13"), value);
	assert.equal(fixture.registers.flags.negative, true);
	assert.equal(fixture.registers.flags.parity, true);
	assert.equal(fixture.registers.flags.carry, false);
	assert.equal(fixture.registers.flags.overflow, false);
});

test("executes BusyBox dword TEST against memory", () => {
	const fixture = createMeasuredFixture([0x44, 0x85, 0x68, 0x04]);
	fixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
	fixture.registers.setBigInt("r13", 0xffffffffffffffffn);
	fixture.memory.write32(DATA_ADDRESS + 4, 0x80000001);
	const sourceBefore = fixture.registers.getUnsignedBigInt("r13");
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.targetKind, "memory");
	executeWideTest(item, fixture.registers, fixture.memory);
	assert.equal(fixture.memory.u32(DATA_ADDRESS + 4), 0x80000001);
	assert.equal(fixture.registers.getUnsignedBigInt("r13"), sourceBefore);
	assert.equal(fixture.registers.flags.zero, false);
	assert.equal(fixture.registers.flags.negative, true);
	assert.equal(fixture.registers.flags.parity, false);
	assert.equal(fixture.registers.flags.carry, false);
	assert.equal(fixture.registers.flags.overflow, false);
});

test("sets zero and even parity for a zero dword result", () => {
	const fixture = createMeasuredFixture([0x85, 0xc9]);
	fixture.registers.setBigInt("rcx", 0xabc00000000n);
	const before = fixture.registers.getUnsignedBigInt("rcx");
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeWideTest(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), before);
	assert.equal(fixture.registers.flags.zero, true);
	assert.equal(fixture.registers.flags.negative, false);
	assert.equal(fixture.registers.flags.parity, true);
});
