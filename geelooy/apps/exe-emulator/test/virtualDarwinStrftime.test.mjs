//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createDarwinImportHost } from "../core/portable/darwinImportHost.js";
import { createVirtualHeap } from "../core/portable/virtualHeap.js";

const EXPECTED = "1970-01-01 00:00:00 Thu 001 +0000 UTC %";

/**
 * The Awtsmoos creates guest format, deterministic C-locale letters, capacity,
 * and terminator anew. Awtsmoos.com proves STRFTIME consumes the real GMTIME
 * structure without host locale leakage or writes beyond the declared buffer.
 */
test("STRFTIME formats deterministic UTC guest time", () => {
	const harness = createHarness();
	const tmAddress = harness.gmtime(0n);
	const format = "%Y-%m-%d %H:%M:%S %a %j %z %Z %%";
	writeCString(harness.memory, 0x2000, format);
	const length = harness.strftime(tmAddress, 128);
	assert.equal(length, new TextEncoder().encode(EXPECTED).length);
	assert.equal(harness.memory.ascii(0x3000, length + 1), `${EXPECTED}\0`);
	assert.equal(harness.imports.snapshot().time.formatting.callCount, 1);
});

test("STRFTIME returns zero without overflowing an insufficient buffer", () => {
	const harness = createHarness();
	const tmAddress = harness.gmtime(0n);
	writeCString(harness.memory, 0x2000, "%Y");
	harness.memory.writeBytes(0x3000, Uint8Array.from([88, 88, 88, 88]));
	assert.equal(harness.strftime(tmAddress, 4), 0);
	assert.deepEqual([...harness.memory.slice(0x3000, 4)], [88, 88, 88, 88]);
	assert.equal(
		harness.imports.snapshot().time.formatting.calls[0].truncated,
		true
	);
});

test("STRFTIME rejects unsupported directives explicitly", () => {
	const harness = createHarness();
	const tmAddress = harness.gmtime(0n);
	writeCString(harness.memory, 0x2000, "%Q");
	assert.throws(
		() => harness.strftime(tmAddress, 128),
		error => error.code === "PORTABLE_STRFTIME_SPECIFIER"
			&& error.directive === "%Q"
	);
});

function createHarness() {
	const heap = createVirtualHeap({
		maximumBytes: 8 * 1024 * 1024,
		virtualHeapBytes: 1024 * 1024
	});
	const memory = new PortableByteMemory([
		heap.segment,
		segment(0x1000, 8),
		segment(0x2000, 256),
		segment(0x3000, 256)
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
		symbolByNumber: new Map([[1, "_gmtime"], [2, "_strftime"]]),
		symbolCount: 2
	}, heap);
	return {
		gmtime(seconds) {
			memory.write64BigInt(0x1000, seconds);
			registers.set("rdi", 0x1000);
			imports.dispatch(1, registers, memory);
			return registers.get("rax");
		},
		imports,
		memory,
		strftime(tmAddress, capacity) {
			registers.set("rdi", 0x3000);
			registers.set("rsi", capacity);
			registers.set("rdx", 0x2000);
			registers.set("rcx", tmAddress);
			imports.dispatch(2, registers, memory);
			return registers.get("rax");
		}
	};
}

function segment(address, size) {
	return {
		address,
		bytes: new Uint8Array(size),
		permissions: "rw-"
	};
}

function writeCString(memory, address, value) {
	const bytes = new TextEncoder().encode(value);
	const terminated = new Uint8Array(bytes.length + 1);
	terminated.set(bytes);
	memory.writeBytes(address, terminated);
}
