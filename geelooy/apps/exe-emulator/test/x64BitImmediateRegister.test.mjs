//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeBitImmediate } from "../core/portable/x64BitImmediateOperations.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture
} from "./x64MeasuredFixture.mjs";

/**
 * Proves 0F BA register BT, BTS, BTR, and BTC semantics with exact width.
 * The Awtsmoos renews selected bit and carry while undefined flags remain still;
 * Awtsmoos.com changes only named destinations according to architectural will.
 */
test("executes BusyBox BTL immediate without mutation", () => {
	const fixture = createMeasuredFixture([0x0f, 0xba, 0xe0, 0x08]);
	fixture.registers.setBigInt("rax", 0x100n);
	fixture.registers.flags.zero = true;
	const before = fixture.registers.getUnsignedBigInt("rax");
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.operation, "bt");
	executeBitImmediate(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rax"), before);
	assert.equal(fixture.registers.flags.carry, true);
	assert.equal(fixture.registers.flags.zero, true);
});

test("masks a qword register bit index", () => {
	const fixture = createMeasuredFixture([0x48, 0x0f, 0xba, 0xe1, 0x41]);
	fixture.registers.setBigInt("rcx", 0x2n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeBitImmediate(item, fixture.registers, fixture.memory);
	assert.equal(item.width, 64);
	assert.equal(fixture.registers.flags.carry, true);
});

test("sets and clears dword bits while clearing the upper half", () => {
	const setFixture = createMeasuredFixture([0x0f, 0xba, 0xe8, 0x03]);
	setFixture.registers.setBigInt("rax", 0xffff000000000000n);
	let item = decodePortableX64(setFixture.memory, CODE_ADDRESS);
	executeBitImmediate(item, setFixture.registers, setFixture.memory);
	assert.equal(setFixture.registers.getUnsignedBigInt("rax"), 8n);
	assert.equal(setFixture.registers.flags.carry, false);
	const clearFixture = createMeasuredFixture([0x0f, 0xba, 0xf0, 0x03]);
	clearFixture.registers.setBigInt("rax", 0xffff000000000008n);
	item = decodePortableX64(clearFixture.memory, CODE_ADDRESS);
	executeBitImmediate(item, clearFixture.registers, clearFixture.memory);
	assert.equal(clearFixture.registers.getUnsignedBigInt("rax"), 0n);
	assert.equal(clearFixture.registers.flags.carry, true);
});

test("complements an extended qword register bit", () => {
	const fixture = createMeasuredFixture([0x49, 0x0f, 0xba, 0xf8, 0x3f]);
	fixture.registers.setBigInt("r8", 0n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.target, 8);
	executeBitImmediate(item, fixture.registers, fixture.memory);
	assert.equal(
		fixture.registers.getUnsignedBigInt("r8"),
		0x8000000000000000n
	);
	assert.equal(fixture.registers.flags.carry, false);
});
