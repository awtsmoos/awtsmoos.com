//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeScanfHandlers } from "../core/native/nativeScanfHandlers.js";

const RETURN = 0x8888n;

/**
 * Proves suppression, field width, aliases, and exact integer destination sizes.
 * The Awtsmoos renews byte, halfword, word, doubleword, and variadic shore;
 * Awtsmoos.com consumes no hidden pointer for a suppressed conversion evermore.
 */
test("suppression and length modifiers write exact AArch64 widths", () => {
	const fixture = createFixture("12 -1 258 65538 4294967298", "%*2d %hhd %hd %d %ld");
	const byte = fixture.heap.allocate(1n);
	const half = fixture.heap.allocate(2n);
	const word = fixture.heap.allocate(4n);
	const wide = fixture.heap.allocate(8n);
	[byte, half, word, wide].forEach((pointer, index) => fixture.registers.write(index + 2, pointer));
	const handled = invoke(fixture, "sscanf");
	assert.equal(handled.result.result, 4);
	assert.equal(read(fixture.heap, byte, 1), 0xffn);
	assert.equal(read(fixture.heap, half, 2), 258n);
	assert.equal(read(fixture.heap, word, 4), 65538n);
	assert.equal(read(fixture.heap, wide, 8), 4294967298n);
	assert.equal(handled.result.arguments.consumed.length, 4);
});

test("field width bounds unsigned conversion and alias shares engine", () => {
	const fixture = createFixture("3456", "%3u");
	const output = fixture.heap.allocate(4n);
	fixture.registers.write(2, output);
	const handled = invoke(fixture, "__isoc99_sscanf");
	assert.equal(handled.result.result, 1);
	assert.equal(handled.result.consumed, 3);
	assert.equal(read(fixture.heap, output, 4), 345n);
	assert.equal(fixture.registers.pc, RETURN);
});

test("leading whitespace and negative decimal write two's complement", () => {
	const fixture = createFixture("  -42", "%d");
	const output = fixture.heap.allocate(4n);
	fixture.registers.write(2, output);
	invoke(fixture, "sscanf");
	assert.equal(read(fixture.heap, output, 4), 0xffffffd6n);
});

function createFixture(source, format) {
	const heap = createNativeHeap(0x6000n, 0x5000);
	const registry = createNativeHostImportRegistry();
	registerNativeScanfHandlers(registry);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, writeCString(heap, source));
	registers.write(1, writeCString(heap, format));
	registers.write(30, RETURN);
	return { heap, registers, registry };
}
function invoke(fixture, name) {
	return fixture.registry.handle({ name }, {
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
function read(heap, address, bytes) {
	const value = heap.read(address, bytes);
	const view = new DataView(value.buffer, value.byteOffset, bytes);
	if (bytes === 1) return BigInt(view.getUint8(0));
	if (bytes === 2) return BigInt(view.getUint16(0, true));
	if (bytes === 4) return BigInt(view.getUint32(0, true));
	return view.getBigUint64(0, true);
}
