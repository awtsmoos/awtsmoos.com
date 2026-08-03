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

const RETURN = 0x7777n;

/**
 * Proves authentic version scanning and exact partial/EOF return semantics.
 * The Awtsmoos renews source, format, two integers, W0, and returning ray;
 * Awtsmoos.com reveals each guest assignment along the bounded scanner way.
 */
test("authentic percent-d dot percent-d assigns two 32-bit integers", () => {
	const fixture = createFixture("3.2", "%d.%d", "sscanf", 2);
	const first = fixture.heap.allocate(4n);
	const second = fixture.heap.allocate(4n);
	fixture.registers.write(2, first);
	fixture.registers.write(3, second);
	fixture.registers.write(4, 0xabcdefn);
	const handled = invoke(fixture);
	assert.equal(handled.result.result, 2);
	assert.equal(readUnsigned(fixture.heap, first, 4), 3n);
	assert.equal(readUnsigned(fixture.heap, second, 4), 2n);
	assert.equal(fixture.registers.read(4), 0xabcdefn);
	assert.equal(fixture.registers.pc, RETURN);
});

test("literal mismatch returns prior assignment and preserves later output", () => {
	const fixture = createFixture("3x", "%d.%d", "sscanf", 2);
	const first = fixture.heap.allocate(4n);
	const second = fixture.heap.allocate(4n);
	fixture.heap.write(second, Uint8Array.of(9, 0, 0, 0));
	fixture.registers.write(2, first);
	fixture.registers.write(3, second);
	const handled = invoke(fixture);
	assert.equal(handled.result.result, 1);
	assert.equal(readUnsigned(fixture.heap, first, 4), 3n);
	assert.equal(readUnsigned(fixture.heap, second, 4), 9n);
});

test("empty input before conversion returns EOF in signed W0", () => {
	const fixture = createFixture("", "%d", "sscanf", 1);
	fixture.registers.write(2, fixture.heap.allocate(4n));
	const handled = invoke(fixture);
	assert.equal(handled.result.result, -1);
	assert.equal(fixture.registers.read(0, 32), 0xffffffffn);
});

function createFixture(source, format, operation, outputs) {
	const heap = createNativeHeap(0x5000n, 0x5000);
	const registry = createNativeHostImportRegistry();
	registerNativeStdioHandlers(registry, {
		errnoState: createNativeErrnoState(heap),
		heap,
		stdio: createNativeStdioState()
	});
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, writeCString(heap, source));
	registers.write(1, writeCString(heap, format));
	registers.write(30, RETURN);
	return { heap, operation, outputs, registers, registry };
}
function invoke(fixture) {
	return fixture.registry.handle({ name: fixture.operation }, {
		memory: fixture.heap,
		registers: fixture.registers
	});
}
function writeCString(heap, value) {
	const bytes = new TextEncoder().encode(`${value}\0`);
	const pointer = heap.allocate(BigInt(bytes.length));
	heap.write(pointer, bytes);
	return pointer;
}
function readUnsigned(heap, address, bytes) {
	const value = heap.read(address, bytes);
	const view = new DataView(value.buffer, value.byteOffset, bytes);
	return bytes === 4 ? BigInt(view.getUint32(0, true)) : view.getBigUint64(0, true);
}
