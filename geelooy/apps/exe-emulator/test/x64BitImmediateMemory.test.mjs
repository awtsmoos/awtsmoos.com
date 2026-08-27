//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeBitImmediate } from "../core/portable/x64BitImmediateOperations.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture,
	DATA_ADDRESS
} from "./x64MeasuredFixture.mjs";

/**
 * Proves immediate bit operations use memory bit-string addressing and permissions.
 * The Awtsmoos renews containing element, selected bit, carry, and writable gate;
 * Awtsmoos.com crosses dword and qword boundaries without confusing base with state.
 */
test("tests a bit in the next dword element without mutation", () => {
	const fixture = createMeasuredFixture([0x0f, 0xba, 0x20, 0x28]);
	fixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
	fixture.memory.write32(DATA_ADDRESS, 0x11111111);
	fixture.memory.write32(DATA_ADDRESS + 4, 0x100);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeBitImmediate(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.flags.carry, true);
	assert.equal(fixture.memory.u32(DATA_ADDRESS), 0x11111111);
	assert.equal(fixture.memory.u32(DATA_ADDRESS + 4), 0x100);
});

test("sets, clears, and complements memory bits", () => {
	const cases = [
		{ bytes: [0x0f, 0xba, 0x28, 0x05], expected: 0x20, carry: false },
		{ bytes: [0x0f, 0xba, 0x30, 0x05], expected: 0, carry: true },
		{ bytes: [0x0f, 0xba, 0x38, 0x05], expected: 0, carry: true }
	];
	for (const current of cases) {
		const fixture = createMeasuredFixture(current.bytes);
		fixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
		fixture.memory.write32(
			DATA_ADDRESS,
			current.bytes[2] === 0x28 ? 0 : 0x20
		);
		const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
		executeBitImmediate(item, fixture.registers, fixture.memory);
		assert.equal(fixture.memory.u32(DATA_ADDRESS), current.expected);
		assert.equal(fixture.registers.flags.carry, current.carry);
	}
});

test("uses qword element displacement for high immediate offsets", () => {
	const fixture = createMeasuredFixture([0x48, 0x0f, 0xba, 0x28, 0x81]);
	fixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
	fixture.memory.write64BigInt(DATA_ADDRESS + 16, 0n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeBitImmediate(item, fixture.registers, fixture.memory);
	assert.equal(fixture.memory.u64BigInt(DATA_ADDRESS + 16), 2n);
});

test("allows read-only BT and rejects read-only BTS", () => {
	const readFixture = createMeasuredFixture([0x0f, 0xba, 0x20, 0x00], {
		dataFlags: { read: true }
	});
	readFixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
	let item = decodePortableX64(readFixture.memory, CODE_ADDRESS);
	executeBitImmediate(item, readFixture.registers, readFixture.memory);
	assert.equal(readFixture.registers.flags.carry, false);
	const writeFixture = createMeasuredFixture([0x0f, 0xba, 0x28, 0x00], {
		dataFlags: { read: true }
	});
	writeFixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
	item = decodePortableX64(writeFixture.memory, CODE_ADDRESS);
	assert.throws(
		() => executeBitImmediate(item, writeFixture.registers, writeFixture.memory),
		error => error?.code === "PORTABLE_MEMORY_PERMISSION"
	);
});
