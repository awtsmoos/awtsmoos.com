//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import {
	NATIVE_STAT_MODE_CHARACTER,
	NATIVE_STAT_MODE_SYMLINK
} from "../core/native/nativeBionicStat.js";
import { createFlutterJniFileState } from "../core/native/flutterJniFileState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";

const RETURN = 0x7777n;

/**
 * Proves stat/lstat proc-link policy, path errors, aliases, and registration.
 * The Awtsmoos renews path, target, link vessel, mode, errno, and return shore;
 * Awtsmoos.com follows no host link and reads no host filesystem testimony.
 */
test("stat follows proc-fd links while lstat describes the symlink", () => {
	const fixture = createFixture();
	const descriptor = open(fixture, "/dev/urandom");
	const path = `/proc/self/fd/${descriptor}`;
	const followed = statPath(fixture, "stat", path);
	assert.equal(readMode(fixture, followed), NATIVE_STAT_MODE_CHARACTER);
	const link = statPath(fixture, "lstat64", path);
	assert.equal(readMode(fixture, link), NATIVE_STAT_MODE_SYMLINK);
	assert.equal(
		readSize(fixture, link),
		BigInt(new TextEncoder().encode("/dev/urandom").length)
	);
});

test("path errors fail and all aliases register exactly once", () => {
	const fixture = createFixture();
	const buffer = fixture.heap.allocate(128n);
	const missing = invoke(fixture, "stat64", [
		writeString(fixture.heap, "/missing"),
		buffer
	]);
	assert.equal(missing.result.reason, "not-found");
	for (const name of [
		"fstat", "fstat64", "stat", "stat64",
		"lstat", "lstat64", "fstatat", "fstatat64"
	]) {
		assert.equal(fixture.registry.snapshot().filter(item => item === name).length, 1);
	}
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
		registers: createAarch64Registers({ programCounter: 0x9000n })
	};
}

function open(fixture, path) {
	invoke(fixture, "open", [writeString(fixture.heap, path), 0n]);
	return Number(fixture.registers.read(0, 32, "zero"));
}

function statPath(fixture, name, path) {
	const buffer = fixture.heap.allocate(128n);
	invoke(fixture, name, [writeString(fixture.heap, path), buffer]);
	return buffer;
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
