//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeErrnoState } from "../core/native/nativeErrnoState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLocaleHandlers } from "../core/native/nativeLocaleHandlers.js";
import { createNativeLocaleState } from "../core/native/nativeLocaleState.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x1111n;

test("authentic mbtowc null source resets without reading memory", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0n);
	fixture.registers.write(1, 0n);
	fixture.registers.write(2, 4n);
	const handled = invoke(fixture, "mbtowc");
	assert.equal(handled.result.reset, true);
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("mbtowc decodes Hebrew and writes uint32 wchar_t", () => {
	const fixture = createFixture();
	fixture.heap.write(0x5200n, Uint8Array.of(0xd7, 0xa9));
	fixture.registers.write(0, 0x5300n);
	fixture.registers.write(1, 0x5200n);
	fixture.registers.write(2, 2n);
	const handled = invoke(fixture, "mbtowc");
	assert.equal(handled.result.result, 2);
	assert.deepEqual([...fixture.heap.read(0x5300n, 4)], [0xe9, 0x05, 0, 0]);
});

test("mbtowc invalid input returns minus one and sets EILSEQ", () => {
	const fixture = createFixture();
	fixture.heap.write(0x5200n, Uint8Array.of(0xe2));
	fixture.registers.write(0, 0n);
	fixture.registers.write(1, 0x5200n);
	fixture.registers.write(2, 1n);
	const handled = invoke(fixture, "mbtowc");
	assert.equal(handled.result.errno, 84);
	assert.equal(fixture.registers.read(0, 32), 0xffffffffn);
	assert.equal(fixture.errno.get(THREAD), 84);
});

test("Flutter registry exposes mbtowc exactly once", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x1000)
	});
	assert.equal(registry.snapshot().filter(name => name === "mbtowc").length, 1);
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x1000);
	const errno = createNativeErrnoState(heap);
	const registry = createNativeHostImportRegistry();
	registerNativeLocaleHandlers(registry, errno, createNativeLocaleState(heap, errno));
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	return { errno, heap, registers, registry, systemRegisters };
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, {
		memory: fixture.heap,
		registers: fixture.registers,
		systemRegisters: fixture.systemRegisters
	});
}
