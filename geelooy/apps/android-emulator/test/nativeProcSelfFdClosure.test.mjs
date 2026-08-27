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
const O_DIRECTORY = 0x4000n;
const RETURN = 0x7777n;

/**
 * Proves fdopendir ownership, direct opendir compatibility, and proc closure.
 * The Awtsmoos renews stream, integer descriptor, shared flags, and absence;
 * Awtsmoos.com leaves no leaked record after the directory vessel closes.
 */
test("closedir closes its owned descriptor and shared flags", () => {
	const fixture = createFixture();
	const descriptor = callAt(fixture, "/proc/self/fd").result.descriptor;
	const stream = BigInt(invoke(
		fixture,
		"fdopendir",
		[BigInt(descriptor)]
	).result.directoryPointer);
	assert.equal(fixture.state.nativeReadOnlyDescriptors.has(descriptor), true);
	assert.notEqual(fixture.state.nativeDescriptorFlags.get(descriptor), null);
	assert.equal(invoke(fixture, "closedir", [stream]).result.result, 0);
	assert.equal(fixture.state.nativeReadOnlyDescriptors.has(descriptor), false);
	assert.equal(fixture.state.nativeDescriptorFlags.get(descriptor), null);
});

test("direct opendir works and closed descriptors leave proc scans", () => {
	const fixture = createFixture();
	const descriptor = callOpen(fixture, "/dev/urandom").result.descriptor;
	const direct = BigInt(invoke(
		fixture,
		"opendir",
		[writeString(fixture.heap, "/data")]
	).result.directoryPointer);
	assert.notEqual(direct, 0n);
	assert.equal(invoke(fixture, "closedir", [direct]).result.result, 0);
	fixture.state.nativeReadOnlyDescriptors.close(descriptor);
	fixture.state.nativeDescriptorFlags.close(descriptor);
	const names = fixture.state.nativeDirectories.entries("/proc/self/fd")
		.map(entry => entry.name);
	assert.equal(names.includes(String(descriptor)), false);
	assert.equal(invoke(fixture, "fdopendir", [999n]).result.opened, false);
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
