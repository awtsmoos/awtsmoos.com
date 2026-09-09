//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer, writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createNativeAarch64VaList } from "../core/native/nativeAarch64VaList.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

test("general arguments consume GP save area then shared stack", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "va-list");
	initializeVaList(memory, 0x5100n, 0x5600n, 0x5700n, -16, 0x5900n, 0);
	writeAarch64Integer(memory, 0x56f0n, 0x1122334455667788n, 64);
	writeAarch64Integer(memory, 0x56f8n, 0x99aabbccddeeff00n, 64);
	const reader = createNativeAarch64VaList(memory, 0x5100n);
	assert.equal(reader.nextGeneral(64), 0x1122334455667788n);
	assert.equal(reader.nextGeneral(32), 0xddeeff00n);
	assert.equal(reader.snapshot().consumed[0].storage, "general-save");
	assert.equal(reader.snapshot().consumed[1].kind, "general");
});

test("floating arguments consume sixteen-byte vector save slots", () => {
	const memory = createNativeAnonymousMemory(0x6000n, 0x1000, "va-vector");
	initializeVaList(memory, 0x6100n, 0x6600n, 0x6700n, 0, 0x6900n, -32);
	writeFloat64(memory, 0x68e0n, 1.25);
	writeFloat64(memory, 0x68f0n, -2.5);
	const reader = createNativeAarch64VaList(memory, 0x6100n);
	assert.equal(reader.nextFloating(), 1.25);
	assert.equal(reader.nextFloating(), -2.5);
	assert.equal(reader.snapshot().vectorOffset, 0);
	assert.equal(reader.snapshot().consumed[0].storage, "vector-save");
});

test("floating stack fallback advances the shared va_list stack", () => {
	const memory = createNativeAnonymousMemory(0x7000n, 0x1000, "va-float-stack");
	initializeVaList(memory, 0x7100n, 0x7400n, 0x7500n, 0, 0x7600n, 0);
	writeFloat64(memory, 0x7400n, 3.75);
	const reader = createNativeAarch64VaList(memory, 0x7100n);
	assert.equal(reader.nextFloating(), 3.75);
	assert.equal(readAarch64Integer(memory, 0x7100n, 64), 0x7408n);
	assert.equal(reader.snapshot().consumed[0].storage, "stack");
});

test("null list and unsupported widths remain explicit errors", () => {
	const memory = createNativeAnonymousMemory(0x8000n, 0x1000, "va-errors");
	assert.throws(() => createNativeAarch64VaList(memory, 0n), /NATIVE_VA_LIST_NULL/);
	initializeVaList(memory, 0x8100n, 0x8400n, 0x8500n, 0, 0x8600n, 0);
	const reader = createNativeAarch64VaList(memory, 0x8100n);
	assert.throws(() => reader.nextGeneral(16), /NATIVE_VA_GENERAL_WIDTH/);
	assert.throws(() => reader.nextFloating(32), /NATIVE_VA_FLOAT_WIDTH/);
});

function initializeVaList(memory, address, stack, generalTop, generalOffset, vectorTop, vectorOffset) {
	writeAarch64Integer(memory, address, stack, 64);
	writeAarch64Integer(memory, address + 8n, generalTop, 64);
	writeAarch64Integer(memory, address + 16n, vectorTop, 64);
	writeAarch64Integer(memory, address + 24n, BigInt.asUintN(32, BigInt(generalOffset)), 32);
	writeAarch64Integer(memory, address + 28n, BigInt.asUintN(32, BigInt(vectorOffset)), 32);
}

function writeFloat64(memory, address, value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setFloat64(0, value, true);
	memory.write(address, bytes);
}
