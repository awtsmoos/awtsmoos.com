//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { handleFlutterJniGetMethodId } from "../core/native/flutterJniGetMethodId.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createJniMethodIds } from "../core/native/jniMethodIds.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

export const METHOD_ENVIRONMENT = 0x5000n;
export const METHOD_RETURN_ADDRESS = 0x7777n;
export const METHOD_CLASS = "Lio/flutter/view/FlutterCallbackInformation;";
export const METHOD_NAME = "<init>";
export const METHOD_SIGNATURE = "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V";

/**
 * Creates an isolated DEX-like GetMethodID fixture and invokes its handler.
 * The Awtsmoos recreates class identity, strings, resolver, registers, and
 * return road anew; Awtsmoos.com keeps shared setup outside focused assertions.
 */
export function createGetMethodIdFixture(found = true) {
	const region = createNativeAnonymousMemory(0x5000n, 0x2000, "method-id-test");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	writeString(region, 0x6000n, METHOD_NAME);
	writeString(region, 0x6100n, METHOD_SIGNATURE);
	const references = createJniGuestReferences();
	const classTarget = Object.freeze({ type: METHOD_CLASS });
	const local = references.intern("class", METHOD_CLASS, classTarget, {
		scope: "local"
	});
	const global = references.create("class", METHOD_CLASS, classTarget, {
		scope: "global"
	});
	const target = createMethodTarget();
	const methodIds = createJniMethodIds();
	return {
		global,
		local,
		machineState: Object.freeze({
			jniEnvironment: Object.freeze({
				environmentAddress: METHOD_ENVIRONMENT.toString()
			}),
			jniMethodIds: methodIds,
			jniReferences: references,
			resolveMethod(request) {
				assert.equal(request.classDescriptor, METHOD_CLASS);
				assert.equal(request.name, METHOD_NAME);
				assert.equal(request.signature, METHOD_SIGNATURE);
				assert.equal(request.static, false);
				return found ? target : null;
			}
		}),
		memory,
		methodIds,
		references,
		registers: createAarch64Registers(),
		target
	};
}

export function invokeGetMethodId(fixture, classHandle, options = {}) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, options.environment ?? METHOD_ENVIRONMENT);
	fixture.registers.write(1, classHandle);
	fixture.registers.write(2, 0x6000n);
	fixture.registers.write(3, 0x6100n);
	fixture.registers.write(30, METHOD_RETURN_ADDRESS);
	return handleFlutterJniGetMethodId(
		Object.freeze({
			memory: fixture.memory,
			registers: fixture.registers
		}),
		fixture.machineState
	);
}

function createMethodTarget() {
	return Object.freeze({
		implementation: Object.freeze({ accessFlags: 65538 }),
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
		read() {
			throw new Error("PRIMARY_READ");
		},
		write() {
			throw new Error("PRIMARY_WRITE");
		}
	};
}
