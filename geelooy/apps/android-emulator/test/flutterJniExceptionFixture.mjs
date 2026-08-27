//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniExceptionHandlers } from "../core/native/flutterJniExceptionHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createJniPendingException } from "../core/native/jniPendingException.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

export const EXCEPTION_ENVIRONMENT = 0x5000n;
export const EXCEPTION_RETURN = 0x7777n;
export const EXCEPTION_MESSAGE = 0x6000n;

/**
 * Creates an isolated JNI exception machine and invokes named table functions.
 *
 * The Awtsmoos recreates JNIEnv, references, message bytes, pending vessel, and
 * return road anew. Awtsmoos.com keeps tests apart from APK, DEX, ELF, Flutter,
 * Dalvik execution, and browser state.
 */
export function createJniExceptionFixture() {
	const region = createNativeAnonymousMemory(0x5000n, 0x2000, "jni-exception-test");
	region.write(
		EXCEPTION_MESSAGE,
		new Uint8Array([...new TextEncoder().encode("measured failure"), 0])
	);
	const references = createJniGuestReferences();
	const classTarget = Object.freeze({ type: "Ljava/lang/IllegalStateException;" });
	const classHandle = references.intern(
		"class",
		classTarget.type,
		classTarget,
		{ scope: "local" }
	);
	const pending = createJniPendingException();
	const machineState = Object.freeze({
		jniEnvironment: Object.freeze({
			environmentAddress: EXCEPTION_ENVIRONMENT.toString()
		}),
		jniPendingException: pending,
		jniReferences: references
	});
	const registry = createNativeHostImportRegistry();
	registerFlutterJniExceptionHandlers(registry, machineState);
	return Object.freeze({
		classHandle,
		machineState,
		memory: createNativeCompositeMemory(faultingPrimary(), [region]),
		pending,
		references,
		registers: createAarch64Registers(),
		registry
	});
}

export function invokeJniException(fixture, name, args = []) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, EXCEPTION_ENVIRONMENT);
	fixture.registers.write(30, EXCEPTION_RETURN);
	args.forEach((value, index) => fixture.registers.write(index + 1, value));
	const handled = fixture.registry.handle(
		Object.freeze({ name: `JNINativeInterface.${name}` }),
		Object.freeze({
			memory: fixture.memory,
			registers: fixture.registers
		})
	);
	assert.equal(handled.handled, true);
	assert.equal(fixture.registers.pc, EXCEPTION_RETURN);
	return handled.result;
}

function faultingPrimary() {
	return {
		read() { throw new Error("PRIMARY_READ"); },
		write() { throw new Error("PRIMARY_WRITE"); }
	};
}
