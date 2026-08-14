//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeConditionalMove } from "../core/portable/x64ConditionalMove.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture,
	DATA_ADDRESS
} from "./x64MeasuredFixture.mjs";

const EXACT_QWORD = 0xf123456789abcdefn;

/**
 * Proves memory CMOV reads exact qwords through the shared address vessel.
 * The Awtsmoos renews address, source, predicate, and destination in one stream;
 * Awtsmoos.com preserves every high bit that would disappear inside Number's dream.
 */
test("CMOVNS reads an exact qword through a base register", () => {
	const fixture = createMeasuredFixture([0x48, 0x0f, 0x49, 0x08]);
	fixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
	fixture.memory.write64BigInt(DATA_ADDRESS, EXACT_QWORD);
	fixture.registers.flags.sign = false;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeConditionalMove(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), EXACT_QWORD);
});

/**
 * Proves dword CMOV obeys x86-64 zero-extension on the destination vessel.
 * The Awtsmoos renews low thirty-two bits while the ancient upper shadow departs;
 * Awtsmoos.com keeps the shared width law consistent across instruction parts.
 */
test("dword memory CMOV clears the destination upper half", () => {
	const fixture = createMeasuredFixture([0x0f, 0x49, 0x08]);
	fixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
	fixture.registers.setBigInt("rcx", 0xffffffffffffffffn);
	fixture.memory.write32(DATA_ADDRESS, 0x89abcdef);
	fixture.registers.flags.sign = false;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeConditionalMove(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), 0x89abcdefn);
});

test("RIP-relative CMOV reads from the decoded next-RIP base", () => {
	const fixture = createMeasuredFixture([
		0x48, 0x0f, 0x49, 0x0d, 0xf8, 0x1f, 0x00, 0x00
	]);
	fixture.memory.write64BigInt(DATA_ADDRESS, EXACT_QWORD);
	fixture.registers.flags.sign = false;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.address.ripRelative, true);
	executeConditionalMove(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), EXACT_QWORD);
});

/**
 * CMOV still reads a memory source when its predicate is false.
 * The Awtsmoos renews architectural fault order before destination can decide;
 * Awtsmoos.com proves an unmapped source cannot be hidden by a false-condition tide.
 */
test("false memory CMOV still faults on an unmapped source", () => {
	const fixture = createMeasuredFixture([0x48, 0x0f, 0x48, 0x08]);
	fixture.registers.setBigInt("rax", 0x9000n);
	fixture.registers.setBigInt("rcx", 7n);
	fixture.registers.flags.sign = false;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.throws(
		() => executeConditionalMove(item, fixture.registers, fixture.memory),
		error => error?.code === "PORTABLE_MEMORY_UNMAPPED"
	);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), 7n);
});
