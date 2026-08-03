//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidFilesystem } from "../core/android/filesystem.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniFileState } from "../core/native/flutterJniFileState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";

const O_DIRECTORY = 0x4000n;
const RETURN = 0x7777n;

/**
 * Proves mkdir/mkdirat ABI resolution, mutation, failures, and registration.
 * The Awtsmoos renews dirfd, child, permissions, errno, and returning shore;
 * Awtsmoos.com creates no host path and leaves no failed partial directory.
 */
test("authentic relative mkdirat creates flutter_engine with mode 0700", () => {
	const fixture = createFixture();
	const parentFd = openDirectory(fixture, fixture.parent);
	const childName = "flutter_engine";
	const handled = mkdirAt(fixture, parentFd, childName, 0o700n);
	const child = `${fixture.parent}/${childName}`;
	assert.equal(handled.result.created, true);
	assert.equal(handled.result.path, child);
	assert.equal(handled.result.mode, 0o700);
	assert.equal(fixture.filesystem.isDirectory(child), true);
	assert.equal(fixture.registers.read(0, 32, "zero"), 0n);
	assert.equal(fixture.registers.pc, RETURN);
	assert.equal(mkdirAt(fixture, parentFd, childName, 0o700n).result.reason, "exists");
});

test("absolute mkdirat ignores dirfd and mkdir resolves guest absolute path", () => {
	const fixture = createFixture();
	const absolute = `${fixture.filesystem.root}/absolute`;
	assert.equal(mkdirAt(fixture, 999, absolute, 0o755n).result.created, true);
	const direct = `${fixture.filesystem.root}/direct`;
	assert.equal(invoke(fixture, "mkdir", [
		writeString(fixture.heap, direct),
		0o711n
	]).result.created, true);
	assert.equal(fixture.filesystem.isDirectory(absolute), true);
	assert.equal(fixture.filesystem.isDirectory(direct), true);
});

test("bad dirfd, pointer, missing parent, and file parent fail", () => {
	const fixture = createFixture();
	assert.equal(mkdirAt(fixture, 123, "child", 0o700n).result.reason, "bad-fd");
	assert.equal(invoke(fixture, "mkdir", [0n, 0o700n]).result.reason, "invalid-path");
	const missing = `${fixture.filesystem.root}/missing/child`;
	assert.equal(invoke(fixture, "mkdir", [
		writeString(fixture.heap, missing),
		0o700n
	]).result.reason, "not-found");
	const file = `${fixture.filesystem.root}/file`;
	fixture.filesystem.write(file, new Uint8Array([1]));
	assert.equal(invoke(fixture, "mkdir", [
		writeString(fixture.heap, `${file}/child`),
		0o700n
	]).result.reason, "not-directory");
	for (const name of ["mkdir", "mkdirat"]) {
		assert.equal(fixture.registry.snapshot().filter(item => item === name).length, 1);
	}
});

function createFixture() {
	const filesystem = createAndroidFilesystem("com.osfy.rebberesponsa.app");
	const parent = `${filesystem.root}/code_cache`;
	filesystem.mkdir(parent);
	const heap = createNativeHeap(0x5000n, 0x14000);
	const state = createFlutterJniFileState(heap, { packageFilesystem: filesystem });
	const registry = createNativeHostImportRegistry();
	registerNativeLibcFileHandlers(registry, state);
	return {
		filesystem,
		heap,
		parent,
		registry,
		registers: createAarch64Registers({ programCounter: 0x9000n })
	};
}

function mkdirAt(fixture, descriptor, path, mode) {
	return invoke(fixture, "mkdirat", [
		BigInt(descriptor),
		writeString(fixture.heap, path),
		mode
	]);
}

function openDirectory(fixture, path) {
	invoke(fixture, "open", [writeString(fixture.heap, path), O_DIRECTORY]);
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
