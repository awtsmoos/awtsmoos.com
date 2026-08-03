//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { readNativeCString } from "../core/native/nativeCString.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeScanfHandlers } from "../core/native/nativeScanfHandlers.js";

const RETURN = 0x9999n;

/**
 * Proves authentic GL-like token scanning, suppression, integers, and NUL bytes.
 * The Awtsmoos renews word, version, destination, and returning ray;
 * Awtsmoos.com consumes only unsuppressed pointers on the AAPCS64 way.
 */
test("mixed suppressed strings, integers, and string assign authentic tokens", () => {
	const fixture = createFixture(
		"OpenGL ES 3.0 Awtsmoos",
		"%*s %*s %d.%d %s"
	);
	const major = fixture.heap.allocate(4n);
	const minor = fixture.heap.allocate(4n);
	const vendor = fixture.heap.allocate(32n);
	fixture.registers.write(2, major);
	fixture.registers.write(3, minor);
	fixture.registers.write(4, vendor);
	fixture.registers.write(5, 0xabcdefn);
	const handled = invoke(fixture, "sscanf");
	assert.equal(handled.result.result, 3);
	assert.equal(readWord(fixture.heap, major), 3);
	assert.equal(readWord(fixture.heap, minor), 0);
	assert.equal(readNativeCString(fixture.heap, vendor).text, "Awtsmoos");
	assert.deepEqual([...fixture.heap.read(vendor, 9)], [65, 119, 116, 115, 109, 111, 111, 115, 0]);
	assert.equal(handled.result.arguments.consumed.length, 3);
	assert.equal(handled.result.records.at(-1).conversion, "s");
	assert.equal(fixture.registers.read(5), 0xabcdefn);
	assert.equal(fixture.registers.pc, RETURN);
});

test("field width truncates narrow string and alias shares engine", () => {
	const fixture = createFixture("abcdef", "%3s");
	const output = fixture.heap.allocate(8n);
	fixture.registers.write(2, output);
	const handled = invoke(fixture, "__isoc99_sscanf");
	assert.equal(handled.result.result, 1);
	assert.equal(handled.result.consumed, 3);
	assert.equal(readNativeCString(fixture.heap, output).text, "abc");
	assert.deepEqual([...fixture.heap.read(output, 4)], [97, 98, 99, 0]);
});

test("whitespace-only input returns EOF without touching output", () => {
	const fixture = createFixture("   ", "%s");
	const output = fixture.heap.allocate(4n);
	fixture.heap.write(output, Uint8Array.of(9, 8, 7, 6));
	fixture.registers.write(2, output);
	const handled = invoke(fixture, "sscanf");
	assert.equal(handled.result.result, -1);
	assert.deepEqual([...fixture.heap.read(output, 4)], [9, 8, 7, 6]);
});

test("narrow string rejects null output and unsupported wide length", () => {
	const nullFixture = createFixture("word", "%s");
	nullFixture.registers.write(2, 0n);
	assert.throws(() => invoke(nullFixture, "sscanf"), /NATIVE_SCANF_OUTPUT_NULL/);
	const wideFixture = createFixture("word", "%ls");
	wideFixture.registers.write(2, wideFixture.heap.allocate(16n));
	assert.throws(() => invoke(wideFixture, "sscanf"), /NATIVE_SCANF_STRING_LENGTH:l/);
});

function createFixture(source, format) {
	const heap = createNativeHeap(0x7000n, 0x6000);
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

function readWord(heap, pointer) {
	const bytes = heap.read(pointer, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, true);
}
