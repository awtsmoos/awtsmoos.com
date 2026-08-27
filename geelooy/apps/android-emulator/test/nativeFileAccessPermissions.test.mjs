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
const AT_SYMLINK_NOFOLLOW = 0x100n;
const AT_EACCESS = 0x200n;
const R_OK = 4n;
const W_OK = 2n;
const X_OK = 1n;
const RETURN = 0x7777n;

/**
 * Proves permission checks derive solely from frozen guest stat modes.
 * The Awtsmoos renews file, directory, device, symlink, and combined request;
 * Awtsmoos.com consults no host identity and grants only every requested bit.
 */
test("regular files allow read but deny write, execute, and combined read-write", () => {
	const fixture = createFixture();
	assert.equal(access(fixture, "/data/config", R_OK).result.granted, true);
	assert.equal(access(fixture, "/data/config", W_OK).result.reason, "permission-denied");
	assert.equal(access(fixture, "/data/config", X_OK).result.reason, "permission-denied");
	assert.equal(access(fixture, "/data/config", R_OK | W_OK).result.reason, "permission-denied");
});

test("directories allow read and execute but deny write", () => {
	const fixture = createFixture();
	assert.equal(access(fixture, "/data", R_OK | X_OK).result.granted, true);
	assert.equal(access(fixture, "/data", W_OK).result.reason, "permission-denied");
});

test("entropy devices allow read and write but deny execute", () => {
	const fixture = createFixture();
	assert.equal(access(fixture, "/dev/urandom", R_OK | W_OK).result.granted, true);
	assert.equal(access(fixture, "/dev/urandom", X_OK).result.reason, "permission-denied");
});

test("proc-fd links follow targets unless NOFOLLOW and accept EACCESS", () => {
	const fixture = createFixture();
	const descriptor = open(fixture, "/dev/urandom");
	const path = `/proc/self/fd/${descriptor}`;
	assert.equal(faccess(fixture, path, R_OK | W_OK, 0n).result.kind, "entropy");
	assert.equal(faccess(fixture, path, X_OK, 0n).result.reason, "permission-denied");
	const link = faccess(
		fixture,
		path,
		R_OK | W_OK | X_OK,
		AT_SYMLINK_NOFOLLOW | AT_EACCESS
	);
	assert.equal(link.result.kind, "symlink");
	assert.equal(link.result.effectiveAccess, true);
	assert.equal(link.result.granted, true);
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

function open(fixture, path) {
	invoke(fixture, "open", [writeString(fixture.heap, path), 0n]);
	return Number(fixture.registers.read(0, 32, "zero"));
}

function access(fixture, path, mode) {
	return invoke(fixture, "access", [writeString(fixture.heap, path), mode]);
}

function faccess(fixture, path, mode, flags) {
	return invoke(fixture, "faccessat", [
		AT_FDCWD,
		writeString(fixture.heap, path),
		mode,
		flags
	]);
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
