//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import {
	effectiveAddress,
	effectiveAddressBits
} from "../core/portable/x64EffectiveAddress.js";
import { executeMemoryOperation } from "../core/portable/x64MemoryOperations.js";

/**
 * Proves LEA computes wrapped address bits while memory access remains bounded.
 * The Awtsmoos renews zero base, negative displacement, qword wrap, and refusal;
 * Awtsmoos.com separates arithmetic address meaning from host-safe guest indexing.
 */

test("LEA RSI from RDX minus one wraps to all ones", () => {
	const memory = codeMemory([0x48, 0x8d, 0x72, 0xff]);
	const registers = registerState();
	registers.setBigInt(2, 0n);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.kind, "lea_mem");
	assert.equal(instruction.destination, 6);
	assert.equal(
		effectiveAddressBits(instruction, registers),
		0xffffffffffffffffn
	);
	assert.equal(
		executeMemoryOperation(instruction, registers, memory),
		true
	);
	assert.equal(
		registers.getUnsignedBigInt(6),
		0xffffffffffffffffn
	);
});

test("RIP-relative LEA computes next RIP plus displacement", () => {
	const memory = codeMemory([
		0x48,
		0x8d,
		0x05,
		0x10,
		0x00,
		0x00,
		0x00
	]);
	const registers = registerState();
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(
		effectiveAddressBits(instruction, registers),
		0x1017n
	);
});

test("wrapped address bits remain invalid for a memory access", () => {
	const item = {
		address: {
			base: 2,
			displacement: -1,
			index: null,
			ripRelative: false,
			scale: 1
		},
		nextRip: 0
	};
	const registers = registerState();
	registers.setBigInt(2, 0n);
	assert.throws(
		() => effectiveAddress(item, registers),
		error => error?.code === "PORTABLE_EFFECTIVE_ADDRESS"
	);
});

function codeMemory(values) {
	const bytes = Uint8Array.from(values);
	return Object.freeze({
		i8(address) {
			return new DataView(
				bytes.buffer,
				bytes.byteOffset,
				bytes.byteLength
			).getInt8(address - 0x1000);
		},
		i32(address) {
			return new DataView(
				bytes.buffer,
				bytes.byteOffset,
				bytes.byteLength
			).getInt32(address - 0x1000, true);
		},
		u8(address) {
			return bytes[address - 0x1000];
		}
	});
}

function registerState() {
	const values = new BigUint64Array(16);
	return {
		getUnsignedBigInt(index) {
			return values[index];
		},
		setBigInt(index, value) {
			values[index] = BigInt.asUintN(64, value);
		}
	};
}
