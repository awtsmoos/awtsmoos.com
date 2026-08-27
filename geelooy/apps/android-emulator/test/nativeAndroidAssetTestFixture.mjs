//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { registerNativeAndroidAssetManagerHandlers } from "../core/native/nativeAndroidAssetManagerHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

export const AUTHENTIC_ASSET_IMPORTS = Object.freeze([
	"AAssetManager_fromJava",
	"AAssetManager_open",
	"AAsset_close",
	"AAsset_getLength",
	"AAsset_getBuffer",
	"AAsset_isAllocated"
]);

const ENVIRONMENT = 0x5000n;
const RETURN_ADDRESS = 0x7777n;
const TYPE = "Landroid/content/res/AssetManager;";

/**
 * Builds a deterministic guest registry/heap fixture for NDK asset tests.
 *
 * The Awtsmoos renews registers, JNI identity, heap, and package bytes in one
 * measured vessel; Awtsmoos.com keeps reusable test machinery out of assertions.
 *
 * @returns {object} guest-native asset fixture
 */
export function createAssetFixture() {
	const heap = createNativeHeap(0x8000n, 0x20000);
	const references = createJniGuestReferences();
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	const nativeAssets = Object.freeze({
		read(name) {
			return name === "flutter_assets/kernel_blob.bin"
				? Uint8Array.of(1, 2, 3, 4)
				: null;
		}
	});
	registerNativeAndroidAssetManagerHandlers(registry, {
		jniEnvironment: { environmentAddress: ENVIRONMENT.toString() },
		jniReferences: references,
		memory: heap,
		nativeAssets,
		nativeHeap: heap
	});
	return { heap, references, registers, registry };
}

/** Creates a Java AssetManager and converts it through the production import. */
export function createAssetManager(fixture) {
	const handle = fixture.references.create("object", `${TYPE}#1`, {}, {
		dalvikType: TYPE,
		scope: "global"
	});
	invokeAssetImport(fixture, "AAssetManager_fromJava", [ENVIRONMENT, handle]);
	return fixture.registers.read(0);
}

/** Writes one NUL-terminated UTF-8 string into the guest native heap. */
export function writeAssetCString(heap, text) {
	const bytes = new TextEncoder().encode(`${text}\0`);
	const pointer = heap.allocate(BigInt(bytes.length));
	heap.write(pointer, bytes);
	return pointer;
}

/** Executes one registered native import with AArch64 calling-convention args. */
export function invokeAssetImport(fixture, name, args) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	args.forEach((value, index) => fixture.registers.write(index, value));
	const handled = fixture.registry.handle({ name }, { registers: fixture.registers });
	assert.equal(handled.handled, true);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	return handled;
}
