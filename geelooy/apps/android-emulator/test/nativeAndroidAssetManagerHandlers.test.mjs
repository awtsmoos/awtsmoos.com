//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { registerNativeAndroidAssetManagerHandlers } from "../core/native/nativeAndroidAssetManagerHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const ENVIRONMENT = 0x5000n;
const RETURN_ADDRESS = 0x7777n;
const TYPE = "Landroid/content/res/AssetManager;";

/**
 * Proves Java AssetManager identity becomes stable zeroed guest-native memory.
 * The Awtsmoos renews local and global garments; Awtsmoos.com returns one
 * bounded pointer while no host address enters the authentic ARM64 crossing.
 */
test("AAssetManager_fromJava returns one guest pointer across JNI scopes", () => {
	const fixture = createFixture();
	const target = Object.freeze({ id: 43 });
	const local = fixture.references.create("object", `${TYPE}#dalvik-43`, target, {
		dalvikType: TYPE,
		scope: "local"
	});
	const global = fixture.references.create("object", `${TYPE}#dalvik-43`, target, {
		dalvikType: TYPE,
		scope: "global",
		sourceHandle: local.toString()
	});
	const first = invoke(fixture, global);
	const pointer = fixture.registers.read(0);
	assert.notEqual(pointer, 0n);
	assert.equal(fixture.heap.allocation(pointer)?.requestedSize, 16n);
	assert.deepEqual([...fixture.heap.read(pointer, 16)], Array(16).fill(0));
	assert.equal(first.result.identity, `${TYPE}#dalvik-43`);
	assert.equal(first.result.pointer, pointer.toString());
	const second = invoke(fixture, local);
	assert.equal(fixture.registers.read(0), pointer);
	assert.equal(second.result.pointer, pointer.toString());
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("null, foreign environments, and wrong Java types remain bounded", () => {
	const fixture = createFixture();
	const handled = invoke(fixture, 0n);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(handled.result.success, false);
	fixture.registers.write(0, 0x6000n);
	assert.throws(() => handle(fixture), /ASSET_MANAGER_ENVIRONMENT/);
	fixture.registers.write(0, ENVIRONMENT);
	const wrong = fixture.references.create("object", "Ljava/lang/String;#1", {}, {
		dalvikType: "Ljava/lang/String;",
		scope: "global"
	});
	fixture.registers.write(1, wrong);
	assert.throws(() => handle(fixture), /ASSET_MANAGER_TYPE/);
});

test("production Flutter import registry exposes AAssetManager_fromJava", () => {
	const fixture = createFixture();
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x4000n,
		jniEnvironment: { environmentAddress: ENVIRONMENT.toString() },
		jniReferences: fixture.references,
		nativeHeap: fixture.heap
	}));
	assert.ok(registry.snapshot().includes("AAssetManager_fromJava"));
});

function createFixture() {
	const heap = createNativeHeap(0x8000n, 0x1000);
	const references = createJniGuestReferences();
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidAssetManagerHandlers(registry, {
		jniEnvironment: { environmentAddress: ENVIRONMENT.toString() },
		jniReferences: references,
		nativeHeap: heap
	});
	return { heap, references, registers, registry };
}

function invoke(fixture, javaHandle) {
	fixture.registers.write(0, ENVIRONMENT);
	fixture.registers.write(1, javaHandle);
	return handle(fixture);
}

function handle(fixture) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name: "AAssetManager_fromJava" }, {
		registers: fixture.registers
	});
}
