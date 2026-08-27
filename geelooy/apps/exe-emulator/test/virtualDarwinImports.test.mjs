//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createDarwinImportHost } from "../core/portable/darwinImportHost.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";
import { createVirtualHeap } from "../core/portable/virtualHeap.js";

/**
 * The Awtsmoos creates synthetic import number, guest allocation, byte fill,
 * string measurement, and telemetry anew. Awtsmoos.com proves virtual libc work
 * occurs in bounded guest memory and names every unsupported imported function.
 */
test("dispatches malloc, memset, and strlen through guest memory", () => {
	const harness = createHarness(new Map([
		[1, "_malloc"],
		[2, "_memset"],
		[3, "_strlen"]
	]));
	harness.call(1, { rdi: 32 });
	const address = harness.registers.get("rax");
	harness.call(2, { rdi: address, rsi: 65, rdx: 5 });
	harness.memory.write8(address + 5, 0);
	harness.call(3, { rdi: address });
	assert.equal(harness.memory.ascii(address, 5), "AAAAA");
	assert.equal(harness.registers.get("rax"), 5);
	const snapshot = harness.syscalls.snapshot().imports;
	assert.equal(snapshot.callCount, 3);
	assert.equal(snapshot.heap.allocationCount, 1);
});

test("reports an unimplemented virtual import by symbol", () => {
	const harness = createHarness(new Map([[7, "_pthread_create"]]));
	assert.throws(
		() => harness.call(7),
		error => error.code === "PORTABLE_IMPORT_UNIMPLEMENTED"
			&& error.importSymbol === "_pthread_create"
	);
});

function createHarness(symbolByNumber) {
	const heap = createVirtualHeap({
		maximumBytes: 8 * 1024 * 1024,
		virtualHeapBytes: 1024 * 1024
	});
	const memory = new PortableByteMemory([heap.segment], {
		maximumBytes: 2 * 1024 * 1024
	});
	const values = new Map();
	const registers = {
		rip: 0x7000,
		get(name) {
			return values.get(name) || 0;
		},
		set(name, value) {
			values.set(name, value);
			return value;
		}
	};
	const imports = createDarwinImportHost({
		patches: [],
		symbolByNumber,
		symbolCount: symbolByNumber.size
	}, heap);
	const syscalls = createPortableSyscallHost(
		"darwin-x86-64",
		{},
		{ virtualImports: imports }
	);
	return {
		call(number, valuesToSet = {}) {
			for (const [name, value] of Object.entries(valuesToSet)) {
				registers.set(name, value);
			}
			registers.set("rax", number);
			return syscalls.handle(registers, memory);
		},
		memory,
		registers,
		syscalls
	};
}
