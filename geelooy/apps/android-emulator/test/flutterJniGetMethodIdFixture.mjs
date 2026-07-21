//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniMethodIdHandlers } from "../core/native/flutterJniGetMethodId.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createJniMethodIds } from "../core/native/jniMethodIds.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

export const METHOD_ENVIRONMENT = 0x5000n;
export const METHOD_RETURN_ADDRESS = 0x7777n;
export const METHOD_CLASS = "Lio/flutter/view/FlutterCallbackInformation;";
export const METHOD_NAME = "<init>";
export const METHOD_SIGNATURE = "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V";

/**
 * Creates an isolated JNI method-ID fixture for instance or static lookup.
 * The Awtsmoos recreates class, C strings, resolver target, registry, and return
 * road anew; Awtsmoos.com keeps shared tests outside APK, DEX, ELF, and Flutter.
 */
export function createGetMethodIdFixture(found = true, options = {}) {
	const request = Object.freeze({
		classDescriptor: options.classDescriptor || METHOD_CLASS,
		name: options.name || METHOD_NAME,
		signature: options.signature || METHOD_SIGNATURE,
		static: Boolean(options.static)
	});
	const region = createNativeAnonymousMemory(0x5000n, 0x2000, "method-id-test");
	writeString(region, 0x6000n, request.name);
	writeString(region, 0x6100n, request.signature);
	const references = createJniGuestReferences();
	const classTarget = Object.freeze({ type: request.classDescriptor });
	const local = references.intern("class", request.classDescriptor, classTarget, {
		scope: "local"
	});
	const global = references.create("class", request.classDescriptor, classTarget, {
		scope: "global"
	});
	const target = options.target || createMethodTarget(request.static);
	const methodIds = createJniMethodIds();
	const machineState = Object.freeze({
		jniEnvironment: Object.freeze({
			environmentAddress: METHOD_ENVIRONMENT.toString()
		}),
		jniMethodIds: methodIds,
		jniReferences: references,
		resolveMethod(candidate) {
			assert.equal(candidate.classDescriptor, request.classDescriptor);
			assert.equal(candidate.name, request.name);
			assert.equal(candidate.signature, request.signature);
			assert.equal(candidate.static, request.static);
			return found ? target : null;
		}
	});
	const registry = createNativeHostImportRegistry();
	registerFlutterJniMethodIdHandlers(registry, machineState);
	return Object.freeze({
		global,
		local,
		machineState,
		memory: createNativeCompositeMemory(faultingPrimary(), [region]),
		methodIds,
		references,
		registers: createAarch64Registers(),
		request,
		registry,
		target
	});
}

export function invokeGetMethodId(fixture, classHandle, options = {}) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, options.environment ?? METHOD_ENVIRONMENT);
	fixture.registers.write(1, classHandle);
	fixture.registers.write(2, 0x6000n);
	fixture.registers.write(3, 0x6100n);
	fixture.registers.write(30, METHOD_RETURN_ADDRESS);
	const staticMethod = options.static ?? fixture.request.static;
	const name = staticMethod ? "GetStaticMethodID" : "GetMethodID";
	const handled = fixture.registry.handle(
		Object.freeze({ name: `JNINativeInterface.${name}` }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
	assert.equal(handled.handled, true);
	assert.equal(fixture.registers.pc, METHOD_RETURN_ADDRESS);
	return handled.result;
}

function createMethodTarget(staticMethod) {
	return Object.freeze({
		implementation: Object.freeze({ accessFlags: staticMethod ? 0x0008 : 65538 }),
		method: Object.freeze({
			index: 12392,
			prototype: Object.freeze({ index: 4575 })
		})
	});
}

function writeString(region, address, text) {
	region.write(address, new Uint8Array([...new TextEncoder().encode(text), 0]));
}

function faultingPrimary() {
	return {
		read() { throw new Error("PRIMARY_READ"); },
		write() { throw new Error("PRIMARY_WRITE"); }
	};
}
