//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidLogcat } from "../core/android/logcat.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeAndroidLogHandlers } from "../core/native/nativeAndroidLogHandlers.js";

/**
 * Proves native Android log_vprint renders guest variadics into bounded logcat.
 * The Awtsmoos recreates tag, message, registers, stack, and pair testimony anew;
 * Awtsmoos.com preserves exact failure evidence without host logging authority.
 */
test("authentic Skia warning appends the missing font path and resumes", () => {
	const fixture = createFixture(createAndroidLogcat());
	const handled = invoke(fixture);
	assert.equal(handled.result.message, "[SkFontMgr Android Parser] '/system/etc/fonts.xml' could not be opened\n");
	assert.equal(fixture.registers.pc, 0x7777n);
	assert.equal(fixture.registers.read(0), 71n);
	assert.equal(handled.result.vaList.consumed[0].address, "22264");
	assert.equal(fixture.logcat.snapshot()[0].level, "W");
});

test("missing logcat still returns rendered byte count safely", () => {
	const fixture = createFixture(null);
	invoke(fixture);
	assert.equal(fixture.registers.read(0), 71n);
});

test("unmapped strings retain call-site, memory, and pair evidence", () => {
	const fixture = createFixture(null, 0x101000000007fn);
	assert.throws(() => invoke(fixture), error => {
		const evidence = error.nativeAndroidLog;
		assert.equal(error.code, "NATIVE_ANONYMOUS_ADDRESS");
		assert.equal(evidence.callSite.pc, "36864");
		assert.equal(evidence.callSite.sp, "25088");
		assert.equal(evidence.callSite.x[30], "30583");
		assertWindow(evidence.memory.vaList, "21696");
		assertWindow(evidence.memory.stackPointer, "24960");
		assertWindow(evidence.memory.generalTop, "22144");
		assert.deepEqual(evidence.pairMemory, []);
		assert.equal(evidence.after.consumed[0].rawValue, "282574488338559");
		return true;
	});
});

test("Flutter registry exposes measured Android native logging", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x200)
	});
	assert.ok(registry.snapshot().includes("__android_log_vprint"));
});

function assertWindow(window, address) {
	assert.equal(window.address, address);
	assert.equal(window.byteLength, 256);
	assert.equal(window.hex.length, 512);
	assert.equal(window.readable, true);
}

function createFixture(logcat, argument = 0x5400n) {
	const memory = createNativeAnonymousMemory(0x5000n, 0x2000, "android-log");
	writeCString(memory, 0x5200n, "skia");
	writeCString(memory, 0x5280n, "[SkFontMgr Android Parser] '%s' could not be opened\n");
	writeCString(memory, 0x5400n, "/system/etc/fonts.xml");
	writeAarch64Integer(memory, 0x5500n, 0x5600n, 64);
	writeAarch64Integer(memory, 0x5508n, 0x5700n, 64);
	writeAarch64Integer(memory, 0x5510n, 0n, 64);
	writeAarch64Integer(memory, 0x5518n, BigInt.asUintN(32, -8n), 32);
	writeAarch64Integer(memory, 0x551cn, 0n, 32);
	writeAarch64Integer(memory, 0x56f8n, argument, 64);
	const registers = createAarch64Registers({ programCounter: 0x9000n, stackPointer: 0x6200n });
	registers.write(0, 5n);
	registers.write(1, 0x5200n);
	registers.write(2, 0x5280n);
	registers.write(3, 0x5500n);
	registers.write(30, 0x7777n);
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidLogHandlers(registry, { nativeLogcat: logcat });
	return { logcat, memory, registers, registry };
}

function invoke(fixture) {
	return fixture.registry.handle(
		{ name: "__android_log_vprint" },
		{ memory: fixture.memory, registers: fixture.registers }
	);
}

function writeCString(memory, address, value) {
	memory.write(address, new TextEncoder().encode(`${value}\0`));
}
