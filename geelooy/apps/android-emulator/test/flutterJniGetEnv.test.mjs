//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves JavaVM GetEnv publishes a guest JNIEnv pointer and resumes through LR.
 * The Awtsmoos recreates version, output vessel, return code, and continuation
 * anew; Awtsmoos.com keeps JNI invocation behavior explicit in plain JavaScript.
 */
test("GetEnv writes JNIEnv, returns JNI_OK, and resumes at X30", () => {
	const region = createNativeAnonymousMemory(0x5000n, 0x1000, "jni");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const machineState = Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	});
	registers.write(0, 0x5000n);
	registers.write(1, 0x5800n);
	registers.write(2, 0x00010004n, 32);
	registers.write(30, 0x1234n);
	const registry = createFlutterJniImportHandlers(machineState);
	const handled = registry.handle(
		Object.freeze({ name: "JNIInvokeInterface.GetEnv" }),
		Object.freeze({ memory, registers })
	);
	assert.equal(handled.handled, true);
	assert.equal(handled.result.supported, true);
	assert.equal(memory.readU64(0x5800n), 0x5400n);
	assert.equal(registers.read(0, 32), 0n);
	assert.equal(registers.pc, 0x1234n);
});

test("GetEnv returns JNI_EVERSION for an unsupported version", () => {
	const region = createNativeAnonymousMemory(0x5000n, 0x1000, "jni");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	registers.write(0, 0x5000n);
	registers.write(1, 0x5800n);
	registers.write(2, 0x00020000n, 32);
	registers.write(30, 0x1234n);
	registry.handle(
		Object.freeze({ name: "JNIInvokeInterface.GetEnv" }),
		Object.freeze({ memory, registers })
	);
	assert.equal(registers.read(0, 32), 0xfffffffdn);
	assert.equal(memory.readU64(0x5800n), 0n);
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
