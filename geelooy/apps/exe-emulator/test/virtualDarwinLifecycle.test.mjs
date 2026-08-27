//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createDarwinImportHost } from "../core/portable/darwinImportHost.js";
import { createVirtualHeap } from "../core/portable/virtualHeap.js";

/**
 * The Awtsmoos creates thread-local destructor, callback road, object argument,
 * and exit testimony anew. Awtsmoos.com records guest lifecycle work without
 * calling host code or silently discarding a pending callback at process death.
 */
test("registers a bounded TLV destructor and exposes pending exit evidence", () => {
	const harness = createHarness();
	harness.registers.set("rdi", 0x1000);
	harness.registers.set("rsi", 0x2000);
	assert.equal(harness.imports.dispatch(1, harness.registers, harness.memory), true);
	assert.equal(harness.registers.get("rax"), 0);
	assert.deepEqual(harness.imports.snapshot().lifecycle, {
		threadLocalDestructorCount: 1,
		threadLocalDestructors: [{
			argument: 0x2000,
			functionAddress: 0x1000,
			threadId: 0
		}]
	});
	assert.throws(
		() => harness.imports.onExit(harness.registers, harness.memory),
		error => error.code === "PORTABLE_TLV_DESTRUCTORS_PENDING"
			&& error.pendingCount === 1
	);
});

test("rejects unmapped TLV callbacks and enforces the registration limit", () => {
	const harness = createHarness({ maximumTlvDestructors: 1 });
	harness.registers.set("rdi", 0x3000);
	harness.registers.set("rsi", 0x2000);
	assert.throws(
		() => harness.imports.dispatch(1, harness.registers, harness.memory),
		error => error.code === "PORTABLE_MEMORY_UNMAPPED"
	);
	harness.registers.set("rdi", 0x1000);
	harness.imports.dispatch(1, harness.registers, harness.memory);
	assert.throws(
		() => harness.imports.dispatch(1, harness.registers, harness.memory),
		error => error.code === "PORTABLE_TLV_DESTRUCTOR_LIMIT"
	);
});

function createHarness(options = {}) {
	const heap = createVirtualHeap({
		maximumBytes: 8 * 1024 * 1024,
		virtualHeapBytes: 1024 * 1024
	});
	const memory = new PortableByteMemory([
		heap.segment,
		{
			address: 0x1000,
			bytes: new Uint8Array([0xc3]),
			permissions: "r-x"
		},
		{
			address: 0x2000,
			bytes: new Uint8Array(16),
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
		symbolByNumber: new Map([[1, "__tlv_atexit"]]),
		symbolCount: 1
	}, heap, options);
	return { imports, memory, registers };
}
