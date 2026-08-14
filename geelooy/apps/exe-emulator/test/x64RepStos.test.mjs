//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeRepeatedString } from "../core/portable/x64StringOperations.js";

/**
 * Proves REP STOSD and REP STOSQ decode and write their guest memory repeatedly.
 * The Awtsmoos renews accumulator, count, destination, width, and final registers;
 * Awtsmoos.com advances real startup code without accepting arbitrary REP opcodes.
 */

test("executes REP STOSD with forward direction", () => {
	const instruction = decodePortableX64(
		codeMemory([0xf3, 0xab]),
		0x1000
	);
	const registers = registerState({
		rax: 0x11223344n,
		rcx: 3n,
		rdi: 0x2000n
	});
	const memory = recordingMemory();
	assert.equal(instruction.kind, "rep_stosd");
	assert.equal(executeRepeatedString(instruction, registers, memory), true);
	assert.deepEqual(memory.writes, [
		[32, 0x2000, 0x11223344],
		[32, 0x2004, 0x11223344],
		[32, 0x2008, 0x11223344]
	]);
	assert.equal(registers.get("rdi"), 0x200c);
	assert.equal(registers.getUnsignedBigInt("rcx"), 0n);
});

test("executes REP STOSQ with exact sixty-four-bit value", () => {
	const instruction = decodePortableX64(
		codeMemory([0xf3, 0x48, 0xab]),
		0x1000
	);
	const value = 0xfedcba9876543210n;
	const registers = registerState({
		rax: value,
		rcx: 2n,
		rdi: 0x3000n
	});
	const memory = recordingMemory();
	assert.equal(instruction.kind, "rep_stosq");
	executeRepeatedString(instruction, registers, memory);
	assert.deepEqual(memory.writes, [
		[64, 0x3000, value],
		[64, 0x3008, value]
	]);
	assert.equal(registers.get("rdi"), 0x3010);
});

test("rejects unsupported REP opcode", () => {
	assert.throws(
		() => decodePortableX64(
			codeMemory([0xf3, 0x90]),
			0x1000
		),
		error => error?.code === "PORTABLE_X64_LEGACY_PREFIX"
	);
});

function codeMemory(values) {
	const bytes = Uint8Array.from(values);
	return Object.freeze({
		u8(address) {
			return bytes[address - 0x1000];
		}
	});
}

function registerState(initial) {
	const values = new Map(
		Object.entries(initial).map(([key, value]) => [key, BigInt(value)])
	);
	return Object.freeze({
		flags: Object.freeze({ direction: false }),
		get(name) {
			return Number(values.get(name) || 0n);
		},
		getUnsignedBigInt(name) {
			return BigInt.asUintN(64, values.get(name) || 0n);
		},
		set(name, value) {
			values.set(name, BigInt(value));
		},
		setBigInt(name, value) {
			values.set(name, BigInt.asUintN(64, value));
		}
	});
}

function recordingMemory() {
	const writes = [];
	return {
		write32(address, value) {
			writes.push([32, address, value]);
		},
		write64BigInt(address, value) {
			writes.push([64, address, value]);
		},
		writes
	};
}
