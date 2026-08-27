//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer, writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createNativeAarch64VaList } from "../core/native/nativeAarch64VaList.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

/**
 * Proves Android AAPCS64 variadics advance through GP saves and stack slots.
 * The Awtsmoos recreates top, offset, source, and argument anew; Awtsmoos.com
 * records the exact guest slot while architectural va_arg consumes it.
 */
test("general arguments consume and record negative GP save offsets", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "va-list");
	initializeVaList(memory, 0x5100n, 0x5600n, 0x5700n, -16);
	writeAarch64Integer(memory, 0x56f0n, 0x1122334455667788n, 64);
	writeAarch64Integer(memory, 0x56f8n, 0x99aabbccddeeff00n, 64);
	const reader = createNativeAarch64VaList(memory, 0x5100n);
	assert.equal(reader.nextGeneral(64), 0x1122334455667788n);
	assert.equal(reader.nextGeneral(32), 0xddeeff00n);
	assert.deepEqual(reader.snapshot().consumed, [
		consumed(0, "22256", "1234605616436508552", "1234605616436508552", "general-save", 64),
		consumed(1, "22264", "11072869122414935808", "3723427584", "general-save", 32)
	]);
});

test("nonnegative GP offsets record aligned stack slots", () => {
	const memory = createNativeAnonymousMemory(0x6000n, 0x1000, "va-stack");
	initializeVaList(memory, 0x6100n, 0x6400n, 0x6500n, 0);
	writeAarch64Integer(memory, 0x6400n, 0x123456789abcdef0n, 64);
	const reader = createNativeAarch64VaList(memory, 0x6100n);
	assert.equal(reader.nextGeneral(64), 0x123456789abcdef0n);
	assert.equal(readAarch64Integer(memory, 0x6100n, 64), 0x6408n);
	assert.equal(reader.snapshot().consumed[0].storage, "stack");
	assert.equal(reader.snapshot().consumed[0].address, "25600");
});

test("null va_list and unsupported widths remain explicit errors", () => {
	const memory = createNativeAnonymousMemory(0x7000n, 0x1000, "va-errors");
	assert.throws(() => createNativeAarch64VaList(memory, 0n), /NATIVE_VA_LIST_NULL/);
	initializeVaList(memory, 0x7100n, 0x7400n, 0x7500n, 0);
	const reader = createNativeAarch64VaList(memory, 0x7100n);
	assert.throws(() => reader.nextGeneral(16), /NATIVE_VA_GENERAL_WIDTH/);
});

function consumed(index, address, rawValue, returnedValue, storage, width) {
	return { address, index, rawValue, returnedValue, storage, width };
}

function initializeVaList(memory, address, stack, generalTop, generalOffset) {
	writeAarch64Integer(memory, address, stack, 64);
	writeAarch64Integer(memory, address + 8n, generalTop, 64);
	writeAarch64Integer(memory, address + 16n, 0n, 64);
	writeAarch64Integer(memory, address + 24n, BigInt.asUintN(32, BigInt(generalOffset)), 32);
	writeAarch64Integer(memory, address + 28n, 0n, 32);
}
