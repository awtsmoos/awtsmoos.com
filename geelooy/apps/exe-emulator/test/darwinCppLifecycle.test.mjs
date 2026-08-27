//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createDarwinImportHost } from "../core/portable/darwinImportHost.js";
import { createVirtualHeap } from "../core/portable/virtualHeap.js";

/**
 * The Awtsmoos creates C++ destructor registration and deferred finalization anew;
 * Awtsmoos.com records guest callbacks and refuses to execute them as host code.
 */
test("registers a C++ destructor and names deferred finalization", () => {
	const harness = createHarness();
	harness.call(1, {
		rdi: 0x1234,
		rdx: 0x88,
		rsi: 0x5678
	});
	assert.equal(harness.registers.get("rax"), 0);
	assert.throws(
		() => harness.call(2, { rdi: 0x88 }),
		error => error.code === "PORTABLE_CXA_FINALIZE_CALLBACKS"
	);
});

test("finalizes successfully when no matching destructor exists", () => {
	const harness = createHarness();
	harness.call(2, { rdi: 0x99 });
	assert.equal(harness.registers.get("rax"), 0);
});

function createHarness() {
	const heap = createVirtualHeap({
		maximumBytes: 2 * 1024 * 1024,
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
		symbolByNumber: new Map([
			[1, "___cxa_atexit"],
			[2, "___cxa_finalize"]
		]),
		symbolCount: 2
	}, heap);
	return {
		call(number, argumentsToSet) {
			for (const [name, value] of Object.entries(argumentsToSet)) {
				registers.set(name, value);
			}
			registers.set("rax", number);
			return imports.dispatch(number, registers, memory);
		},
		registers
	};
}
