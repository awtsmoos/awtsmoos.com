//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createDarwinImportHost } from "../core/portable/darwinImportHost.js";
import { createVirtualHeap } from "../core/portable/virtualHeap.js";

/**
 * The Awtsmoos creates UTC second, calendar fields, static storage, and zone anew.
 * Awtsmoos.com proves Darwin GMTIME writes a real guest `struct tm` and never
 * leaks the host timezone, locale, object identity, or mutable Date instance.
 */
test("GMTIME writes and reuses deterministic Darwin struct tm storage", () => {
	const harness = createHarness();
	harness.memory.write64BigInt(0x1000, 0n);
	harness.call();
	const first = harness.registers.get("rax");
	assert.deepEqual(readTm(harness.memory, first), {
		hour: 0,
		isDst: 0,
		minute: 0,
		month: 0,
		monthDay: 1,
		second: 0,
		weekDay: 4,
		year: 70,
		yearDay: 0
	});
	const zone = harness.memory.u64(first + 48);
	assert.equal(harness.memory.ascii(zone, 4), "UTC\0");
	harness.memory.write64BigInt(0x1000, 86400n);
	harness.call();
	assert.equal(harness.registers.get("rax"), first);
	assert.equal(harness.memory.i32(first + 12), 2);
	assert.equal(harness.imports.snapshot().time.callCount, 2);
});

test("GMTIME rejects seconds outside the deterministic Date range", () => {
	const harness = createHarness();
	harness.memory.write64BigInt(0x1000, 8640000000001n);
	assert.throws(
		() => harness.call(),
		error => error.code === "PORTABLE_TIME_RANGE"
	);
});

function createHarness() {
	const heap = createVirtualHeap({
		maximumBytes: 8 * 1024 * 1024,
		virtualHeapBytes: 1024 * 1024
	});
	const memory = new PortableByteMemory([
		heap.segment,
		{
			address: 0x1000,
			bytes: new Uint8Array(8),
			permissions: "rw-"
		}
	], { maximumBytes: 2 * 1024 * 1024 });
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
		symbolByNumber: new Map([[1, "_gmtime"]]),
		symbolCount: 1
	}, heap);
	return {
		call() {
			registers.set("rdi", 0x1000);
			return imports.dispatch(1, registers, memory);
		},
		imports,
		memory,
		registers
	};
}

function readTm(memory, address) {
	return {
		hour: memory.i32(address + 8),
		isDst: memory.i32(address + 32),
		minute: memory.i32(address + 4),
		month: memory.i32(address + 16),
		monthDay: memory.i32(address + 12),
		second: memory.i32(address),
		weekDay: memory.i32(address + 24),
		year: memory.i32(address + 20),
		yearDay: memory.i32(address + 28)
	};
}
