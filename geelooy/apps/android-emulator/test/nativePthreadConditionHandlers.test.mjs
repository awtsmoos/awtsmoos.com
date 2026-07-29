//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePthreadConditionHandlers } from "../core/native/nativePthreadConditionHandlers.js";
import { createNativePthreadConditionState } from "../core/native/nativePthreadConditionState.js";

const RETURN_ADDRESS = 0x7777n;

test("condition handlers register only the nonblocking family", () => {
	const fixture = createFixture();
	assert.deepEqual(fixture.registry.snapshot(), [
		"pthread_cond_broadcast",
		"pthread_cond_destroy",
		"pthread_cond_init",
		"pthread_cond_signal"
	]);
	assert.equal(fixture.registry.snapshot().includes("pthread_cond_wait"), false);
});

test("authentic broadcast uses X0, W0, and X30 exactly", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 11301792n);
	fixture.registers.write(1, 0xabcdefn);
	const handled = fixture.registry.handle(
		Object.freeze({ name: "pthread_cond_broadcast" }),
		Object.freeze({ registers: fixture.registers })
	);
	assert.equal(handled.result.operation, "broadcast");
	assert.equal(handled.result.broadcastEpoch, 1);
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.registers.read(1), 0xabcdefn);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("init attributes and null notifications return C errors", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0x6000n);
	fixture.registers.write(1, 1n);
	fixture.registry.handle(
		Object.freeze({ name: "pthread_cond_init" }),
		Object.freeze({ registers: fixture.registers })
	);
	assert.equal(fixture.registers.read(0, 32), 22n);
	fixture.registers.write(0, 0n);
	fixture.registry.handle(
		Object.freeze({ name: "pthread_cond_signal" }),
		Object.freeze({ registers: fixture.registers })
	);
	assert.equal(fixture.registers.read(0, 32), 22n);
});

test("Flutter registry exposes notifications but not fabricated waits", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of [
		"pthread_cond_init",
		"pthread_cond_destroy",
		"pthread_cond_signal",
		"pthread_cond_broadcast"
	]) {
		assert.ok(registry.snapshot().includes(name));
	}
	assert.equal(registry.snapshot().includes("pthread_cond_wait"), false);
});

function createFixture() {
	const conditions = createNativePthreadConditionState();
	const registry = createNativeHostImportRegistry();
	registerNativePthreadConditionHandlers(registry, conditions);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, RETURN_ADDRESS);
	return Object.freeze({ conditions, registers, registry });
}
