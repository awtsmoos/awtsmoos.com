//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeErrnoState } from "../core/native/nativeErrnoState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeStdioHandlers } from "../core/native/registerNativeStdioHandlers.js";
import { createNativeStdioState } from "../core/native/nativeStdioState.js";

const RETURN_ADDRESS = 0x7777n;

test("authentic fprintf writes one string and newline to opaque stderr", () => {
	const fixture = createFixture();
	const format = writeCString(fixture.heap, "%s\n");
	const value = writeCString(fixture.heap, "warning");
	fixture.registers.write(0, 0xabcdefn);
	fixture.registers.write(1, format);
	fixture.registers.write(2, value);
	const handled = invoke(fixture, "fprintf");
	assert.equal(handled.result.result, 8);
	assert.equal(fixture.registers.read(0, 32), 8n);
	assert.equal(streamText(fixture.stdio, 0xabcdefn), "warning\n");
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("sprintf and snprintf write NUL with full-length returns", () => {
	const fixture = createFixture();
	const format = writeCString(fixture.heap, "%s");
	const value = writeCString(fixture.heap, "abcdef");
	const destination = fixture.heap.allocate(16n);
	fixture.registers.write(0, destination);
	fixture.registers.write(1, format);
	fixture.registers.write(2, value);
	invoke(fixture, "sprintf");
	assert.deepEqual(
		[...fixture.heap.read(destination, 7)],
		[97, 98, 99, 100, 101, 102, 0]
	);
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, destination);
	fixture.registers.write(1, 4n);
	fixture.registers.write(2, format);
	fixture.registers.write(3, value);
	invoke(fixture, "snprintf");
	assert.equal(fixture.registers.read(0, 32), 6n);
	assert.deepEqual([...fixture.heap.read(destination, 4)], [97, 98, 99, 0]);
});

test("asprintf allocates text and stores a guest pointer", () => {
	const fixture = createFixture();
	const target = fixture.heap.allocate(8n);
	const format = writeCString(fixture.heap, "%u");
	fixture.registers.write(0, target);
	fixture.registers.write(1, format);
	fixture.registers.write(2, 42n);
	invoke(fixture, "asprintf");
	const pointer = readPointer(fixture.heap, target);
	assert.equal(new TextDecoder().decode(fixture.heap.read(pointer, 3)), "42\0");
	assert.equal(fixture.registers.read(0, 32), 2n);
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x4000);
	const errnoState = createNativeErrnoState(heap);
	const stdio = createNativeStdioState();
	const registry = createNativeHostImportRegistry();
	registerNativeStdioHandlers(registry, { errnoState, heap, stdio });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, RETURN_ADDRESS);
	return Object.freeze({ heap, registers, registry, stdio });
}

function invoke(fixture, name) {
	return fixture.registry.handle(Object.freeze({ name }), Object.freeze({
		memory: fixture.heap,
		registers: fixture.registers
	}));
}

function readPointer(heap, address) {
	const bytes = heap.read(address, 8);
	return new DataView(bytes.buffer, bytes.byteOffset, 8).getBigUint64(0, true);
}

function streamText(stdio, pointer) {
	return stdio.snapshot().find(item => {
		return item.pointer === BigInt(pointer).toString();
	}).text;
}

function writeCString(heap, value) {
	const bytes = new TextEncoder().encode(`${value}\0`);
	const pointer = heap.allocate(BigInt(bytes.length));
	heap.write(pointer, bytes);
	return pointer;
}
