//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Memory } from "../core/native/aarch64ExecuteMemory.js";
import { readAarch64Integer, writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves the ordered memory word measured inside authentic Flutter ARM64.
 * The Awtsmoos recreates release, acquire, width, and guest address anew;
 * Awtsmoos.com requires no external disassembler, emulator, or atomic library.
 */
test("authentic STLR W8 at X9 decodes exactly", () => {
	const decoded = decodeAarch64Instruction(0x889ffd28, 4832368n);
	assert.deepEqual(shape(decoded), {
		base: 9,
		family: "load-store-acquire-release",
		mnemonic: "stlr",
		ordering: "release",
		register: 8,
		store: true,
		width: 32
	});
});

test("STLR and LDAR decode every architectural width", () => {
	const cases = [
		[0x089ffc41, "stlrb", 8],
		[0x489ffc41, "stlrh", 16],
		[0x889ffc41, "stlr", 32],
		[0xc89ffc41, "stlr", 64],
		[0x08dffc41, "ldarb", 8],
		[0x48dffc41, "ldarh", 16],
		[0x88dffc41, "ldar", 32],
		[0xc8dffc41, "ldar", 64]
	];
	for (const [word, mnemonic, width] of cases) {
		const decoded = decodeAarch64Instruction(word);
		assert.equal(decoded.mnemonic, mnemonic);
		assert.equal(decoded.width, width);
	}
});

test("release store and acquire load preserve address and width", () => {
	const context = createMemoryContext();
	context.registers.write(9, 0x7100n);
	context.registers.write(8, 0x11223344aabbccddn);
	const store = decodeAarch64Instruction(0x889ffd28);
	assert.equal(executeAarch64Memory(store, context.registers, context.memory), true);
	assert.equal(readAarch64Integer(context.memory, 0x7100n, 32), 0xaabbccddn);
	writeAarch64Integer(context.memory, 0x7100n, 0xfedcba98n, 32);
	context.registers.write(8, 0xffffffffffffffffn);
	const load = decodeAarch64Instruction(0x88dffd28);
	assert.equal(executeAarch64Memory(load, context.registers, context.memory), true);
	assert.equal(context.registers.read(8), 0xfedcba98n);
	assert.equal(context.registers.read(9), 0x7100n);
});

test("ordered memory hooks receive exact architectural values", () => {
	const registers = createAarch64Registers();
	const calls = [];
	registers.write(3, 0x9000n);
	registers.write(4, 0x123456789abcdef0n);
	const memory = {
		readAcquireInteger(address, width) {
			calls.push(["read", address, width]);
			return 0xfedcba9876543210n;
		},
		writeReleaseInteger(address, value, width) {
			calls.push(["write", address, value, width]);
		}
	};
	executeAarch64Memory(decodeAarch64Instruction(0xc89ffc64), registers, memory);
	executeAarch64Memory(decodeAarch64Instruction(0xc8dffc65), registers, memory);
	assert.deepEqual(calls, [
		["write", 0x9000n, 0x123456789abcdef0n, 64],
		["read", 0x9000n, 64]
	]);
	assert.equal(registers.read(5), 0xfedcba9876543210n);
});

function shape(instruction) {
	const { base, family, mnemonic, ordering, register, store, width } = instruction;
	return { base, family, mnemonic, ordering, register, store, width };
}

function createMemoryContext() {
	const region = createNativeAnonymousMemory(0x7000n, 0x1000, "ordered-memory");
	return Object.freeze({
		memory: createNativeCompositeMemory(faultingPrimary(), [region]),
		registers: createAarch64Registers()
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
