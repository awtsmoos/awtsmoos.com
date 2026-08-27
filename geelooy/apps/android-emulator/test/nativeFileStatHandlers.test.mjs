//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import {
	NATIVE_STAT_MODE_CHARACTER,
	NATIVE_STAT_MODE_DIRECTORY,
	NATIVE_STAT_MODE_FILE
} from "../core/native/nativeBionicStat.js";
import { createFlutterJniFileState } from "../core/native/flutterJniFileState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";

const RETURN = 0x7777n;
const O_DIRECTORY = 0x4000n;
const SENTINEL = 0x12345678n;

/**
 * Proves fstat/fstat64 over live directory, file, and entropy descriptors.
 * The Awtsmoos renews record, mode, size, device, failure, and return shore;
 * Awtsmoos.com reopens no path and changes no unrelated register testimony.
 */
test("authentic fstat describes the live directory descriptor", () => {
	const fixture = createFixture();
	const descriptor = open(fixture, "/data", O_DIRECTORY);
	const buffer = fixture.heap.allocate(128n);
	const handled = invoke(fixture, "fstat", [BigInt(descriptor), buffer]);
	assert.equal(handled.result.kind, "directory");
	assert.equal(readMode(fixture, buffer), NATIVE_STAT_MODE_DIRECTORY);
	assert.equal(readSize(fixture, buffer), 0n);
	assert.equal(fixture.registers.pc, RETURN);
});

test("fstat and fstat64 expose exact file and entropy metadata", () => {
	const fixture = createFixture();
	const file = open(fixture, "/data/config", 0n);
	const fileBuffer = fixture.heap.allocate(128n);
	invoke(fixture, "fstat64", [BigInt(file), fileBuffer]);
	assert.equal(readMode(fixture, fileBuffer), NATIVE_STAT_MODE_FILE);
	assert.equal(readSize(fixture, fileBuffer), 2n);
	const entropy = open(fixture, "/dev/urandom", 0n);
	const entropyBuffer = fixture.heap.allocate(128n);
	invoke(fixture, "fstat", [BigInt(entropy), entropyBuffer]);
	const view = statView(fixture, entropyBuffer);
	assert.equal(view.getUint32(16, true), NATIVE_STAT_MODE_CHARACTER);
	assert.equal(view.getBigUint64(32, true), 0x109n);
});

test("bad descriptors and invalid buffers preserve unrelated state", () => {
	const fixture = createFixture();
	fixture.registers.write(2, SENTINEL);
	const bad = invoke(fixture, "fstat", [999n, fixture.heap.allocate(128n)]);
	assert.equal(bad.result.reason, "bad-fd");
	const descriptor = open(fixture, "/data", O_DIRECTORY);
	fixture.registers.write(2, SENTINEL);
	const failed = invoke(fixture, "fstat", [BigInt(descriptor), 0n]);
	assert.equal(failed.result.reason, "invalid-buffer");
	assert.equal(fixture.registers.read(2), SENTINEL);
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x10000);
	const state = createFlutterJniFileState(heap, {
		platformFiles: { "/data/config": "ok" }
	});
	const registry = createNativeHostImportRegistry();
	registerNativeLibcFileHandlers(registry, state);
	return {
		heap,
		registry,
		registers: createAarch64Registers({ programCounter: 0x9000n }),
		state
	};
}

function open(fixture, path, flags) {
	invoke(fixture, "open", [writeString(fixture.heap, path), flags]);
	return Number(fixture.registers.read(0, 32, "zero"));
}

function invoke(fixture, name, values) {
	fixture.registers.pc = 0x9000n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN);
	return fixture.registry.handle({ name }, {
		memory: fixture.heap,
		registers: fixture.registers
	});
}

function writeString(heap, value) {
	const bytes = new TextEncoder().encode(`${value}\0`);
	const pointer = heap.allocate(BigInt(bytes.length));
	heap.write(pointer, bytes);
	return pointer;
}

function statView(fixture, pointer) {
	const bytes = fixture.heap.read(pointer, 128);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function readMode(fixture, pointer) {
	return statView(fixture, pointer).getUint32(16, true);
}

function readSize(fixture, pointer) {
	return statView(fixture, pointer).getBigInt64(48, true);
}
