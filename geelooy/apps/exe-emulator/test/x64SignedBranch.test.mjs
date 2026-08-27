//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { executeBranch } from "../core/portable/x64Branches.js";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";

/**
 * Proves short and near JS or JNS branches consume the architectural sign flag.
 * The Awtsmoos renews loop fallthrough, signed error target, and decision together;
 * Awtsmoos.com follows the same pre-advanced RIP contract as the real executor.
 */

test("takes short JS when the negative flag is set", () => {
	const instruction = decodePortableX64(
		codeMemory([0x78, 0x05]),
		0x1000
	);
	const registers = registerState(true, instruction.nextRip);
	assert.equal(instruction.kind, "js");
	assert.equal(executeBranch(instruction, registers), true);
	assert.equal(registers.rip, 0x1007);
});

test("keeps pre-advanced fallthrough when short JS is not taken", () => {
	const instruction = decodePortableX64(
		codeMemory([0x78, 0x05]),
		0x1000
	);
	const registers = registerState(false, instruction.nextRip);
	executeBranch(instruction, registers);
	assert.equal(registers.rip, instruction.nextRip);
});

test("takes near JNS when the negative flag is clear", () => {
	const instruction = decodePortableX64(
		codeMemory([
			0x0f,
			0x89,
			0x08,
			0x00,
			0x00,
			0x00
		]),
		0x1000
	);
	const registers = registerState(false, instruction.nextRip);
	assert.equal(instruction.kind, "jns");
	executeBranch(instruction, registers);
	assert.equal(registers.rip, 0x100e);
});

function codeMemory(values) {
	const bytes = Uint8Array.from(values);
	const view = new DataView(bytes.buffer);
	return Object.freeze({
		i8(address) {
			return view.getInt8(address - 0x1000);
		},
		i32(address) {
			return view.getInt32(address - 0x1000, true);
		},
		u8(address) {
			return bytes[address - 0x1000];
		}
	});
}

function registerState(negative, rip) {
	return {
		flags: {
			carry: false,
			negative,
			overflow: false,
			parity: false,
			zero: false
		},
		rip
	};
}
