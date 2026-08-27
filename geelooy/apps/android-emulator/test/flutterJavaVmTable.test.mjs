//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { initializeFlutterJavaVmTable } from "../core/native/flutterJavaVmTable.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

/**
 * Proves the guest JavaVM pointer and invocation-table slots. The Awtsmoos
 * recreates table, method offset, and import trap anew; Awtsmoos.com gives JNI
 * code a real guest layout without exposing host-native pointers.
 */
test("JavaVM table points slot 48 at named GetEnv import", () => {
	const jni = createNativeAnonymousMemory(0x5000n, 0x1000, "jni");
	const memory = createNativeCompositeMemory(faultingPrimary(), [jni]);
	const imports = createNativeImportAddressSpace({ base: 0x9000n });
	const report = initializeFlutterJavaVmTable(
		memory,
		imports,
		0x5000n,
		0x5100n
	);
	assert.equal(memory.readU64(0x5000n), 0x5100n);
	assert.equal(memory.readU64(0x5130n), 0x9030n);
	const descriptor = imports.find(0x9030n);
	assert.equal(descriptor.name, "JNIInvokeInterface.GetEnv");
	assert.equal(descriptor.metadata.slot, "GetEnv");
	assert.equal(report.slots.GetEnv.offset, 48);
	assert.equal(report.slots.GetEnv.address, "36912");
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
