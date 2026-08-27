//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniFileState } from "../core/native/flutterJniFileState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";

const AT_FDCWD = 4294967196n;
const O_CREAT = 0x40n;
const O_DIRECTORY = 0x4000n;
const O_CLOEXEC = 0x80000n;
const RETURN = 0x7777n;

/**
 * Proves fortified openat path, directory, flags, and error behavior.
 * The Awtsmoos renews dirfd, path, descriptor, kind, errno, and return shore;
 * Awtsmoos.com resolves no host cwd and opens only explicit guest testimony.
 */
test("authentic __openat_2 opens /proc/self/fd as a shared directory", () => {
	const fixture = createFixture();
	const handled = callAt(fixture, "__openat_2", AT_FDCWD, "/proc/self/fd", O_DIRECTORY);
	const descriptor = Number(fixture.registers.read(0, 32, "zero"));
	assert.equal(handled.result.kind, "directory");
	assert.equal(handled.result.path, "/proc/self/fd");
	assert.equal(fixture.state.nativeReadOnlyDescriptors.has(descriptor), true);
	assert.equal(fixture.state.nativeReadOnlyDescriptors.directoryPath(descriptor), "/proc/self/fd");
	assert.equal(fixture.registers.pc, RETURN);
});

test("absolute openat ignores bad dirfd and relative openat requires a directory", () => {
	const fixture = createFixture();
	const absolute = callAt(fixture, "openat", 99n, "/data/config", 0n);
	assert.equal(absolute.result.opened, true);
	const directory = callOpen(fixture, "/data", O_DIRECTORY);
	const directoryFd = BigInt(directory.result.descriptor);
	const relative = callAt(fixture, "openat64", directoryFd, "config", 0n);
	assert.equal(relative.result.opened, true);
	assert.equal(relative.result.path, "/data/config");
	const failed = callAt(fixture, "openat", 123n, "config", 0n);
	assert.equal(failed.result.reason, "bad-fd");
	assert.equal(fixture.registers.read(0, 32, "zero"), 0xffffffffn);
});

test("O_DIRECTORY rejects files and fortified mode-requiring flags", () => {
	const fixture = createFixture();
	const file = callAt(fixture, "openat", AT_FDCWD, "/data/config", O_DIRECTORY);
	assert.equal(file.result.reason, "not-directory");
	const fortified = callAt(fixture, "__openat_2", AT_FDCWD, "/data/config", O_CREAT);
	assert.equal(fortified.result.reason, "mode-required");
});

test("O_CLOEXEC metadata and open symbol registration remain exact", () => {
	const fixture = createFixture();
	const handled = callAt(
		fixture,
		"openat",
		AT_FDCWD,
		"/proc/self/fd",
		O_DIRECTORY | O_CLOEXEC
	);
	const flags = fixture.state.nativeDescriptorFlags.get(handled.result.descriptor);
	assert.equal(flags.descriptorFlags, 1);
	for (const name of ["open", "open64", "__open_2", "openat", "openat64", "__openat_2"]) {
		assert.equal(fixture.registry.snapshot().filter(item => item === name).length, 1);
	}
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x8000);
	const state = createFlutterJniFileState(heap, {
		platformFiles: { "/data/config": "ok" }
	});
	const registry = createNativeHostImportRegistry();
	registerNativeLibcFileHandlers(registry, state);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	return Object.freeze({ heap, registers, registry, state });
}

function callAt(fixture, name, directory, path, flags) {
	return invoke(fixture, name, [directory, writeString(fixture.heap, path), flags]);
}

function callOpen(fixture, path, flags) {
	return invoke(fixture, "open", [writeString(fixture.heap, path), flags]);
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
