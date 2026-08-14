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
 * Proves repeated MOVS copies exact byte, dword, and qword guest values.
 * The Awtsmoos renews source, destination, direction, count, and copied light;
 * Awtsmoos.com preserves every measured bit while RSI and RDI move right.
 */
test("copies bytes forward and preserves flags", () => {
	const fixture = createMeasuredFixture([0xf3, 0xa4]);
	fixture.memory.write8(DATA_ADDRESS, 0x11);
	fixture.memory.write8(DATA_ADDRESS + 1, 0x22);
	fixture.registers.setBigInt("rsi", BigInt(DATA_ADDRESS));
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS + 0x100));
	fixture.registers.setBigInt("rcx", 2n);
	fixture.registers.flags.carry = true;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeRepeatedMove(item, fixture.registers, fixture.memory);
	assert.deepEqual(
		Array.from(fixture.memory.bytes(DATA_ADDRESS + 0x100, 2)),
		[0x11, 0x22]
	);
	assert.equal(fixture.registers.get("rsi"), DATA_ADDRESS + 2);
	assert.equal(fixture.registers.get("rdi"), DATA_ADDRESS + 0x102);
	assert.equal(fixture.registers.flags.carry, true);
});

test("copies dwords backward under DF", () => {
	const fixture = createMeasuredFixture([0xf3, 0xa5]);
	fixture.memory.write32(DATA_ADDRESS, 0x11223344);
	fixture.memory.write32(DATA_ADDRESS + 4, 0x55667788);
	fixture.registers.setBigInt("rsi", BigInt(DATA_ADDRESS + 4));
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS + 0x104));
	fixture.registers.setBigInt("rcx", 2n);
	fixture.registers.flags.direction = true;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.width, 32);
	executeRepeatedMove(item, fixture.registers, fixture.memory);
	assert.equal(fixture.memory.u32(DATA_ADDRESS + 0x100), 0x11223344);
	assert.equal(fixture.memory.u32(DATA_ADDRESS + 0x104), 0x55667788);
	assert.equal(fixture.registers.get("rsi"), DATA_ADDRESS - 4);
	assert.equal(fixture.registers.get("rdi"), DATA_ADDRESS + 0xfc);
});

test("executes BusyBox REP MOVSQ bytes exactly", () => {
	const fixture = createMeasuredFixture([0xf3, 0x48, 0xa5]);
	const value = 0xfedcba9876543210n;
	fixture.memory.write64BigInt(DATA_ADDRESS, value);
	fixture.registers.setBigInt("rsi", BigInt(DATA_ADDRESS));
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS + 0x100));
	fixture.registers.setBigInt("rcx", 1n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.width, 64);
	executeRepeatedMove(item, fixture.registers, fixture.memory);
	assert.equal(fixture.memory.u64BigInt(DATA_ADDRESS + 0x100), value);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), 0n);
});

test("performs no memory access when repeat count is zero", () => {
	const fixture = createMeasuredFixture([0xf3, 0x48, 0xa5]);
	fixture.registers.setBigInt("rsi", 0x9000n);
	fixture.registers.setBigInt("rdi", 0xa000n);
	fixture.registers.setBigInt("rcx", 0n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeRepeatedMove(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rsi"), 0x9000n);
	assert.equal(fixture.registers.getUnsignedBigInt("rdi"), 0xa000n);
});
