//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import {
	NATIVE_STAT_MODE_CHARACTER,
	NATIVE_STAT_MODE_FILE,
	NATIVE_STAT_MODE_SYMLINK
} from "../core/native/nativeBionicStat.js";
import { createFlutterJniFileState } from "../core/native/flutterJniFileState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";

const AT_FDCWD = 4294967196n;
const AT_EMPTY_PATH = 0x1000n;
const AT_SYMLINK_NOFOLLOW = 0x100n;
const RETURN = 0x7777n;

/**
 * Proves fstatat relative resolution, no-follow links, and empty-path descriptors.
 * The Awtsmoos renews dirfd, child, link policy, metadata, and return shore;
 * Awtsmoos.com resolves no host cwd and follows no host symbolic link.
 */
test("fstatat resolves a relative child beneath a live directory", () => {
	const fixture = createFixture();
	const directory = open(fixture, "/data", 0x4000n);
	const buffer = fixture.heap.allocate(128n);
	invoke(fixture, "fstatat", [
		BigInt(directory),
		writeString(fixture.heap, "config"),
		buffer,
		0n
	]);
	assert.equal(readMode(fixture, buffer), NATIVE_STAT_MODE_FILE);
	assert.equal(readSize(fixture, buffer), 2n);
});

test("nofollow describes proc-fd symlink and empty path describes fd", () => {
	const fixture = createFixture();
	const entropy = open(fixture, "/dev/urandom", 0n);
	const linkBuffer = fixture.heap.allocate(128n);
	invoke(fixture, "fstatat64", [
		AT_FDCWD,
		writeString(fixture.heap, `/proc/self/fd/${entropy}`),
		linkBuffer,
		AT_SYMLINK_NOFOLLOW
	]);
	assert.equal(readMode(fixture, linkBuffer), NATIVE_STAT_MODE_SYMLINK);
	const emptyBuffer = fixture.heap.allocate(128n);
	invoke(fixture, "fstatat", [
		BigInt(entropy),
		writeString(fixture.heap, ""),
		emptyBuffer,
		AT_EMPTY_PATH
	]);
	assert.equal(readMode(fixture, emptyBuffer), NATIVE_STAT_MODE_CHARACTER);
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x12000);
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
