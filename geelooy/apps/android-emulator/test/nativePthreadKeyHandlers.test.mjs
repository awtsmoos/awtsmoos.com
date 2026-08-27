//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePthreadKeyHandlers } from "../core/native/nativePthreadKeyHandlers.js";
import { createNativePthreadKeyState } from "../core/native/nativePthreadKeyState.js";

const AUTHENTIC_PAGE = 11251712n;
const KEY_OUTPUT = 11252388n;
const SECOND_OUTPUT = KEY_OUTPUT + 4n;
const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

test("authentic pthread_key_create writes uint32 key and preserves ABI", () => {
	const fixture = createFixture();
	fixture.registers.write(0, KEY_OUTPUT);
	fixture.registers.write(1, 4706740n);
	fixture.registers.write(5, 0xabcden);
	const handled = invoke(fixture, "pthread_key_create");
	assert.equal(handled.result.key, 0);
	assert.equal(handled.result.destructor, "4706740");
	assert.deepEqual([...fixture.memory.read(KEY_OUTPUT, 4)], [0, 0, 0, 0]);
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.sp, 0x8800n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("set/get isolate threads, NULL clears, and delete invalidates", () => {
	const fixture = createFixture();
	fixture.registers.write(0, KEY_OUTPUT);
	fixture.registers.write(1, 0n);
	invoke(fixture, "pthread_key_create");
	fixture.registers.write(0, 0n);
	fixture.registers.write(1, 0x1234n);
	invoke(fixture, "pthread_setspecific");
	fixture.registers.write(0, 0n);
	invoke(fixture, "pthread_getspecific");
	assert.equal(fixture.registers.read(0), 0x1234n);
	fixture.systemRegisters.write("TPIDR_EL0", 0x6000n);
	fixture.registers.write(0, 0n);
	invoke(fixture, "pthread_getspecific");
	assert.equal(fixture.registers.read(0), 0n);
	fixture.registers.write(0, 0n);
	invoke(fixture, "pthread_key_delete");
	fixture.registers.write(0, 0n);
	fixture.registers.write(1, 1n);
	assert.equal(invoke(fixture, "pthread_setspecific").result.code, 22);
});

test("capacity exhaustion returns EAGAIN and bad calls return EINVAL", () => {
	const fixture = createFixture(1);
	fixture.registers.write(0, KEY_OUTPUT);
	fixture.registers.write(1, 0n);
	assert.equal(invoke(fixture, "pthread_key_create").result.code, 0);
	fixture.registers.write(0, SECOND_OUTPUT);
	assert.equal(invoke(fixture, "pthread_key_create").result.code, 11);
	fixture.registers.write(0, 99n);
	assert.equal(invoke(fixture, "pthread_key_delete").result.code, 22);
	fixture.registers.write(0, 99n);
	invoke(fixture, "pthread_getspecific");
	assert.equal(fixture.registers.read(0), 0n);
});

test("Flutter registry exposes all four pthread key functions", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x400)
	});
	for (const name of ["pthread_key_create", "pthread_key_delete",
		"pthread_getspecific", "pthread_setspecific"]) {
		assert.ok(registry.snapshot().includes(name));
	}
});

function createFixture(capacity = 128) {
	const memory = createNativeAnonymousMemory(AUTHENTIC_PAGE, 0x1000, "pthread-keys");
	const registers = createAarch64Registers({
		programCounter: 0x9000n,
		stackPointer: 0x8800n
	});
	registers.write(30, RETURN_ADDRESS);
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	const registry = createNativeHostImportRegistry();
	registerNativePthreadKeyHandlers(registry, createNativePthreadKeyState({ capacity }));
	return { memory, registers, registry, systemRegisters };
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
