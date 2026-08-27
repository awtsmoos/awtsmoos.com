//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeMovsxd } from "../core/portable/x64SignExtension.js";

/**
 * Proves exact MOVSXD decoding and signed 32-to-64-bit execution for register and
 * memory sources. The Awtsmoos renews low bits, negative meaning, destination, and
 * next RIP; Awtsmoos.com keeps a real compiler instruction beyond semantic fallback.
 */

test("sign-extends a negative register source", () => {
	const memory = createMemory(
		0x1000,
		Uint8Array.from([0x48, 0x63, 0xc6])
	);
	const registers = createRegisters();
	registers.setUnsigned(6, 0xffffffffn);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.kind, "movsxd_reg");
	assert.equal(instruction.destination, 0);
	assert.equal(instruction.source, 6);
	assert.equal(instruction.nextRip, 0x1003);
	assert.equal(
		executeMovsxd(instruction, registers, memory),
		true
	);
	assert.equal(registers.getBigInt(0), -1n);
});

test("sign-extends a positive register source", () => {
	const memory = createMemory(
		0x1100,
		Uint8Array.from([0x48, 0x63, 0xc6])
	);
	const registers = createRegisters();
	registers.setUnsigned(6, 0x7fffffffn);
	const instruction = decodePortableX64(memory, 0x1100);
	executeMovsxd(instruction, registers, memory);
	assert.equal(registers.getBigInt(0), 0x7fffffffn);
});

test("sign-extends a RIP-relative memory source", () => {
	const base = 0x1200;
	const bytes = new Uint8Array(15);
	bytes.set([0x48, 0x63, 0x05, 0x04, 0, 0, 0], 0);
	new DataView(bytes.buffer).setInt32(11, -123456, true);
	const memory = createMemory(base, bytes);
	const registers = createRegisters();
	const instruction = decodePortableX64(memory, base);
	assert.equal(instruction.kind, "movsxd_reg_mem");
	assert.equal(instruction.nextRip, base + 7);
	executeMovsxd(instruction, registers, memory);
	assert.equal(registers.getBigInt(0), -123456n);
});

test("rejects opcode 63 without REX.W", () => {
	const memory = createMemory(
		0x1300,
		Uint8Array.from([0x63, 0xc6])
	);
	assert.throws(
		() => decodePortableX64(memory, 0x1300),
		error => error?.code === "PORTABLE_X64_MOVSXD_REX_W_REQUIRED"
	);
});

function createMemory(base, bytes) {
	const view = new DataView(
		bytes.buffer,
		bytes.byteOffset,
		bytes.byteLength
	);
	const offset = address => {
		const value = address - base;
		if (!Number.isInteger(value)
			|| value < 0
			|| value >= bytes.length) {
			throw new Error(`TEST_MEMORY_RANGE:${address}`);
		}
		return value;
	};
	return Object.freeze({
		i8(address) {
			return view.getInt8(offset(address));
		},
		i32(address) {
			return view.getInt32(offset(address), true);
		},
		u8(address) {
			return view.getUint8(offset(address));
		}
	});
}

function createRegisters() {
	const values = new BigUint64Array(16);
	return Object.freeze({
		get() {
			throw new Error("TEST_REGISTER_NUMBER_NOT_EXPECTED");
		},
		getBigInt(index) {
			return BigInt.asIntN(64, values[index]);
		},
		getUnsignedBigInt(index) {
			return values[index];
		},
		setBigInt(index, value) {
			values[index] = BigInt.asUintN(64, value);
		},
		setUnsigned(index, value) {
			values[index] = BigInt.asUintN(64, value);
		}
	});
}
