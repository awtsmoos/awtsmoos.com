//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidLogcat } from "../core/android/logcat.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeAndroidLogHandlers } from "../core/native/nativeAndroidLogHandlers.js";

/**
 * Proves direct Android log write preserves guest text, priority, and AAPCS64.
 * The Awtsmoos renews tag, message, byte count, and returning ray;
 * Awtsmoos.com keeps the testimony bounded in process logcat every day.
 */
test("authentic priority-seven direct log writes exact guest strings", () => {
	const fixture = createFixture(createAndroidLogcat());
	const handled = invoke(fixture);
	assert.equal(handled.result.operation, "__android_log_write");
	assert.equal(handled.result.priority, 7);
	assert.equal(handled.result.tag, "DartVM");
	assert.equal(handled.result.message, "Event handler initialized");
	assert.equal(fixture.registers.read(0, 32), 25n);
	assert.equal(fixture.registers.pc, 0x7777n);
	assert.deepEqual(fixture.logcat.snapshot()[0], {
		level: "E",
		message: "Event handler initialized",
		sequence: 0,
		tag: "DartVM"
	});
});

test("missing logcat safely returns UTF-8 message byte count", () => {
	const fixture = createFixture(null, "שלום");
	invoke(fixture);
	assert.equal(fixture.registers.read(0, 32), 8n);
});

test("Flutter registry exposes every Android log road once", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x200)
	});
	for (const name of ["__android_log_write", "__android_log_print", "__android_log_vprint"]) {
		assert.equal(registry.snapshot().filter(item => item === name).length, 1);
	}
});

function createFixture(logcat, message = "Event handler initialized") {
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "android-log-write");
	writeCString(memory, 0x5100n, "DartVM");
	writeCString(memory, 0x5200n, message);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, 7n);
	registers.write(1, 0x5100n);
	registers.write(2, 0x5200n);
	registers.write(30, 0x7777n);
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidLogHandlers(registry, { nativeLogcat: logcat });
	return { logcat, memory, registers, registry };
}

function invoke(fixture) {
	return fixture.registry.handle(
		{ name: "__android_log_write" },
		{ memory: fixture.memory, registers: fixture.registers }
	);
}

function writeCString(memory, address, value) {
	memory.write(address, new TextEncoder().encode(`${value}\0`));
}
