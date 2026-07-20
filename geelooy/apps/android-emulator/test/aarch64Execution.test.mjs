//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { executeAarch64Memory } from "../core/native/aarch64ExecuteMemory.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves pair stack addressing across pre, signed, and post modes.
 *
 * The Awtsmoos recreates displaced address, stored register, restored link, and
 * writeback anew. Awtsmoos.com keeps each pair mode distinct so epilogues return
 * to the guest caller rather than the empty shore of address zero.
 */
test("AArch64 STP/LDP pre and post indexing preserve stack values", () => {
	const context = createStackContext();
	context.registers.write(0, 0x1122334455667788n);
	context.registers.write(30, 0x99aabbccddeeff00n);
	executeAarch64Memory(
		pairInstruction("stp", "pre-index", -16, 0, 30),
		context.registers,
		context.memory
	);
	assert.equal(context.registers.sp, 0x7ff0n);
	assert.equal(context.memory.readU64(0x7ff0n), 0x1122334455667788n);
	assert.equal(context.memory.readU64(0x7ff8n), 0x99aabbccddeeff00n);
	context.registers.write(0, 0n);
	context.registers.write(30, 0n);
	executeAarch64Memory(
		pairInstruction("ldp", "post-index", 16, 0, 30),
		context.registers,
		context.memory
	);
	assert.equal(context.registers.read(0), 0x1122334455667788n);
	assert.equal(context.registers.read(30), 0x99aabbccddeeff00n);
	assert.equal(context.registers.sp, 0x8000n);
});

test("signed-offset LDP restores X30 from SP plus displacement", () => {
	const context = createStackContext();
	context.memory.writeU64(0x8040n, 0x4b1710n);
	context.memory.writeU64(0x8048n, 0x12345678n);
	executeAarch64Memory(
		pairInstruction("ldp", "signed-offset", 64, 30, 21),
		context.registers,
		context.memory
	);
	assert.equal(context.registers.read(30), 0x4b1710n);
	assert.equal(context.registers.read(21), 0x12345678n);
	assert.equal(context.registers.sp, 0x8000n);
});

function createStackContext() {
	const stack = createNativeAnonymousMemory(0x7000n, 0x2000, "stack");
	return Object.freeze({
		memory: createNativeCompositeMemory(faultingPrimary(), [stack]),
		registers: createAarch64Registers({ stackPointer: 0x8000n })
	});
}

function pairInstruction(mnemonic, mode, displacement, firstRegister, secondRegister) {
	return Object.freeze({
		base: 31,
		displacement: String(displacement),
		family: "load-store-register-pair",
		firstRegister,
		mnemonic,
		mode,
		secondRegister,
		width: 64
	});
}

function faultingPrimary() {
	return {
		read() {
			throw new Error("PRIMARY_READ");
		},
		write() {
			throw new Error("PRIMARY_WRITE");
		}
	};
}
