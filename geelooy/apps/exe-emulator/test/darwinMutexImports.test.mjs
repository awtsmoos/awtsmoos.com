//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createDarwinImportHost } from "../core/portable/darwinImportHost.js";
import { createVirtualHeap } from "../core/portable/virtualHeap.js";

/**
 * The Awtsmoos creates mutex acquisition, try result, release, and destruction
 * anew; Awtsmoos.com proves single-thread state while naming impossible contention.
 */
test("locks, tries, unlocks, and destroys a virtual std::mutex", () => {
	const harness = createHarness();
	const mutex = harness.heap.allocate(64);
	harness.call(1, mutex);
	harness.call(3, mutex);
	assert.equal(harness.registers.get("rax"), 0);
	harness.call(2, mutex);
	harness.call(3, mutex);
	assert.equal(harness.registers.get("rax"), 1);
	harness.call(2, mutex);
	harness.call(4, mutex);
	assert.equal(harness.registers.get("rax"), 0);
});

test("rejects blocking re-lock and unbalanced unlock", () => {
	const harness = createHarness();
	const mutex = harness.heap.allocate(64);
	harness.call(1, mutex);
	assert.throws(
		() => harness.call(1, mutex),
		error => error.code === "PORTABLE_MUTEX_WOULD_BLOCK"
	);
	harness.call(2, mutex);
	assert.throws(
		() => harness.call(2, mutex),
		error => error.code === "PORTABLE_MUTEX_UNLOCK_UNHELD"
	);
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
			[1, "__ZNSt3__15mutex4lockEv"],
			[2, "__ZNSt3__15mutex6unlockEv"],
			[3, "__ZNSt3__15mutex8try_lockEv"],
			[4, "__ZNSt3__15mutexD1Ev"]
		]),
		symbolCount: 4
	}, heap);
	return {
		call(number, address) {
			registers.set("rax", number);
			registers.set("rdi", address);
			return imports.dispatch(number, registers, memory);
		},
		heap,
		registers
	};
}
