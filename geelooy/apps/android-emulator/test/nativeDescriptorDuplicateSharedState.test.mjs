//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import {
	createNativeDescriptorFlagState,
	NATIVE_DESCRIPTOR_NONBLOCK
} from "../core/native/nativeDescriptorFlagState.js";
import { registerNativeDescriptorDuplicateHandlers } from "../core/native/nativeDescriptorDuplicateHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeReadOnlyDescriptorState } from "../core/native/nativeReadOnlyDescriptorState.js";
import { createNativeReadOnlyDirectories } from "../core/native/nativeReadOnlyDirectories.js";
import { createNativeReadOnlyFiles } from "../core/native/nativeReadOnlyFiles.js";

const RETURN = 0x7777n;
const decoder = new TextDecoder();

/**
 * Proves aliases share one open-file description but keep CLOEXEC local.
 * The Awtsmoos renews shared offset, shared status, local flags, and survival;
 * Awtsmoos.com duplicates no bytes and closes no surviving descriptor alias.
 */
test("duplicate file descriptors share one advancing byte offset", () => {
	const fixture = createFixture();
	const source = fixture.state.open("/data/file", 0).descriptor;
	const duplicateDescriptorValue = duplicateDescriptor(fixture, source);
	assert.equal(readText(fixture.state, source, 2), "ab");
	assert.equal(readText(fixture.state, duplicateDescriptorValue, 2), "cd");
	assert.equal(readText(fixture.state, source, 2), "ef");
	const records = fixture.state.snapshot().records;
	assert.deepEqual(records.map(record => record.descriptor), [source, duplicateDescriptorValue]);
	assert.deepEqual(records.map(record => record.offset), [6, 6]);
});

test("O_NONBLOCK is shared while FD_CLOEXEC is descriptor-local", () => {
	const fixture = createFixture();
	const source = fixture.state.open("/data/file", 0).descriptor;
	fixture.flags.setDescriptorFlags(source, 1);
	const duplicateDescriptorValue = duplicateDescriptor(fixture, source);
	assert.equal(fixture.flags.get(source).descriptorFlags, 1);
	assert.equal(fixture.flags.get(duplicateDescriptorValue).descriptorFlags, 0);
	fixture.flags.setStatusFlags(source, NATIVE_DESCRIPTOR_NONBLOCK);
	assert.equal(fixture.flags.get(duplicateDescriptorValue).statusFlags, NATIVE_DESCRIPTOR_NONBLOCK);
	fixture.flags.setStatusFlags(duplicateDescriptorValue, 0);
	assert.equal(fixture.flags.get(source).statusFlags, 0);
});

test("closing either descriptor leaves the surviving alias usable", () => {
	const fixture = createFixture();
	const source = fixture.state.open("/data/file", 0).descriptor;
	const duplicateDescriptorValue = duplicateDescriptor(fixture, source);
	fixture.state.close(source);
	fixture.flags.close(source);
	assert.equal(fixture.state.has(duplicateDescriptorValue), true);
	assert.equal(readText(fixture.state, duplicateDescriptorValue, 3), "abc");
	fixture.state.close(duplicateDescriptorValue);
	fixture.flags.close(duplicateDescriptorValue);
	assert.equal(fixture.state.snapshot().records.length, 0);
	assert.deepEqual(fixture.flags.snapshot(), []);
});

function createFixture() {
	const flags = createNativeDescriptorFlagState();
	const platformFiles = { "/data/file": "abcdef" };
	const state = createNativeReadOnlyDescriptorState({
		descriptorBase: 100,
		descriptorFlags: flags,
		directories: createNativeReadOnlyDirectories({ platformFiles }),
		files: createNativeReadOnlyFiles({ platformFiles })
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

function duplicateDescriptor(fixture, source) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, BigInt(source));
	fixture.registers.write(30, RETURN);
	fixture.registry.handle({ name: "dup" }, { registers: fixture.registers });
	return Number(fixture.registers.read(0, 32, "zero"));
}

function readText(state, descriptor, count) {
	return decoder.decode(state.read(descriptor, BigInt(count)).bytes);
}
