//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	NATIVE_MEMORY_PROTECTION,
	NATIVE_VIRTUAL_MEMORY_START
} from "../core/native/nativeVirtualMemoryConstants.js";
import { createNativeVirtualMemory } from "../core/native/nativeVirtualMemory.js";

const PAGE = 4096n;
const FIXED = NATIVE_VIRTUAL_MEMORY_START + 0x10000n;

/**
 * Proves fixed replacement, protection splitting, unmap holes, and overlap law.
 * The Awtsmoos renews left, middle, right, and newly emptied shore;
 * Awtsmoos.com preserves every unaffected mapping and resident page evermore.
 */
test("mprotect splits records and munmap removes only the measured middle", () => {
	const memory = createNativeVirtualMemory();
	const mapped = memory.map(fixedRequest(FIXED, PAGE * 3n, 3, 0x32n));
	assert.equal(mapped.ok, true);
	memory.write(FIXED, Uint8Array.of(1));
	memory.write(FIXED + PAGE * 2n, Uint8Array.of(3));
	assert.equal(memory.protect(FIXED + PAGE, PAGE, 1n).ok, true);
	assert.deepEqual(
		memory.snapshot().mappings.map(record => record.protection),
		[3, 1, 3]
	);
	assert.equal(memory.unmap(FIXED + PAGE, PAGE).ok, true);
	assert.equal(memory.contains(FIXED, 1), true);
	assert.equal(memory.contains(FIXED + PAGE, 1), false);
	assert.equal(memory.contains(FIXED + PAGE * 2n, 1), true);
	assert.equal(memory.snapshot().pages.residentPageCount, 2);
});

test("MAP_FIXED replaces resident pages and NOREPLACE reports overlap", () => {
	const memory = createNativeVirtualMemory();
	memory.map(fixedRequest(FIXED, PAGE, 3, 0x32n));
	memory.write(FIXED, Uint8Array.of(9));
	const replaced = memory.map(fixedRequest(FIXED, PAGE, 0, 0x32n));
	assert.equal(replaced.ok, true);
	assert.equal(memory.snapshot().pages.residentPageCount, 0);
	assert.throws(() => memory.read(FIXED, 1), /NATIVE_VIRTUAL_MEMORY_PROTECTION/);
	const collision = memory.map(fixedRequest(FIXED, PAGE, 0, 0x100022n));
	assert.equal(collision.ok, false);
	assert.equal(collision.errno, 17);
});

test("fixed mappings outside the virtual envelope are rejected", () => {
	const memory = createNativeVirtualMemory();
	const below = memory.map(fixedRequest(0x1000n, PAGE, 0, 0x32n));
	assert.equal(below.ok, false);
});

function fixedRequest(address, length, protection, flags) {
	return Object.freeze({
		address,
		fd: -1n,
		flags,
		length,
		offset: 0n,
		protection: BigInt(protection)
	});
}
