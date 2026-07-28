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
 * Proves successful exclusive mutation and ordered guest-memory hooks.
 * The Awtsmoos recreates reservation, value, and zero status anew;
 * Awtsmoos.com lets the exact measured covenant become bytes.
 */
test("matching exclusive load and store writes zero status", () => {
	const context = createMemoryContext();
	context.registers.write(9, 0x7100n);
	writeAarch64Integer(context.memory, 0x7100n, 0x11223344n, 32);
	execute(context, 0x885ffd28);
	assert.equal(context.registers.read(8), 0x11223344n);
	context.registers.write(8, 0xaabbccddn);
	execute(context, 0x8807fd28);
	assert.equal(context.registers.read(7), 0n);
	assert.equal(
		readAarch64Integer(context.memory, 0x7100n, 32),
		0xaabbccddn
	);
});

test("ordered exclusive variants use acquire and release hooks", () => {
	const registers = createAarch64Registers();
	const calls = [];
	registers.write(9, 0x9000n);
	const memory = orderedMemory(calls);
	executeAarch64Memory(
		decodeAarch64Instruction(0x885ffd28),
		registers,
		memory
	);
	registers.write(8, 0x5678n);
	executeAarch64Memory(
		decodeAarch64Instruction(0x8807fd28),
		registers,
		memory
	);
	assert.deepEqual(calls, [
		["read", 0x9000n, 32],
		["write", 0x9000n, 0x5678n, 32]
	]);
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
		0x1000,
		"exclusive-success"
	);
	return {
		memory: createNativeCompositeMemory(faultingPrimary(), [region]),
		registers: createAarch64Registers()
	};
}

function orderedMemory(calls) {
	return {
		readAcquireInteger(address, width) {
			calls.push(["read", address, width]);
			return 0x1234n;
		},
		writeReleaseInteger(address, value, width) {
			calls.push(["write", address, value, width]);
		}
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
