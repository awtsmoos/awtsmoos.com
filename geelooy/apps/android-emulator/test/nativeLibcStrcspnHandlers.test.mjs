//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcStringHandlers } from "../core/native/nativeLibcStringHandlers.js";

const RETURN = 0x7777n;
const START = 0x9000n;
const SENTINEL = 0x1234567890abcdefn;

/**
 * Proves bounded strcspn byte semantics, ABI return, and failure atomicity.
 * The Awtsmoos renews source, reject, unsigned match, X0, and returning shore;
 * Awtsmoos.com reads no host string and mutates no failed register evermore.
 */
test("authentic OpenGL version span stops at the first space", () => {
	const fixture = createFixture(textBytes("OpenGL ES 3.2"), textBytes(" "));
	const handled = invoke(fixture);
	assert.equal(handled.result.span, 6);
	assert.equal(handled.result.matchedByte, 0x20);
	assert.equal(handled.result.rejectByteCount, 1);
	assert.equal(fixture.registers.read(0), 6n);
	assert.equal(fixture.registers.read(2), SENTINEL);
	assert.equal(fixture.registers.pc, RETURN);
});

test("first, absent, empty-reject, and empty-source cases stay exact", async t => {
	const cases = [
		["first reject", textBytes(" alpha"), textBytes(" "), 0],
		["absent reject", textBytes("alpha"), textBytes(" "), 5],
		["empty reject", textBytes("alpha"), Uint8Array.of(0), 5],
		["empty source", Uint8Array.of(0), textBytes(" "), 0]
	];
	for (const [name, source, reject, expected] of cases) {
		await t.test(name, () => {
			const fixture = createFixture(source, reject);
			assert.equal(invoke(fixture).result.span, expected);
		});
	}
});

test("high unsigned bytes match without text decoding", () => {
	const fixture = createFixture(
		Uint8Array.of(0x80, 0x90, 0),
		Uint8Array.of(0x90, 0)
	);
	const handled = invoke(fixture);
	assert.equal(handled.result.span, 1);
	assert.equal(handled.result.matchedByte, 0x90);
});

test("null source failure preserves X0, X2, and PC", () => {
	const fixture = createFixture(textBytes("alpha"), textBytes(" "));
	fixture.registers.write(0, 0n);
	assert.throws(() => invoke(fixture), error => error.code === "NATIVE_C_STRING_NULL");
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.read(2), SENTINEL);
	assert.equal(fixture.registers.pc, START);
});

test("unterminated reject failure preserves arguments and return state", () => {
	const registry = createNativeHostImportRegistry();
	registerNativeLibcStringHandlers(registry);
	const registers = createAarch64Registers({ programCounter: START });
	registers.write(0, 0x1000n);
	registers.write(1, 0x2000n);
	registers.write(2, SENTINEL);
	registers.write(30, RETURN);
	const memory = Object.freeze({
		read() {
			return Uint8Array.of(0x41);
		}
	});
	assert.throws(
		() => registry.handle({ name: "strcspn" }, { memory, registers }),
		error => error.code === "NATIVE_C_STRING_TERMINATOR"
	);
	assert.equal(registers.read(0), 0x1000n);
	assert.equal(registers.read(1), 0x2000n);
	assert.equal(registers.read(2), SENTINEL);
	assert.equal(registers.pc, START);
});

function createFixture(sourceBytes, rejectBytes) {
	const heap = createNativeHeap(0x5000n, 0x5000);
	const registry = createNativeHostImportRegistry();
	registerNativeLibcStringHandlers(registry);
	const registers = createAarch64Registers({ programCounter: START });
	registers.write(0, writeBytes(heap, sourceBytes));
	registers.write(1, writeBytes(heap, rejectBytes));
	registers.write(2, SENTINEL);
	registers.write(30, RETURN);
	return { heap, registers, registry };
}

function invoke(fixture) {
	return fixture.registry.handle({ name: "strcspn" }, {
		memory: fixture.heap,
		registers: fixture.registers
	});
}

function writeBytes(heap, bytes) {
	const pointer = heap.allocate(BigInt(bytes.length));
	heap.write(pointer, bytes);
	return pointer;
}

function textBytes(value) {
	return new TextEncoder().encode(`${value}\0`);
}
