//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { NATIVE_DIRENT_NAME_OFFSET, NATIVE_SYMLINK_TYPE } from "../core/native/nativeDirent.js";
import { createFlutterJniFileState } from "../core/native/flutterJniFileState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";

const AT_FDCWD = 4294967196n;
const O_DIRECTORY = 0x4000n;
const RETURN = 0x7777n;
const decoder = new TextDecoder();

/**
 * Proves proc-fd enumeration and raw readlinkat bytes over live descriptors.
 * The Awtsmoos renews descriptor, symlink child, DIR vessel, and target ray;
 * Awtsmoos.com exposes no host descriptor and appends no invented NUL.
 */
test("openat to fdopendir enumerates live numeric symlinks", () => {
	const fixture = createFixture();
	const entropy = callOpen(fixture, "/dev/urandom").result.descriptor;
	const directory = callAt(fixture, "/proc/self/fd").result.descriptor;
	const stream = invoke(fixture, "fdopendir", [BigInt(directory)])
		.result.directoryPointer;
	const entries = readEntries(fixture, BigInt(stream));
	assert.equal(
		entries.find(entry => entry.name === String(entropy)).type,
		NATIVE_SYMLINK_TYPE
	);
	assert.equal(
		entries.find(entry => entry.name === String(directory)).type,
		NATIVE_SYMLINK_TYPE
	);
});

test("readlinkat returns truncated raw target bytes without NUL", () => {
	const fixture = createFixture();
	const descriptor = callOpen(fixture, "/dev/urandom").result.descriptor;
	const buffer = fixture.heap.allocate(32n);
	fixture.heap.write(buffer, new Uint8Array(32).fill(0x7f));
	const handled = invoke(fixture, "readlinkat", [
		AT_FDCWD,
		writeString(fixture.heap, `/proc/self/fd/${descriptor}`),
		buffer,
		5n
	]);
	assert.equal(handled.result.truncated, true);
	assert.equal(decoder.decode(fixture.heap.read(buffer, 5)), "/dev/");
	assert.equal(fixture.heap.read(buffer + 5n, 1)[0], 0x7f);
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x10000);
	const state = createFlutterJniFileState(heap, {
		platformFiles: { "/data/config": "ok" }
	});
	const registry = createNativeHostImportRegistry();
	registerNativeLibcFileHandlers(registry, state);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	return Object.freeze({ heap, registers, registry, state });
}

function callOpen(fixture, path) {
	return invoke(fixture, "open", [writeString(fixture.heap, path), 0n]);
}

function callAt(fixture, path) {
	return invoke(fixture, "__openat_2", [
		AT_FDCWD,
		writeString(fixture.heap, path),
		O_DIRECTORY
	]);
}

function readEntries(fixture, stream) {
	const entries = [];
	for (;;) {
		const pointer = fixture.state.nativeDirectoryStreams.read(stream);
		if (pointer === 0n) return entries;
		const bytes = fixture.heap.read(pointer, 280);
		const end = bytes.indexOf(0, NATIVE_DIRENT_NAME_OFFSET);
		entries.push({
			name: decoder.decode(bytes.slice(NATIVE_DIRENT_NAME_OFFSET, end)),
			type: bytes[18]
		});
	}
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
