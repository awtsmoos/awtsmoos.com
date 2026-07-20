//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Memory } from "../core/native/aarch64ExecuteMemory.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { registerOffsetShape } from "./aarch64RegisterOffsetFixture.mjs";

/**
 * Proves both authentic register-indexed memory words in isolated guest bytes.
 * The Awtsmoos recreates base, X index, scale, stored jmethodID, and loaded word
 * anew; Awtsmoos.com needs no APK, DEX, JNI, ELF, or browser for this proof.
 */
test("authentic STR X9, [X0, X8] stores at unscaled X offset", () => {
	const instruction = decodeAarch64Instruction(0xf8286809, 4905768n);
	assert.deepEqual(registerOffsetShape(instruction), {
		base: 0,
		family: "load-store-register-offset",
		mnemonic: "str",
		offsetRegister: 8,
		option: 3,
		optionName: "lsl-uxtx",
		register: 9,
		resultWidth: 64,
		scale: false,
		signedLoad: false,
		store: true,
		supported: true,
		width: 64
	});
	const context = createMemoryContext();
	context.registers.write(0, 0x5000n);
	context.registers.write(8, 0x40n);
	context.registers.write(9, 0x6fffc0000020n);
	assert.equal(executeAarch64Memory(instruction, context.registers, context.memory), true);
	assert.equal(context.memory.readU64(0x5040n), 0x6fffc0000020n);
	assert.equal(context.registers.read(0), 0x5000n);
});

test("authentic LDR W20, [X9, X8, LSL #2] scales index", () => {
	const instruction = decodeAarch64Instruction(0xb8687934, 4905872n);
	assert.equal(instruction.mnemonic, "ldr");
	assert.equal(instruction.scale, true);
	assert.equal(instruction.width, 32);
	const context = createMemoryContext();
	context.registers.write(9, 0x5000n);
	context.registers.write(8, 3n);
	context.memory.writeU32(0x500cn, 0xaabbccddn);
	executeAarch64Memory(instruction, context.registers, context.memory);
	assert.equal(context.registers.read(20), 0xaabbccddn);
});

function createMemoryContext() {
	const region = createNativeAnonymousMemory(0x4000n, 0x3000, "indexed-memory");
	return Object.freeze({
		memory: createNativeCompositeMemory(faultingPrimary(), [region]),
		registers: createAarch64Registers()
	});
}

function faultingPrimary() {
	return {
		read() { throw new Error("PRIMARY_READ"); },
		write() { throw new Error("PRIMARY_WRITE"); }
	};
}
