//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeDynamicLibraryState } from "../core/native/nativeDynamicLibraryState.js";
import { registerNativeDynamicLinkerHandlers } from "../core/native/nativeDynamicLinkerHandlers.js";
import { createNativeDynamicLinkerState } from "../core/native/nativeDynamicLinkerState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

const RETURN_ADDRESS = 0x7777n;

test("authentic dlerror then dlopen libandroid RTLD_NOW crosses X30", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, "dlerror").result.pointer, "0");
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, writeCString(fixture.heap, "libandroid.so"));
	fixture.registers.write(1, 2n);
	const opened = invoke(fixture, "dlopen").result;
	assert.equal(opened.success, true);
	assert.notEqual(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("dlsym returns the shared trap and dlclose retires the handle", () => {
	const fixture = createFixture();
	const handle = fixture.libraries.open(0x1234n, "libandroid.so", 2n).handle;
	fixture.registers.write(0, handle);
	fixture.registers.write(1, writeCString(fixture.heap, "ALooper_prepare"));
	invoke(fixture, "dlsym");
	assert.equal(fixture.registers.read(0), fixture.imports.resolve("ALooper_prepare"));
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, handle);
	invoke(fixture, "dlclose");
	assert.equal(fixture.registers.read(0, 32), 0n);
});

test("invalid dlopen returns NULL and exposes its dlerror text", () => {
	const fixture = createFixture();
	fixture.registers.write(0, writeCString(fixture.heap, "libmissing.so"));
	fixture.registers.write(1, 2n);
	invoke(fixture, "dlopen");
	assert.equal(fixture.registers.read(0), 0n);
	fixture.registers.pc = 0x9000n;
	invoke(fixture, "dlerror");
	assert.notEqual(fixture.registers.read(0), 0n);
});

test("Flutter registry exposes the complete dl family with injected state", () => {
	const fixture = createFixture();
	const registry = createFlutterJniImportHandlers(Object.freeze({
		imports: fixture.imports,
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" }),
		nativeDynamicLibraries: fixture.libraries,
		nativeDynamicLinker: fixture.errors,
		nativeHeap: fixture.heap
	}));
	for (const name of ["dlopen", "dlsym", "dlclose", "dlerror"]) {
		assert.ok(registry.snapshot().includes(name));
	}
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x4000);
	const errors = createNativeDynamicLinkerState(heap);
	const imports = createNativeImportAddressSpace({ base: 0x9000n });
	imports.resolve("existing", { neededLibraries: ["libandroid.so"] });
	const libraries = createNativeDynamicLibraryState({ errors, imports });
	const registry = createNativeHostImportRegistry();
	registerNativeDynamicLinkerHandlers(registry, { errors, libraries });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, RETURN_ADDRESS);
	const systemRegisters = Object.freeze({ read: () => 0x1234n });
	return Object.freeze({ errors, heap, imports, libraries, registers, registry, systemRegisters });
}

function invoke(fixture, name) {
	return fixture.registry.handle({ name }, {
		memory: fixture.heap,
		registers: fixture.registers,
		systemRegisters: fixture.systemRegisters
	});
}

function writeCString(heap, text) {
	const bytes = new TextEncoder().encode(`${text}\0`);
	const pointer = heap.allocate(BigInt(bytes.length));
	heap.write(pointer, bytes);
	return pointer;
}
