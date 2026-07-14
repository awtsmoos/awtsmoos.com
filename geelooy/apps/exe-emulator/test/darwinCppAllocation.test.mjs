//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createDarwinImportHost } from "../core/portable/darwinImportHost.js";
import { createVirtualHeap } from "../core/portable/virtualHeap.js";

/**
 * The Awtsmoos creates C++ object and array storage anew; Awtsmoos.com proves
 * operator new/delete remain bounded guest-heap operations rather than host calls.
 */
test("dispatches scalar and array C++ allocation operators", () => {
	const harness = createHarness();
	const scalar = harness.call(1, 48);
	const array = harness.call(2, 96);
	assert.equal(harness.heap.sizeOf(scalar), 48);
	assert.equal(harness.heap.sizeOf(array), 96);
	assert.notEqual(scalar, array);
	harness.call(3, scalar);
	harness.call(4, array);
	assert.equal(harness.registers.get("rax"), 0);
});

test("allocates one byte for zero-sized operator new", () => {
	const harness = createHarness();
	const address = harness.call(1, 0);
	assert.equal(harness.heap.sizeOf(address), 1);
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
			[1, "__Znwm"],
			[2, "__Znam"],
			[3, "__ZdlPv"],
			[4, "__ZdaPv"]
		]),
		symbolCount: 4
	}, heap);
	return {
		call(number, argument) {
			registers.set("rax", number);
			registers.set("rdi", argument);
			imports.dispatch(number, registers, memory);
			return registers.get("rax");
		},
		heap,
		registers
	};
}
