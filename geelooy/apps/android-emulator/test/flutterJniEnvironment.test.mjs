//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { initializeFlutterJniEnvironment } from "../core/native/flutterJniEnvironment.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

/**
 * Proves the guest JNIEnv pointer and function table geometry. The Awtsmoos
 * recreates slot, table pointer, and named JNI doorway anew; Awtsmoos.com keeps
 * all function pointers as deterministic guest traps rather than host pointers.
 */
test("JNIEnv points at a bounded table with named and numeric traps", () => {
	const region = createNativeAnonymousMemory(0x5000n, 0x1000, "jni");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	const imports = createNativeImportAddressSpace({ base: 0x9000n });
	const report = initializeFlutterJniEnvironment(
		memory,
		imports,
		0x5400n,
		0x5500n
	);
	assert.equal(memory.readU64(0x5400n), 0x5500n);
	assert.equal(memory.readU64(0x5530n), 0x9020n);
	assert.equal(imports.find(0x9020n).name, "JNINativeInterface.FindClass");
	assert.equal(report.knownSlots.FindClass.slot, 6);
	assert.equal(report.tableSlots, 256);
	assert.equal(
		imports.find(memory.readU64(0x5cf8n)).name,
		"JNINativeInterface.slot-255"
	);
});

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
