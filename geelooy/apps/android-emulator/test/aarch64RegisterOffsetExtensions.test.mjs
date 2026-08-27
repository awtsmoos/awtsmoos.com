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
import { encodeRegisterOffsetMemory } from "./aarch64RegisterOffsetFixture.mjs";

/**
 * Proves UXTW, LSL/UXTX, SXTW, SXTX, scaling, and explicit unsupported options.
 * The Awtsmoos recreates every indexed address road anew; Awtsmoos.com keeps
 * extension truth isolated from APK, DEX, JNI, ELF, Flutter, and host memory.
 */
test("supported extension options form exact positive and negative addresses", () => {
	const cases = [
		{ option: 2, raw: 0x20n, expected: 0x5020n },
		{ option: 3, raw: 0x30n, expected: 0x5030n },
		{ option: 6, raw: 0xfffffff0n, expected: 0x4ff0n },
		{ option: 7, raw: 0xffffffffffffffe0n, expected: 0x4fe0n }
	];
	for (const entry of cases) {
		const context = createMemoryContext();
		const instruction = decodeAarch64Instruction(encodeRegisterOffsetMemory({
			base: 0,
			offsetRegister: 2,
			operation: 0,
			option: entry.option,
			register: 1,
			scale: false,
			sizeCode: 3
		}));
		context.registers.write(0, 0x5000n);
		context.registers.write(1, 0x1122334455667788n);
		context.registers.write(2, entry.raw);
		assert.equal(executeAarch64Memory(instruction, context.registers, context.memory), true);
		assert.equal(context.memory.readU64(entry.expected), 0x1122334455667788n);
	}
});

test("scaled UXTW and signed byte loads preserve result width", () => {
	const context = createMemoryContext();
	const scaled = decodeAarch64Instruction(encodeRegisterOffsetMemory({
		base: 0,
		offsetRegister: 2,
		operation: 1,
		option: 2,
		register: 3,
		scale: true,
		sizeCode: 2
	}));
	context.registers.write(0, 0x5000n);
	context.registers.write(2, 2n, 32);
	context.memory.writeU32(0x5008n, 0xdeadbeefn);
	executeAarch64Memory(scaled, context.registers, context.memory);
	assert.equal(context.registers.read(3), 0xdeadbeefn);
	const signedByte = decodeAarch64Instruction(encodeRegisterOffsetMemory({
		base: 0,
		offsetRegister: 31,
		operation: 2,
		option: 3,
		register: 4,
		scale: false,
		sizeCode: 0
	}));
	context.memory.write(0x5000n, new Uint8Array([0x80]));
	executeAarch64Memory(signedByte, context.registers, context.memory);
	assert.equal(context.registers.read(4), 0xffffffffffffff80n);
});

test("unsupported extension option decodes but does not execute", () => {
	const instruction = decodeAarch64Instruction(encodeRegisterOffsetMemory({
		base: 0,
		offsetRegister: 2,
		operation: 0,
		option: 0,
		register: 1,
		scale: false,
		sizeCode: 3
	}));
	assert.equal(instruction.family, "load-store-register-offset");
	assert.equal(instruction.supported, false);
	const context = createMemoryContext();
	assert.equal(executeAarch64Memory(instruction, context.registers, context.memory), false);
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
