//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePthreadAttributeHandlers } from "../core/native/nativePthreadAttributeHandlers.js";
import { createNativePthreadAttributeState } from "../core/native/nativePthreadAttributeState.js";

const RETURN_ADDRESS = 0x7777n;

test("pthread attribute handlers register the complete measured family", () => {
	const fixture = createFixture();
	assert.deepEqual(fixture.registry.snapshot(), [
		"pthread_attr_destroy", "pthread_attr_getdetachstate",
		"pthread_attr_getguardsize", "pthread_attr_getstack",
		"pthread_attr_getstacksize", "pthread_attr_init",
		"pthread_attr_setdetachstate", "pthread_attr_setguardsize",
		"pthread_attr_setstacksize"
	]);
});

test("init, setters, getters, and getstack preserve guest ABI", () => {
	const fixture = createFixture();
	fixture.registers.write(5, 0xabcden);
	invoke(fixture, "pthread_attr_init", 0x1100n);
	assert.equal(fixture.registers.read(0, 32), 0n);
	invoke(fixture, "pthread_attr_setdetachstate", 0x1100n, 1n);
	invoke(fixture, "pthread_attr_setstacksize", 0x1100n, 0x20000n);
	invoke(fixture, "pthread_attr_getdetachstate", 0x1100n, 0x1200n);
	assert.equal(readAarch64Integer(fixture.memory, 0x1200n, 32), 1n);
	invoke(fixture, "pthread_attr_getstack", 0x1100n, 0x1210n, 0x1218n);
	assert.equal(readAarch64Integer(fixture.memory, 0x1210n, 64), 0n);
	assert.equal(readAarch64Integer(fixture.memory, 0x1218n, 64), 0x20000n);
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("invalid pointers, values, sizes, and outputs return EINVAL", () => {
	const fixture = createFixture();
	invoke(fixture, "pthread_attr_init", 0n);
	assert.equal(fixture.registers.read(0, 32), 22n);
	invoke(fixture, "pthread_attr_init", 0x1100n);
	invoke(fixture, "pthread_attr_setdetachstate", 0x1100n, 7n);
	assert.equal(fixture.registers.read(0, 32), 22n);
	invoke(fixture, "pthread_attr_setstacksize", 0x1100n, 1n);
	assert.equal(fixture.registers.read(0, 32), 22n);
	invoke(fixture, "pthread_attr_getstack", 0x1100n, 0n, 0x1218n);
	assert.equal(fixture.registers.read(0, 32), 22n);
});

test("Flutter registry exposes every measured pthread attribute symbol", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x1000)
	});
	for (const name of ["pthread_attr_init", "pthread_attr_destroy",
		"pthread_attr_getstack", "pthread_attr_setdetachstate",
		"pthread_attr_setstacksize"]) assert.ok(registry.snapshot().includes(name));
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x1000n, 0x1000, "pthread-attr");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	registers.write(30, RETURN_ADDRESS);
	registerNativePthreadAttributeHandlers(registry, createNativePthreadAttributeState());
	return Object.freeze({ memory, registers, registry });
}

function invoke(fixture, name, first, second = 0n, third = 0n) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, first);
	fixture.registers.write(1, second);
	fixture.registers.write(2, third);
	return fixture.registry.handle(Object.freeze({ name }), Object.freeze({
		memory: fixture.memory,
		registers: fixture.registers
	}));
}
