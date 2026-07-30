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
import { registerNativeLibcSystemHandlers } from "../core/native/nativeLibcSystemHandlers.js";
import { createNativeSystemConfiguration } from "../core/native/nativeSystemConfiguration.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

test("authentic getauxval AT_HWCAP returns FP plus ASIMD and preserves ABI", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 16n);
	fixture.registers.write(5, 0xabcden);
	const handled = invoke(fixture, "getauxval");
	assert.equal(handled.result.value, "3");
	assert.equal(fixture.registers.read(0), 3n);
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.sp, 0x8800n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("unknown getauxval returns zero and sets per-thread ENOENT", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 999n);
	const handled = invoke(fixture, "getauxval");
	assert.equal(handled.result.errno, 2);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.errnoState.get(THREAD), 2);
});

test("sysconf and getpagesize retain deterministic contracts", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 97n);
	assert.equal(invoke(fixture, "sysconf").result.value, "4");
	assert.equal(invoke(fixture, "getpagesize").result.value, "4096");
	fixture.registers.write(0, 0x7fffffffn);
	assert.equal(invoke(fixture, "sysconf").result.errno, 22);
	assert.equal(fixture.registers.read(0), 0xffffffffffffffffn);
});

test("Flutter registry exposes every system road exactly once", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x1000)
	});
	for (const name of ["sysconf", "getpagesize", "getauxval"]) {
		assert.equal(registry.snapshot().filter(item => item === name).length, 1);
	}
});

function createFixture() {
	const heap = createNativeHeap(0x7000n, 0x1000);
	const errnoState = createNativeErrnoState(heap);
	const registry = createNativeHostImportRegistry();
	registerNativeLibcSystemHandlers(registry, {
		errnoState,
		state: createNativeSystemConfiguration()
	});
	const registers = createAarch64Registers({
		programCounter: 0x9000n,
		stackPointer: 0x8800n
	});
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	return { errnoState, registers, registry, systemRegisters };
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
