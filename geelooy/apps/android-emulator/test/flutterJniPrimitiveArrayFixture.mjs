//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { createFrameworkFlutterNativeArrayCapabilities } from "../core/android/frameworkFlutterNativeArrayCapabilities.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniPrimitiveArrayHandlers } from "../core/native/flutterJniPrimitiveArrayHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

export const JNI_ENVIRONMENT = 0x5000n;
export const JNI_RETURN = 0x7777n;

/** Creates one Android-owned Dalvik array heap plus guest-native copy heap. */
export function createPrimitiveArrayFixture() {
	const heap = createDalvikObjectHeap();
	const capabilities = createFrameworkFlutterNativeArrayCapabilities({ heap });
	const nativeHeap = createNativeHeap(0x6000n, 0x8000);
	const memory = createNativeCompositeMemory(nativeHeap, [], "primitive-array-test");
	const references = createJniGuestReferences();
	const registers = createAarch64Registers();
	const registry = createNativeHostImportRegistry();
	registerFlutterJniPrimitiveArrayHandlers(registry, {
		jniArrayCapabilities: capabilities,
		jniEnvironment: { environmentAddress: JNI_ENVIRONMENT.toString() },
		jniReferences: references,
		memory,
		nativeHeap,
		resolveArrayLength: reference => heap.arrayLength(reference)
	});
	return { capabilities, heap, memory, nativeHeap, references, registers, registry };
}

export function invokePrimitiveArray(fixture, name, args) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, JNI_RETURN);
	args.forEach((value, index) => fixture.registers.write(index, value));
	const handled = fixture.registry.handle(
		Object.freeze({ name }),
		Object.freeze({ registers: fixture.registers })
	);
	assert.equal(handled.handled, true);
	assert.equal(fixture.registers.pc, JNI_RETURN);
	return handled.result;
}

export function writeInt32Values(memory, pointer, values) {
	const bytes = new Uint8Array(values.length * 4);
	const view = new DataView(bytes.buffer);
	values.forEach((value, index) => view.setInt32(index * 4, value, true));
	memory.write(pointer, bytes);
}

export function readInt32Values(memory, pointer, count) {
	const bytes = memory.read(pointer, count * 4);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return Array.from({ length: count }, (_, index) => {
		return view.getInt32(index * 4, true);
	});
}
