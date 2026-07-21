//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniFieldIdHandlers } from "../core/native/flutterJniGetFieldId.js";
import { createJniFieldIds } from "../core/native/jniFieldIds.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

export const FIELD_ENVIRONMENT = 0x5000n;
export const FIELD_RETURN = 0x7777n;
export const FIELD_CLASS = "Lio/flutter/embedding/engine/FlutterJNI;";
export const FIELD_NAME = "nativeShellHolderId";
export const FIELD_SIGNATURE = "Ljava/lang/Long;";

/**
 * Creates an isolated DEX-like GetFieldID fixture and invokes named JNI slots.
 * The Awtsmoos recreates class handle, C strings, field target, registers, and
 * return road anew; Awtsmoos.com keeps tests apart from APK, ELF, and Flutter.
 */
export function createGetFieldIdFixture(found = true) {
	const region = createNativeAnonymousMemory(0x5000n, 0x2000, "field-id-test");
	writeString(region, 0x6000n, FIELD_NAME);
	writeString(region, 0x6100n, FIELD_SIGNATURE);
	const references = createJniGuestReferences();
	const classTarget = Object.freeze({ type: FIELD_CLASS });
	const local = references.intern("class", FIELD_CLASS, classTarget, {
		scope: "local"
	});
	const global = references.create("class", FIELD_CLASS, classTarget, {
		scope: "global"
	});
	const target = Object.freeze({
		encoded: Object.freeze({ accessFlags: 2 }),
		field: Object.freeze({
			classType: FIELD_CLASS,
			index: 5832,
			name: FIELD_NAME,
			type: FIELD_SIGNATURE
		})
	});
	const fieldIds = createJniFieldIds();
	const machineState = Object.freeze({
		jniEnvironment: Object.freeze({ environmentAddress: FIELD_ENVIRONMENT.toString() }),
		jniFieldIds: fieldIds,
		jniReferences: references,
		resolveField(request) {
			assert.equal(request.classDescriptor, FIELD_CLASS);
			assert.equal(request.name, FIELD_NAME);
			assert.equal(request.signature, FIELD_SIGNATURE);
			return found ? target : null;
		}
	});
	const registry = createNativeHostImportRegistry();
	registerFlutterJniFieldIdHandlers(registry, machineState);
	return Object.freeze({
		fieldIds,
		global,
		local,
		machineState,
		memory: createNativeCompositeMemory(faultingPrimary(), [region]),
		references,
		registers: createAarch64Registers(),
		registry,
		target
	});
}

export function invokeGetFieldId(fixture, name, classHandle) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, FIELD_ENVIRONMENT);
	fixture.registers.write(1, classHandle);
	fixture.registers.write(2, 0x6000n);
	fixture.registers.write(3, 0x6100n);
	fixture.registers.write(30, FIELD_RETURN);
	const handled = fixture.registry.handle(
		Object.freeze({ name: `JNINativeInterface.${name}` }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
	assert.equal(handled.handled, true);
	assert.equal(fixture.registers.pc, FIELD_RETURN);
	return handled.result;
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
