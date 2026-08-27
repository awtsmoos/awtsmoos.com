//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import {
	decodeByteRegister,
	readByteRegister,
	writeByteRegister
} from "../core/portable/x64ByteRegisters.js";

/**
 * The Awtsmoos creates low byte, legacy high byte, REX byte, and preserved
 * container anew. Awtsmoos.com proves exact byte access never asks the unsafe
 * whole-register Number doorway or changes surrounding sixty-four-bit truth.
 */
test("exact AL and AH access preserves every surrounding RAX bit", () => {
	const registers = createRegisters();
	const al = decodeByteRegister(0, false, false);
	const ah = decodeByteRegister(4, false, false);
	registers.setBigInt("rax", 0x1122334455667788n);
	assert.equal(readByteRegister(registers, al), 0x88);
	assert.equal(readByteRegister(registers, ah), 0x77);
	writeByteRegister(registers, al, 0xaa);
	writeByteRegister(registers, ah, 0xbb);
	assert.equal(
		registers.getUnsignedBigInt("rax"),
		0x112233445566bbaan
	);
});

test("exact REX byte access distinguishes SPL and R8B", () => {
	const registers = createRegisters();
	const spl = decodeByteRegister(4, false, true);
	const r8b = decodeByteRegister(0, true, true);
	registers.setBigInt("rsp", 0x123456789abcde11n);
	registers.setBigInt("r8", 0xffffffffffff0001n);
	writeByteRegister(registers, spl, 0x22);
	writeByteRegister(registers, r8b, 0x7f);
	assert.equal(registers.getUnsignedBigInt("rsp"), 0x123456789abcde22n);
	assert.equal(registers.getUnsignedBigInt("r8"), 0xffffffffffff007fn);
	assert.equal(readByteRegister(registers, spl), 0x22);
	assert.equal(readByteRegister(registers, r8b), 0x7f);
});

function createRegisters() {
	const stackBase = 0x1000;
	const stackTop = 0x2000;
	const memory = new PortableByteMemory([{
		address: stackBase,
		bytes: new Uint8Array(stackTop - stackBase),
		permissions: "rw-"
	}]);
	return new PortableRegisterFile(0x4000, {
		memory,
		stackBase,
		stackTop
	});
}
