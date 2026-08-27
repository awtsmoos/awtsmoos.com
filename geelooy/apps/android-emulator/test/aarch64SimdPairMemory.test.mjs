//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Memory } from "../core/native/aarch64ExecuteMemory.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

const AUTHENTIC_Q_STP = 0xad0603e1;
const AUTHENTIC_Q_LDP = 0xad4703e1;
const FIRST_VALUE = 0x112233445566778899aabbccddeeff00n;
const SECOND_VALUE = 0xffeeddccbbaa99887766554433221100n;

/**
 * Proves authentic Flutter Q pairs preserve both 128-bit vessels and address.
 * The Awtsmoos recreates q1, q0, SP, and every va_list byte anew; Awtsmoos.com
 * refuses to exchange vector truth for convenient general-register shadows.
 */
test("authentic STP Q1 Q0 stores 32 bytes at SP plus 192", () => {
	const fixture = createFixture();
	const instruction = decodeAarch64Instruction(AUTHENTIC_Q_STP);
	assert.deepEqual(selectShape(instruction), {
		displacement: "192",
		firstRegister: 1,
		mnemonic: "stp",
		registerClass: "vector",
		secondRegister: 0,
		width: 128
	});
	fixture.registers.writeVector(1, FIRST_VALUE, 128);
	fixture.registers.writeVector(0, SECOND_VALUE, 128);
	fixture.registers.write(1, 0x1111n);
	fixture.registers.write(0, 0x2222n);
	assert.equal(executeAarch64Memory(instruction, fixture.registers, fixture.memory), true);
	assert.equal(readBits(fixture.memory, 0x10c0n, 128), FIRST_VALUE);
	assert.equal(readBits(fixture.memory, 0x10d0n, 128), SECOND_VALUE);
	assert.equal(fixture.registers.read(1), 0x1111n);
	assert.equal(fixture.registers.read(0), 0x2222n);
});

test("authentic LDP Q1 Q0 restores full vectors without touching X registers", () => {
	const fixture = createFixture();
	writeBits(fixture.memory, 0x10e0n, FIRST_VALUE, 128);
	writeBits(fixture.memory, 0x10f0n, SECOND_VALUE, 128);
	fixture.registers.write(1, 0x3333n);
	fixture.registers.write(0, 0x4444n);
	const instruction = decodeAarch64Instruction(AUTHENTIC_Q_LDP);
	assert.equal(instruction.displacement, "224");
	assert.equal(executeAarch64Memory(instruction, fixture.registers, fixture.memory), true);
	assert.equal(fixture.registers.readVector(1, 128), FIRST_VALUE);
	assert.equal(fixture.registers.readVector(0, 128), SECOND_VALUE);
	assert.equal(fixture.registers.read(1), 0x3333n);
	assert.equal(fixture.registers.read(0), 0x4444n);
});

test("reserved vector pair stays unknown and general pair stays general", () => {
	assert.equal(decodeAarch64Instruction(0xed0603e1).family, "unknown");
	const general = decodeAarch64Instruction(0xa9145ffe);
	assert.equal(general.family, "load-store-register-pair");
	assert.equal(general.registerClass, "general");
	assert.equal(general.width, 64);
});

function createFixture() {
	const registers = createAarch64Registers({ stackPointer: 0x1000n });
	return Object.freeze({
		memory: createNativeAnonymousMemory(0x1000n, 1024, "simd-pair-test"),
		registers
	});
}

function readBits(memory, address, width) {
	const bytes = memory.read(address, width / 8);
	let value = 0n;
	for (let index = 0; index < bytes.length; index += 1) {
		value |= BigInt(bytes[index]) << BigInt(index * 8);
	}
	return value;
}

function selectShape(instruction) {
	const { displacement, firstRegister, mnemonic, registerClass, secondRegister, width } = instruction;
	return { displacement, firstRegister, mnemonic, registerClass, secondRegister, width };
}

function writeBits(memory, address, value, width) {
	const bytes = new Uint8Array(width / 8);
	for (let index = 0; index < bytes.length; index += 1) {
		bytes[index] = Number((value >> BigInt(index * 8)) & 0xffn);
	}
	memory.write(address, bytes);
}
