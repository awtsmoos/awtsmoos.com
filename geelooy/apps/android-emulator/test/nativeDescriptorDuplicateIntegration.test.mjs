//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidFilesystem } from "../core/android/filesystem.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerNativeDescriptorDuplicateHandlers } from "../core/native/nativeDescriptorDuplicateHandlers.js";
import { handleNativeDescriptorClose } from "../core/native/nativeDescriptorWriteCloseHandlers.js";
import { createFlutterJniFileState } from "../core/native/flutterJniFileState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";

const O_DIRECTORY = 0x4000n;
const RETURN = 0x7777n;
const decoder = new TextDecoder();

/**
 * Proves a duplicated directory survives close and owns one final DIR lifecycle.
 * The Awtsmoos renews alias, stat, proc link, stream, closure, and cleanup shore;
 * Awtsmoos.com leaves no leaked record after the final descriptor vessel closes.
 */
test("duplicated directory survives original close and transfers to fdopendir", () => {
	const fixture = createFixture();
	const source = openDirectory(fixture, fixture.child);
	const duplicate = duplicateDescriptor(fixture, source);
	invoke(fixture, "close", [BigInt(source)]);
	assert.equal(fixture.registers.read(0, 32, "zero"), 0n);
	assert.equal(fixture.state.nativeReadOnlyDescriptors.has(source), false);
	assert.equal(fixture.state.nativeDescriptorFlags.get(source), null);
	const statBuffer = fixture.heap.allocate(128n);
	assert.equal(invoke(fixture, "fstat", [BigInt(duplicate), statBuffer]).result.kind, "directory");
	assert.equal(readMode(fixture, statBuffer), 0o040700);
	assert.equal(readLink(fixture, duplicate), fixture.child);
	const opened = invoke(fixture, "fdopendir", [BigInt(duplicate)]);
	const stream = BigInt(opened.result.directoryPointer);
	assert.equal(opened.result.opened, true);
	assert.equal(invoke(fixture, "readdir", [stream]).result.entryPointer, "0");
	assert.equal(invoke(fixture, "closedir", [stream]).result.result, 0);
	assert.equal(fixture.state.nativeReadOnlyDescriptors.has(duplicate), false);
	assert.equal(fixture.state.nativeDescriptorFlags.get(duplicate), null);
	assert.deepEqual(fixture.state.nativeReadOnlyDescriptors.snapshot().records, []);
});

function createFixture() {
	const filesystem = createAndroidFilesystem("com.osfy.rebberesponsa.app");
	const parent = `${filesystem.root}/code_cache`;
	filesystem.mkdir(parent);
	const heap = createNativeHeap(0x5000n, 0x18000);
	const state = createFlutterJniFileState(heap, { packageFilesystem: filesystem });
	const child = `${parent}/flutter_engine`;
	assert.equal(state.nativeDirectories.create(child, 0o700).ok, true);
	const registry = createNativeHostImportRegistry();
	registerNativeLibcFileHandlers(registry, state);
	registerNativeDescriptorDuplicateHandlers(registry, {
		descriptorFlags: state.nativeDescriptorFlags,
		readOnlyState: state.nativeReadOnlyDescriptors
	});
	registry.register("close", context => handleNativeDescriptorClose(context, {
		descriptorFlags: state.nativeDescriptorFlags,
		readOnlyState: state.nativeReadOnlyDescriptors
	}));
	return {
		child,
		heap,
		registry,
		registers: createAarch64Registers({ programCounter: 0x9000n }),
		state
	};
}

function openDirectory(fixture, path) {
	invoke(fixture, "open", [writeString(fixture.heap, path), O_DIRECTORY]);
	return Number(fixture.registers.read(0, 32, "zero"));
}

function duplicateDescriptor(fixture, source) {
	invoke(fixture, "dup", [BigInt(source)]);
	return Number(fixture.registers.read(0, 32, "zero"));
}

function readLink(fixture, descriptor) {
	const path = `/proc/self/fd/${descriptor}`;
	const buffer = fixture.heap.allocate(256n);
	const handled = invoke(fixture, "readlink", [
		writeString(fixture.heap, path),
		buffer,
		256n
	]);
	return decoder.decode(fixture.heap.read(buffer, handled.result.transferred));
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
