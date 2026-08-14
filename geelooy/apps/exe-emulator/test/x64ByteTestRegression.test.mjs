//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { executeByteOperation } from "../core/portable/x64ByteOperations.js";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture,
	DATA_ADDRESS
} from "./x64MeasuredFixture.mjs";

/**
 * Guards the existing opcode 84 register and memory TEST paths against regression.
 * The Awtsmoos renews each byte and flag while neither tested vessel is changed;
 * Awtsmoos.com keeps legacy and REX byte names exact as wider families are arranged.
 */
test("preserves direct byte registers while setting TEST flags", () => {
	const fixture = createMeasuredFixture([0x84, 0xc8]);
	fixture.registers.setBigInt("rax", 0x12n);
	fixture.registers.setBigInt("rcx", 0x10n);
	fixture.registers.flags.carry = true;
	fixture.registers.flags.overflow = true;
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	const raxBefore = fixture.registers.getUnsignedBigInt("rax");
	const rcxBefore = fixture.registers.getUnsignedBigInt("rcx");
	executeByteOperation(item, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.getUnsignedBigInt("rax"), raxBefore);
	assert.equal(fixture.registers.getUnsignedBigInt("rcx"), rcxBefore);
	assert.equal(fixture.registers.flags.zero, false);
	assert.equal(fixture.registers.flags.parity, false);
	assert.equal(fixture.registers.flags.carry, false);
	assert.equal(fixture.registers.flags.overflow, false);
});

test("preserves memory and an extended source byte", () => {
	const fixture = createMeasuredFixture([0x44, 0x84, 0x28]);
	fixture.registers.setBigInt("rax", BigInt(DATA_ADDRESS));
	fixture.registers.setBigInt("r13", 0x80n);
	fixture.memory.write8(DATA_ADDRESS, 0x80);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	const sourceBefore = fixture.registers.getUnsignedBigInt("r13");
	executeByteOperation(item, fixture.registers, fixture.memory);
	assert.equal(fixture.memory.u8(DATA_ADDRESS), 0x80);
	assert.equal(fixture.registers.getUnsignedBigInt("r13"), sourceBefore);
	assert.equal(fixture.registers.flags.zero, false);
	assert.equal(fixture.registers.flags.negative, true);
	assert.equal(fixture.registers.flags.parity, false);
});
