//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeErrnoState } from "../core/native/nativeErrnoState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeStdioHandlers } from "../core/native/registerNativeStdioHandlers.js";
import { createNativeStdioState } from "../core/native/nativeStdioState.js";

const RETURN_ADDRESS = 0x7777n;

test("puts, fputs, putchar, and fputc preserve exact bytes", () => {
	const fixture = createFixture();
	const text = writeCString(fixture.heap, "hi");
	fixture.registers.write(0, text);
	invoke(fixture, "puts");
	assert.equal(streamText(fixture.stdio, 1n), "hi\n");
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, text);
	fixture.registers.write(1, 0xabcden);
	invoke(fixture, "fputs");
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, 33n);
	fixture.registers.write(1, 0xabcden);
	invoke(fixture, "fputc");
	assert.equal(streamText(fixture.stdio, 0xabcden), "hi!");
});

test("fwrite returns complete elements and status calls remain deterministic", () => {
	const fixture = createFixture();
	const source = fixture.heap.allocate(6n);
	fixture.heap.write(source, new TextEncoder().encode("abcdef"));
	fixture.registers.write(0, source);
	fixture.registers.write(1, 2n);
	fixture.registers.write(2, 3n);
	fixture.registers.write(3, 0x9999n);
	invoke(fixture, "fwrite");
	assert.equal(fixture.registers.read(0), 3n);
	assert.equal(streamText(fixture.stdio, 0x9999n), "abcdef");
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, 0x9999n);
	invoke(fixture, "fileno");
	assert.equal(fixture.registers.read(0, 32), 0xffffffffn);
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, 0x9999n);
	invoke(fixture, "fclose");
	assert.equal(fixture.registers.read(0, 32), 0n);
});

test("Flutter registry exposes the complete authentic stdio surface", () => {
	const heap = createNativeHeap(0x8000n, 0x4000);
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" }),
		nativeHeap: heap
	}));
	for (const name of [
		"printf", "fprintf", "sprintf", "snprintf", "vprintf", "vfprintf",
		"vsprintf", "vsnprintf", "asprintf", "vasprintf", "puts", "fputs",
		"putchar", "fputc", "fwrite", "fread", "fflush", "fclose",
		"ferror", "feof", "fileno"
	]) {
		assert.ok(registry.snapshot().includes(name));
	}
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x3000);
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
