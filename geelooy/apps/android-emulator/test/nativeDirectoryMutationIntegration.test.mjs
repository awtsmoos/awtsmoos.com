//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidFilesystem } from "../core/android/filesystem.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { NATIVE_DIRENT_NAME_OFFSET } from "../core/native/nativeDirent.js";
import { createFlutterJniFileState } from "../core/native/flutterJniFileState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";

const O_DIRECTORY = 0x4000n;
const RETURN = 0x7777n;
const decoder = new TextDecoder();

/**
 * Proves creation becomes visible to access, open, stat, and directory streams.
 * The Awtsmoos renews absence, child, descriptor, mode, permission, and dirent;
 * Awtsmoos.com makes every filesystem surface witness the same guest mutation.
 */
test("mkdirat creates one fully integrated mode-0700 directory", () => {
	const fixture = createFixture();
	const parentFd = openAt(fixture, fixture.parent, O_DIRECTORY);
	const childName = "flutter_engine";
	const child = `${fixture.parent}/${childName}`;
	assert.equal(invoke(fixture, "faccessat", [
		BigInt(parentFd),
		writeString(fixture.heap, childName),
		0n,
		0n
	]).result.reason, "not-found");
	assert.equal(invoke(fixture, "mkdirat", [
		BigInt(parentFd),
		writeString(fixture.heap, childName),
		0o700n
	]).result.created, true);
	const childFd = openAt(fixture, child, O_DIRECTORY);
	assert.notEqual(childFd, 0xffffffff);
	const fstatBuffer = fixture.heap.allocate(128n);
	invoke(fixture, "fstat", [BigInt(childFd), fstatBuffer]);
	assert.equal(readMode(fixture, fstatBuffer), 0o040700);
	const atBuffer = fixture.heap.allocate(128n);
	invoke(fixture, "fstatat", [
		BigInt(parentFd),
		writeString(fixture.heap, childName),
		atBuffer,
		0n
	]);
	assert.equal(readMode(fixture, atBuffer), 0o040700);
	assert.equal(invoke(fixture, "access", [
		writeString(fixture.heap, child),
		7n
	]).result.granted, true);
	assert.equal(readDirectoryNames(fixture, fixture.parent).includes(childName), true);
});

function createFixture() {
	const filesystem = createAndroidFilesystem("com.osfy.rebberesponsa.app");
	const parent = `${filesystem.root}/code_cache`;
	filesystem.mkdir(parent);
	const heap = createNativeHeap(0x5000n, 0x18000);
	const state = createFlutterJniFileState(heap, { packageFilesystem: filesystem });
	const registry = createNativeHostImportRegistry();
	registerNativeLibcFileHandlers(registry, state);
	return {
		heap,
		parent,
		registry,
		registers: createAarch64Registers({ programCounter: 0x9000n })
	};
}

function openAt(fixture, path, flags) {
	invoke(fixture, "open", [writeString(fixture.heap, path), flags]);
	return Number(fixture.registers.read(0, 32, "zero"));
}

function readDirectoryNames(fixture, path) {
	const opened = invoke(fixture, "opendir", [writeString(fixture.heap, path)]);
	const stream = BigInt(opened.result.directoryPointer);
	const names = [];
	for (;;) {
		invoke(fixture, "readdir", [stream]);
		const pointer = fixture.registers.read(0, 64, "zero");
		if (pointer === 0n) break;
		const bytes = fixture.heap.read(pointer, 280);
		const end = bytes.indexOf(0, NATIVE_DIRENT_NAME_OFFSET);
		names.push(decoder.decode(bytes.slice(NATIVE_DIRENT_NAME_OFFSET, end)));
	}
	invoke(fixture, "closedir", [stream]);
	return names;
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

function readMode(fixture, pointer) {
	const bytes = fixture.heap.read(pointer, 128);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
		.getUint32(16, true);
}
