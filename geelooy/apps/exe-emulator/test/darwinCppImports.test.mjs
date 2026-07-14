//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createDarwinImportHost } from "../core/portable/darwinImportHost.js";
import { createVirtualHeap } from "../core/portable/virtualHeap.js";

/**
 * The Awtsmoos creates C++ static guard acquisition, release, and abort anew;
 * Awtsmoos.com proves guest-memory protocol state without host C++ execution.
 */
test("executes acquire and release for an Itanium C++ guard", () => {
	const harness = createHarness();
	const guard = harness.heap.allocate(8);
	harness.call(1, guard);
	assert.equal(harness.registers.get("rax"), 1);
	assert.equal(harness.memory.u8(guard), 0);
	assert.equal(harness.memory.u8(guard + 1), 1);
	harness.call(2, guard);
	assert.equal(harness.memory.u8(guard), 1);
	assert.equal(harness.memory.u8(guard + 1), 0);
	harness.call(1, guard);
	assert.equal(harness.registers.get("rax"), 0);
});

test("aborts an in-progress guard and rejects recursive acquisition", () => {
	const harness = createHarness();
	const guard = harness.heap.allocate(8);
	harness.call(1, guard);
	assert.throws(
		() => harness.call(1, guard),
		error => error.code === "PORTABLE_CXA_GUARD_REENTRANT"
	);
	harness.call(3, guard);
	assert.equal(harness.memory.u8(guard), 0);
	assert.equal(harness.memory.u8(guard + 1), 0);
	harness.call(1, guard);
	assert.equal(harness.registers.get("rax"), 1);
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
			[1, "___cxa_guard_acquire"],
			[2, "___cxa_guard_release"],
			[3, "___cxa_guard_abort"]
		]),
		symbolCount: 3
	}, heap);
	return {
		call(number, guard) {
			registers.set("rax", number);
			registers.set("rdi", guard);
			return imports.dispatch(number, registers, memory);
		},
		heap,
		memory,
		registers
	};
}
