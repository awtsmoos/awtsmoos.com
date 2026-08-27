//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkFlutterNativeStaticFieldResolver } from "../core/android/frameworkFlutterNativeStaticFields.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniFieldIdHandlers } from "../core/native/flutterJniGetFieldId.js";
import { createJniFieldIds } from "../core/native/jniFieldIds.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const JNI_ENVIRONMENT = 0x5000n;
const RETURN_ADDRESS = 0x7777n;
const FLUTTER_JNI = "Lio/flutter/embedding/engine/FlutterJNI;";
const FIELD_NAME = "refreshRateFPS";
const FIELD_KEY = `${FLUTTER_JNI}->${FIELD_NAME}:F`;

/**
 * Builds a production-shaped field family over the same live map Dalvik sees.
 * The Awtsmoos renews class, ID, float, SIMD light, and return shore each call;
 * Awtsmoos.com proves generic JNI truth without app or refresh-rate shortcuts.
 */
function createFixture() {
	const runtime = { staticFields: new Map([[FIELD_KEY, 60]]) };
	const references = createJniGuestReferences();
	const fieldIds = createJniFieldIds();
	const classHandle = references.intern(
		"class",
		FLUTTER_JNI,
		Object.freeze({ descriptor: FLUTTER_JNI }),
		{ scope: "local" }
	);
	const target = Object.freeze({
		encoded: Object.freeze({ accessFlags: 10 }),
		field: Object.freeze({
			classType: FLUTTER_JNI,
			index: 5836,
			name: FIELD_NAME,
			type: "F"
		})
	});
	const machineState = Object.freeze({
		jniEnvironment: Object.freeze({ environmentAddress: JNI_ENVIRONMENT.toString() }),
		jniFieldIds: fieldIds,
		jniReferences: references,
		resolveStaticFieldValue: createFrameworkFlutterNativeStaticFieldResolver(runtime)
	});
	const fieldHandle = internField(fieldIds, target);
	const registry = createNativeHostImportRegistry();
	registerFlutterJniFieldIdHandlers(registry, machineState);
	return Object.freeze({ classHandle, fieldHandle, fieldIds, registry, runtime, target });
}

function internField(fieldIds, target, changes = {}) {
	return fieldIds.intern({
		classDescriptor: changes.classDescriptor || FLUTTER_JNI,
		metadata: Object.freeze({ accessFlags: 10, fieldIndex: 5836 }),
		name: changes.name || FIELD_NAME,
		signature: changes.signature || "F",
		static: changes.static ?? true,
		target
	});
}

function invoke(fixture, changes = {}) {
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, changes.environment ?? JNI_ENVIRONMENT);
	registers.write(1, changes.classHandle ?? fixture.classHandle);
	registers.write(2, changes.fieldHandle ?? fixture.fieldHandle);
	registers.write(30, RETURN_ADDRESS);
	const handled = fixture.registry.handle(
		Object.freeze({ name: "JNINativeInterface.GetStaticFloatField" }),
		Object.freeze({ registers })
	);
	return Object.freeze({ handled, registers });
}

test("GetStaticFloatField follows the live Dalvik field through S0", () => {
	const fixture = createFixture();
	const first = invoke(fixture);
	assert.equal(first.handled.handled, true);
	assert.equal(first.registers.readFloat(0, 32), 60);
	assert.equal(first.registers.pc, RETURN_ADDRESS);
	assert.equal(first.handled.result.key, FIELD_KEY);
	assert.equal(first.handled.result.present, true);
	fixture.runtime.staticFields.set(FIELD_KEY, 90.5);
	assert.equal(invoke(fixture).registers.readFloat(0, 32), 90.5);
});

test("GetStaticFloatField preserves Java default zero for absent storage", () => {
	const fixture = createFixture();
	fixture.runtime.staticFields.delete(FIELD_KEY);
	const call = invoke(fixture);
	assert.equal(call.registers.readFloat(0, 32), 0);
	assert.equal(call.handled.result.present, false);
});

test("GetStaticFloatField rejects invalid environment, class, ID, and kind", () => {
	const fixture = createFixture();
	assert.throws(() => invoke(fixture, { environment: 0x5001n }), { code: "JNI_STATIC_FLOAT_FIELD_ENVIRONMENT" });
	assert.throws(() => invoke(fixture, { classHandle: 0x1234n }), { code: "JNI_STATIC_FLOAT_FIELD_CLASS_HANDLE" });
	assert.throws(() => invoke(fixture, { fieldHandle: 0x1234n }), { code: "JNI_STATIC_FLOAT_FIELD_ID" });
	const integerField = internField(fixture.fieldIds, fixture.target, { name: "integerField", signature: "I" });
	assert.throws(() => invoke(fixture, { fieldHandle: integerField }), { code: "JNI_STATIC_FLOAT_FIELD_KIND" });
	const instanceField = internField(fixture.fieldIds, fixture.target, { name: "instanceField", static: false });
	assert.throws(() => invoke(fixture, { fieldHandle: instanceField }), { code: "JNI_STATIC_FLOAT_FIELD_KIND" });
});
