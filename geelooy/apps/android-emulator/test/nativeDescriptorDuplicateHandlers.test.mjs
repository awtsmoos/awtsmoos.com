//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeDescriptorFlagState } from "../core/native/nativeDescriptorFlagState.js";
import { registerNativeDescriptorDuplicateHandlers } from "../core/native/nativeDescriptorDuplicateHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeReadOnlyDescriptorState } from "../core/native/nativeReadOnlyDescriptorState.js";
import { createNativeReadOnlyDirectories } from "../core/native/nativeReadOnlyDirectories.js";
import { createNativeReadOnlyFiles } from "../core/native/nativeReadOnlyFiles.js";

const RETURN = 0x7777n;

/**
 * Proves dup/dup2 allocation, replacement, no-op, failures, and ABI return.
 * The Awtsmoos renews source, lowest-free alias, exact target, and return shore;
 * Awtsmoos.com duplicates no host descriptor and destroys no target before truth.
 */
test("dup allocates the lowest free descriptor and returns through X30", () => {
	const fixture = createFixture();
	const source = fixture.state.open("/data/file", 0).descriptor;
	const handled = invoke(fixture, "dup", [BigInt(source)]);
	assert.equal(handled.result.source, source);
	assert.equal(handled.result.descriptor, source + 1);
	assert.equal(fixture.state.has(source + 1), true);
	assert.equal(fixture.registers.read(0, 32, "zero"), BigInt(source + 1));
	assert.equal(fixture.registers.pc, RETURN);
});

test("dup2 binds an exact target and replaces an occupied descriptor", () => {
	const fixture = createFixture();
	const source = fixture.state.open("/data/file", 0).descriptor;
	const occupied = fixture.state.open("/data/other", 0).descriptor;
	const handled = invoke(fixture, "dup2", [BigInt(source), BigInt(occupied)]);
	assert.equal(handled.result.descriptor, occupied);
	assert.equal(handled.result.replaced, occupied);
	assert.equal(fixture.state.metadata(occupied).path, "/data/file");
	assert.equal(fixture.flags.get(occupied).descriptorFlags, 0);
});

test("dup2 same descriptor succeeds without mutation", () => {
	const fixture = createFixture();
	const source = fixture.state.open("/data/file", 0).descriptor;
	fixture.flags.setDescriptorFlags(source, 1);
	const before = fixture.state.snapshot();
	const handled = invoke(fixture, "dup2", [BigInt(source), BigInt(source)]);
	assert.equal(handled.result.noOp, true);
	assert.deepEqual(fixture.state.snapshot(), before);
	assert.equal(fixture.flags.get(source).descriptorFlags, 1);
});

test("bad source and exhausted range fail deterministically", () => {
	const fixture = createFixture({ capacity: 1 });
	assert.equal(invoke(fixture, "dup", [999n]).result.reason, "bad-source");
	const source = fixture.state.open("/data/file", 0).descriptor;
	assert.equal(invoke(fixture, "dup", [BigInt(source)]).result.reason, "capacity");
	for (const name of ["dup", "dup2"]) {
		assert.equal(fixture.registry.snapshot().filter(item => item === name).length, 1);
	}
});

function createFixture(options = {}) {
	const flags = createNativeDescriptorFlagState();
	const files = createNativeReadOnlyFiles({
		platformFiles: { "/data/file": "abcdef", "/data/other": "xyz" }
	});
	const directories = createNativeReadOnlyDirectories({
		platformFiles: { "/data/file": "abcdef", "/data/other": "xyz" }
	});
	const state = createNativeReadOnlyDescriptorState({
		capacity: options.capacity,
		descriptorBase: 100,
		descriptorFlags: flags,
		directories,
		files
	});
	const registry = createNativeHostImportRegistry();
	registerNativeDescriptorDuplicateHandlers(registry, {
		descriptorFlags: flags,
		readOnlyState: state
	});
	return {
		flags,
		registry,
		registers: createAarch64Registers({ programCounter: 0x9000n }),
		state
	};
}

function invoke(fixture, name, values) {
	fixture.registers.pc = 0x9000n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN);
	return fixture.registry.handle({ name }, { registers: fixture.registers });
}
