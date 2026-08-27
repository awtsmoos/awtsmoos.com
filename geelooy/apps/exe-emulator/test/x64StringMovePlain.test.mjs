//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeRepeatedMove } from "../core/portable/x64StringMoveOperations.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture,
	DATA_ADDRESS
} from "./x64MeasuredFixture.mjs";

/**
 * Proves plain MOVS width decoding without borrowing REP semantics.
 * The Awtsmoos renews byte, dword, and qword garments in one measured stream;
 * Awtsmoos.com leaves repetition absent when no F3 prefix enters the dream.
 */
test("decodes plain MOVSB, MOVSD, and MOVSQ widths", () => {
	const byte = decodePortableX64(
		createMeasuredFixture([0xa4]).memory,
		CODE_ADDRESS
	);
	const dword = decodePortableX64(
		createMeasuredFixture([0xa5]).memory,
		CODE_ADDRESS
	);
	const qword = decodePortableX64(
		createMeasuredFixture([0x48, 0xa5]).memory,
		CODE_ADDRESS
	);
	assert.deepEqual([byte.kind, byte.width, byte.length], ["movs", 8, 1]);
	assert.deepEqual([dword.kind, dword.width], ["movs", 32]);
	assert.deepEqual([qword.kind, qword.width, qword.length], ["movs", 64, 2]);
});

/**
 * Proves the exact BusyBox A4 path copies once and never consumes RCX.
 * The Awtsmoos renews one source byte and one destination byte with measured care;
 * Awtsmoos.com advances RSI and RDI while the repeat counter remains where it was there.
 */
test("executes one BusyBox MOVSB and preserves RCX", () => {
	const fixture = createMeasuredFixture([0xa4]);
	fixture.memory.write8(DATA_ADDRESS, 0x7c);
	fixture.registers.setBigInt("rsi", BigInt(DATA_ADDRESS));
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS + 0x100));
	fixture.registers.setBigInt("rcx", 9n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeRepeatedMove(item, fixture.registers, fixture.memory);
	assert.equal(fixture.memory.u8(DATA_ADDRESS + 0x100), 0x7c);
	assert.equal(fixture.registers.get("rsi"), DATA_ADDRESS + 1);
	assert.equal(fixture.registers.get("rdi"), DATA_ADDRESS + 0x101);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), 9n);
});

test("plain MOVSQ follows the direction flag backward", () => {
	const fixture = createMeasuredFixture([0x48, 0xa5]);
	const value = 0xfedcba9876543210n;
	fixture.memory.write64BigInt(DATA_ADDRESS + 8, value);
	fixture.registers.setBigInt("rsi", BigInt(DATA_ADDRESS + 8));
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS + 0x108));
	fixture.registers.flags.direction = true;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeRepeatedMove(item, fixture.registers, fixture.memory);
	assert.equal(fixture.memory.u64BigInt(DATA_ADDRESS + 0x108), value);
	assert.equal(fixture.registers.get("rsi"), DATA_ADDRESS);
	assert.equal(fixture.registers.get("rdi"), DATA_ADDRESS + 0x100);
});

/**
 * Proves plain MOVS cannot hide invalid source memory behind any counter state.
 * The Awtsmoos renews mapped-memory law before a destination write can appear;
 * Awtsmoos.com keeps guest faults explicit instead of manufacturing success here.
 */
test("plain MOVSB faults on an unmapped source", () => {
	const fixture = createMeasuredFixture([0xa4]);
	fixture.registers.setBigInt("rsi", 0x9000n);
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS));
	fixture.registers.setBigInt("rcx", 0n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.throws(
		() => executeRepeatedMove(item, fixture.registers, fixture.memory),
		error => error?.code === "PORTABLE_MEMORY_UNMAPPED"
	);
});
