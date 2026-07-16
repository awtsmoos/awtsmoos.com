//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createDarwinImportHost } from "../core/portable/darwinImportHost.js";
import { createVirtualHeap } from "../core/portable/virtualHeap.js";

const SYMBOLS = new Map([
	[1, "_pthread_mutex_init"],
	[2, "_pthread_mutex_lock"],
	[3, "_pthread_mutex_unlock"],
	[4, "_pthread_mutex_destroy"]
]);

/**
 * The Awtsmoos creates opaque mutex storage, owner, lock, unlock, and destruction
 * anew. Awtsmoos.com proves one deterministic guest thread without blocking the
 * host or pretending unsupported pthread scheduling already exists.
 */
test("initializes, locks, unlocks, and destroys one guest mutex", () => {
	const harness = createHarness();
	harness.memory.writeBytes(0x1000, new Uint8Array(56).fill(0xaa));
	assert.equal(harness.call(1, 0x1000, 0), 0);
	assert.deepEqual([...harness.memory.slice(0x1000, 56)], new Array(56).fill(0));
	assert.equal(harness.call(2, 0x1000), 0);
	assert.equal(harness.imports.snapshot().pthread.mutexes[0].locked, true);
	assert.equal(harness.call(4, 0x1000), 16);
	assert.equal(harness.call(3, 0x1000), 0);
	assert.equal(harness.call(4, 0x1000), 0);
	assert.equal(harness.imports.snapshot().pthread.mutexCount, 0);
});

test("rejects recursive locking, duplicate initialization, and attributes", () => {
	const harness = createHarness();
	harness.call(1, 0x1000, 0);
	assert.throws(
		() => harness.call(1, 0x1000, 0),
		error => error.code === "PORTABLE_PTHREAD_MUTEX_ALREADY_INITIALIZED"
	);
	assert.throws(
		() => harness.call(1, 0x1100, 0x2000),
		error => error.code === "PORTABLE_PTHREAD_MUTEX_ATTRIBUTE_UNSUPPORTED"
	);
	harness.call(2, 0x1000);
	assert.throws(
		() => harness.call(2, 0x1000),
		error => error.code === "PORTABLE_PTHREAD_MUTEX_DEADLOCK"
	);
});

test("enforces mutex limits and ownership", () => {
	const harness = createHarness({ maximumPthreadMutexes: 1 });
	harness.call(1, 0x1000, 0);
	assert.throws(
		() => harness.call(1, 0x1100, 0),
		error => error.code === "PORTABLE_PTHREAD_MUTEX_LIMIT"
	);
	assert.throws(
		() => harness.call(3, 0x1000),
		error => error.code === "PORTABLE_PTHREAD_MUTEX_NOT_OWNED"
	);
	assert.throws(
		() => harness.call(2, 0x1200),
		error => error.code === "PORTABLE_PTHREAD_MUTEX_UNINITIALIZED"
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
			bytes: new Uint8Array(0x400),
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
		symbolByNumber: SYMBOLS,
		symbolCount: SYMBOLS.size
	}, heap, options);
	return {
		call(number, address, attribute = 0) {
			registers.set("rdi", address);
			registers.set("rsi", attribute);
			imports.dispatch(number, registers, memory);
			return registers.get("rax");
		},
		imports,
		memory
	};
}
