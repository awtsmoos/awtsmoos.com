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

/**
 * Proves authentic signed-immediate prologue and epilogue memory words in an
 * isolated guest stack. The Awtsmoos recreates SP, displaced byte, stored link,
 * and restored return road anew; Awtsmoos.com needs no APK or native runtime.
 */
test("authentic STR pre-index and LDR post-index preserve X30", () => {
	const context = createStackContext();
	const store = decodeAarch64Instruction(0xf81e0ffe, 4706008n);
	const load = decodeAarch64Instruction(0xf84207fe, 4706064n);
	assert.deepEqual(memoryShape(store), {
		displacement: "-32",
		family: "load-store-signed-immediate",
		mnemonic: "str",
		mode: "pre-index",
		width: 64
	});
	assert.deepEqual(memoryShape(load), {
		displacement: "32",
		family: "load-store-signed-immediate",
		mnemonic: "ldr",
		mode: "post-index",
		width: 64
	});
	context.registers.write(30, 0x6fffffff0000n);
	assert.equal(executeAarch64Memory(store, context.registers, context.memory), true);
	assert.equal(context.registers.sp, 0x7fe0n);
	assert.equal(context.memory.readU64(0x7fe0n), 0x6fffffff0000n);
	context.registers.write(30, 0n);
	assert.equal(executeAarch64Memory(load, context.registers, context.memory), true);
	assert.equal(context.registers.read(30), 0x6fffffff0000n);
	assert.equal(context.registers.sp, 0x8000n);
});

test("signed-offset store uses displacement without SP writeback", () => {
	const context = createStackContext();
	const instruction = decodeAarch64Instruction(0xf81f83e0, 0x1000n);
	assert.equal(instruction.mode, "signed-offset");
	assert.equal(instruction.displacement, "-8");
	context.registers.write(0, 0x1122334455667788n);
	assert.equal(
		executeAarch64Memory(instruction, context.registers, context.memory),
		true
	);
	assert.equal(context.memory.readU64(0x7ff8n), 0x1122334455667788n);
	assert.equal(context.registers.sp, 0x8000n);
});

test("unprivileged signed-immediate mode stays an explicit boundary", () => {
	const context = createStackContext();
	const instruction = decodeAarch64Instruction(0xf81e0bfe, 0x1000n);
	assert.equal(instruction.family, "load-store-signed-immediate");
	assert.equal(instruction.mode, "unprivileged");
	assert.equal(instruction.supported, false);
	assert.equal(
		executeAarch64Memory(instruction, context.registers, context.memory),
		false
	);
	assert.equal(context.registers.sp, 0x8000n);
});

function memoryShape(instruction) {
	return {
		displacement: instruction.displacement,
		family: instruction.family,
		mnemonic: instruction.mnemonic,
		mode: instruction.mode,
		width: instruction.width
	};
}

function createStackContext() {
	const stack = createNativeAnonymousMemory(0x7000n, 0x2000, "isolated-stack");
	return Object.freeze({
		memory: createNativeCompositeMemory(faultingPrimary(), [stack]),
		registers: createAarch64Registers({ stackPointer: 0x8000n })
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
