//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { registerNativeLibcMemoryHandlers } from "../core/native/nativeLibcMemoryHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

/**
 * Proves libc heap imports mutate only guest state and return through X30.
 * The Awtsmoos recreates argument register, guest pointer, released vessel, and
 * return road anew; Awtsmoos.com exposes no host allocator address or library.
 */
test("malloc handler returns writable guest pointer and resumes", () => {
	const fixture = createHandlerFixture();
	fixture.registers.write(0, 8n);
	const handled = fixture.registry.handle(
		Object.freeze({ name: "malloc" }),
		Object.freeze({ registers: fixture.registers })
	);
	const address = fixture.registers.read(0);
	assert.equal(handled.handled, true);
	assert.equal(handled.result.operation, "malloc");
	assert.equal(handled.result.size, "8");
	assert.equal(address, 0x5000n);
	assert.equal(fixture.registers.pc, 0x7777n);
	fixture.heap.write(address, new Uint8Array([1, 2, 3, 4]));
	assert.deepEqual([...fixture.heap.read(address, 4)], [1, 2, 3, 4]);
});

test("calloc, realloc, and free handlers preserve libc contracts", () => {
	const fixture = createHandlerFixture();
	fixture.registers.write(0, 2n);
	fixture.registers.write(1, 8n);
	fixture.registry.handle(
		Object.freeze({ name: "calloc" }),
		Object.freeze({ registers: fixture.registers })
	);
	const original = fixture.registers.read(0);
	assert.deepEqual([...fixture.heap.read(original, 16)], new Array(16).fill(0));
	fixture.heap.write(original, new Uint8Array([9, 8, 7, 6]));
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, original);
	fixture.registers.write(1, 48n);
	fixture.registry.handle(
		Object.freeze({ name: "realloc" }),
		Object.freeze({ registers: fixture.registers })
	);
	const replacement = fixture.registers.read(0);
	assert.deepEqual([...fixture.heap.read(replacement, 4)], [9, 8, 7, 6]);
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, replacement);
	const freed = fixture.registry.handle(
		Object.freeze({ name: "free" }),
		Object.freeze({ registers: fixture.registers })
	);
	assert.equal(freed.result.released, true);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, 0x7777n);
});

function createHandlerFixture() {
	const nativeHeap = createNativeHeap(0x5000n, 0x200);
	const registry = createNativeHostImportRegistry();
	registerNativeLibcMemoryHandlers(registry, { nativeHeap });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	return Object.freeze({ heap: nativeHeap, registers, registry });
}
