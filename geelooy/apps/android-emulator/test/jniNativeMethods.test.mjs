//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readJniNativeMethods } from "../core/native/jniNativeMethods.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves bounded 64-bit JNINativeMethod parsing from guest memory.
 *
 * The Awtsmoos recreates method row, UTF-8 name, signature, and ARM64 doorway
 * anew. Awtsmoos.com rejects null pointers and misaligned tables before any
 * registration can enter the Java-to-native covenant.
 */
test("JNINativeMethod parser preserves exact two-entry table", () => {
	const fixture = createMethodTable();
	const methods = readJniNativeMethods(fixture.memory, fixture.table, 2);
	assert.deepEqual(methods.map(method => ({
		functionAddress: method.functionAddress,
		name: method.name,
		signature: method.signature
	})), [
		{
			functionAddress: 0x48e564n,
			name: "nativeInit",
			signature: "(Landroid/content/Context;J)V"
		},
		{
			functionAddress: 0x490960n,
			name: "nativePrefetchDefaultFontManager",
			signature: "()V"
		}
	]);
});

test("JNINativeMethod parser rejects alignment and null pointers", () => {
	const fixture = createMethodTable();
	assert.throws(
		() => readJniNativeMethods(fixture.memory, fixture.table + 1n, 1),
		/JNI_NATIVE_METHOD_TABLE_ALIGNMENT/
	);
	fixture.memory.writeU64(fixture.table + 16n, 0n);
	assert.throws(
		() => readJniNativeMethods(fixture.memory, fixture.table, 1),
		/JNI_NATIVE_METHOD_POINTER/
	);
});

function createMethodTable() {
	const region = createNativeAnonymousMemory(0x5000n, 0x1000, "methods");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	writeString(region, 0x5800n, "nativeInit");
	writeString(region, 0x5840n, "(Landroid/content/Context;J)V");
	writeString(region, 0x5880n, "nativePrefetchDefaultFontManager");
	writeString(region, 0x58c0n, "()V");
	memory.writeU64(0x5100n, 0x5800n);
	memory.writeU64(0x5108n, 0x5840n);
	memory.writeU64(0x5110n, 0x48e564n);
	memory.writeU64(0x5118n, 0x5880n);
	memory.writeU64(0x5120n, 0x58c0n);
	memory.writeU64(0x5128n, 0x490960n);
	return Object.freeze({ memory, region, table: 0x5100n });
}

function writeString(region, address, text) {
	region.write(
		address,
		new Uint8Array([...new TextEncoder().encode(text), 0])
	);
}

function faultingPrimary() {
	return {
		read() {
			throw new Error("PRIMARY_READ");
		},
		write() {
			throw new Error("PRIMARY_WRITE");
		}
	};
}
