//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { invokeAndroidTraceQuery } from "../core/android/frameworkAndroidTraceMethods.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { registerNativeAndroidTraceHandlers } from "../core/native/nativeAndroidTraceHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const RETURN_ADDRESS = 0x7777n;

test("authentic ATrace_isEnabled returns true and resumes through X30", () => {
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidTraceHandlers(registry);
	const registers = createAarch64Registers({
		programCounter: 0x9000n,
		stackPointer: 0x8800n
	});
	registers.write(0, 0xffffffffffffffffn);
	registers.write(5, 0xabcden);
	registers.write(30, RETURN_ADDRESS);
	const handled = registry.handle({ name: "ATrace_isEnabled" }, { registers });
	assert.deepEqual(handled.result, {
		enabled: true,
		operation: "ATrace_isEnabled",
		result: 1
	});
	assert.equal(registers.read(0), 1n);
	assert.equal(registers.read(5), 0xabcden);
	assert.equal(registers.sp, 0x8800n);
	assert.equal(registers.pc, RETURN_ADDRESS);
});

test("native and Java Trace enabled queries agree", () => {
	const result = invokeAndroidTraceQuery({}, {
		method: {
			classType: "Landroid/os/Trace;",
			descriptor: "()Z",
			name: "isEnabled"
		}
	}, []);
	assert.equal(result.handled, true);
	assert.equal(result.value, 1);
});

test("Flutter registry exposes measured native Android tracing", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x400)
	});
	assert.ok(registry.snapshot().includes("ATrace_isEnabled"));
});
