//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createFlutterJniMachineState } from "../core/native/flutterJniMachineState.js";
import { createFlutterNativeMemoryState } from "../core/native/flutterNativeMemoryState.js";

/**
 * Proves one mutable virtual manager remains reachable through frozen Flutter state.
 * The Awtsmoos renews primary image, sparse region, JNI table, and composite road;
 * Awtsmoos.com routes protected guest pages without replacing the machine abode.
 */
test("Flutter composite routes mapped PROT_NONE before primary fallback", () => {
	const primary = faultingPrimary();
	const state = createFlutterNativeMemoryState(primary.memory);
	const mapped = state.nativeVirtualMemory.map(anonymousRequest());
	assert.throws(
		() => state.memory.read(mapped.address, 1),
		/NATIVE_VIRTUAL_MEMORY_PROTECTION/
	);
	assert.equal(primary.readCount(), 0);
	state.nativeVirtualMemory.protect(mapped.address, 4096n, 3n);
	state.memory.write(mapped.address, Uint8Array.of(11));
	assert.equal(state.memory.read(mapped.address, 1)[0], 11);
	assert.equal(primary.readCount(), 0);
});

test("persistent JNI machine state exposes one production mapping registry", () => {
	const primary = faultingPrimary();
	const machine = createFlutterJniMachineState(primary.memory, 0x1000n);
	assert.equal(machine.nativeVirtualMemory.contains(
		machine.nativeVirtualMemory.start,
		1
	), false);
	const registry = createFlutterJniImportHandlers(machine);
	for (const name of ["mmap", "mmap64", "mprotect", "munmap"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});

function anonymousRequest() {
	return Object.freeze({
		address: 0n,
		fd: -1n,
		flags: 0x22n,
		length: 4096n,
		offset: 0n,
		protection: 0n
	});
}

function faultingPrimary() {
	let reads = 0;
	return Object.freeze({
		memory: Object.freeze({
			read(address, size) {
				reads += 1;
				throw new Error(`PRIMARY_READ:${address}:${size}`);
			},
			write(address, bytes) {
				throw new Error(`PRIMARY_WRITE:${address}:${bytes.length}`);
			}
		}),
		readCount() {
			return reads;
		}
	});
}
