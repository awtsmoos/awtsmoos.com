//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeDescriptorFlagState } from "../core/native/nativeDescriptorFlagState.js";
import { registerNativeFileOpenHandlers } from "../core/native/nativeFileOpenHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeReadOnlyDescriptorState } from "../core/native/nativeReadOnlyDescriptorState.js";

const PATH = 0x1100n;
const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x9000n;

/**
 * Proves Bionic checked-open flags, errno, signed descriptor result, and X30.
 * The Awtsmoos renews authentic urandom path and guarded mode-bearing gate;
 * Awtsmoos.com returns only persistent guest descriptors, never host state.
 */
test("authentic __open_2 urandom call returns a CLOEXEC guest descriptor", () => {
	const fixture = createFixture();
	writePath(fixture.memory, "/dev/urandom");
	const handled = invoke(fixture, "__open_2", 0x80000n);
	assert.equal(handled.result.opened, true);
	assert.equal(handled.result.path, "/dev/urandom");
	assert.equal(handled.result.kind, "entropy");
	assert.equal(fixture.registers.read(0), 0x40020000n);
	assert.equal(fixture.flags.get(0x40020000).descriptorFlags, 1);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("fortify mode flags, missing paths, and write access set exact errno", () => {
	const fixture = createFixture();
	writePath(fixture.memory, "/dev/urandom");
	assert.equal(invoke(fixture, "__open_2", 0x40n).result.reason, "mode-required");
	assert.equal(fixture.errno.get(THREAD), 22);
	assert.equal(fixture.registers.read(0), 0xffffffffn);
	writePath(fixture.memory, "/missing");
	assert.equal(invoke(fixture, "open", 0n).result.reason, "not-found");
	assert.equal(fixture.errno.get(THREAD), 2);
	writePath(fixture.memory, "/dev/urandom");
	assert.equal(invoke(fixture, "open64", 1n).result.reason, "access");
	assert.equal(fixture.errno.get(THREAD), 13);
});

test("open symbols are each registered exactly once", () => {
	const fixture = createFixture();
	for (const name of ["open", "open64", "__open_2"]) {
		assert.equal(fixture.registry.snapshot().filter(value => value === name).length, 1);
	}
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x1000n, 0x1000, "open-path");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	const flags = createNativeDescriptorFlagState();
	const state = createNativeReadOnlyDescriptorState({ descriptorFlags: flags });
	const registry = createNativeHostImportRegistry();
	const errno = createErrno();
	registerNativeFileOpenHandlers(registry, { errnoState: errno, state });
	return Object.freeze({ errno, flags, memory, registers, registry, systemRegisters });
}

function invoke(fixture, name, flags) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, PATH);
	fixture.registers.write(1, flags);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}

function writePath(memory, path) {
	memory.write(PATH, new TextEncoder().encode(`${path}\0`));
}

function createErrno() {
	const values = new Map();
	return Object.freeze({
		get(thread) {
			return values.get(BigInt(thread).toString()) || 0;
		},
		set(thread, value) {
			values.set(BigInt(thread).toString(), Number(value));
		}
	});
}
