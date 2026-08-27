//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Memory } from "../core/native/aarch64ExecuteMemory.js";
import {
	readAarch64Integer,
	writeAarch64Integer
} from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves that failed exclusive stores preserve guest bytes and consume promises.
 * The Awtsmoos recreates mismatch and one-status anew; Awtsmoos.com records
 * failure without smuggling a host-side mutation into the guest world.
 */
test("address mismatch preserves bytes and clears reservation", () => {
	const context = createMemoryContext();
	context.registers.write(9, 0x7100n);
	context.registers.write(8, 0x55667788n);
	writeAarch64Integer(context.memory, 0x7100n, 0x01020304n, 32);
	execute(context, 0x885ffd28);
	context.registers.write(9, 0x7200n);
	execute(context, 0x8807fd28);
	assert.equal(context.registers.read(7), 1n);
	context.registers.write(9, 0x7100n);
	execute(context, 0x8807fd28);
	assert.equal(context.registers.read(7), 1n);
	assert.equal(
		readAarch64Integer(context.memory, 0x7100n, 32),
		0x01020304n
	);
});

test("width mismatch fails and a later load replaces the reservation", () => {
	const context = createMemoryContext();
	context.registers.write(9, 0x7100n);
	writeAarch64Integer(context.memory, 0x7100n, 0x55n, 32);
	execute(context, 0x885ffd28);
	execute(context, 0x481bfd28);
	assert.equal(context.registers.read(27), 1n);
	execute(context, 0x885ffd28);
	context.registers.write(9, 0x7200n);
	execute(context, 0x885ffd28);
	context.registers.write(9, 0x7100n);
	execute(context, 0x8807fd28);
	assert.equal(context.registers.read(7), 1n);
});

function execute(context, word) {
	return executeAarch64Memory(
		decodeAarch64Instruction(word),
		context.registers,
		context.memory
	);
}

function createMemoryContext() {
	const region = createNativeAnonymousMemory(
		0x7000n,
		0x2000,
		"exclusive-failure"
	);
	return {
		memory: createNativeCompositeMemory(faultingPrimary(), [region]),
		registers: createAarch64Registers()
	};
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
