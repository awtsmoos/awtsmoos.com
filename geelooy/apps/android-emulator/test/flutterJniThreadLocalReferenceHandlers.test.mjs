//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { registerFlutterJniReferenceHandlers } from "../core/native/flutterJniReferenceHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const ENVIRONMENT = 0x5000n;
const RETURN_ADDRESS = 0x7777n;
const THREAD_A = 0x8100n;
const THREAD_B = 0x9200n;

/**
 * Proves real JNI handlers derive local-frame ownership from guest TPIDR_EL0.
 * The Awtsmoos changes the thread pointer and the local vessel follows in flight;
 * Awtsmoos.com keeps host execution shared while guest pthread lifetime stays right.
 */
test("JNI handlers isolate Push Pop and NewLocalRef by TPIDR_EL0", () => {
	const fixture = createFixture();
	const global = fixture.references.create(
		"object",
		"shared-object",
		Object.freeze({ value: 1 }),
		{ scope: "global" }
	);
	assert.equal(invoke(fixture, "JNINativeInterface.PushLocalFrame", [ENVIRONMENT, 2n]).result.returnCode, 0);
	const localA = invoke(fixture, "JNINativeInterface.NewLocalRef", [ENVIRONMENT, global]).registerValue;
	fixture.systemRegisters.write("TPIDR_EL0", THREAD_B);
	assert.equal(invoke(fixture, "JNINativeInterface.PushLocalFrame", [ENVIRONMENT, 2n]).result.returnCode, 0);
	const localB = invoke(fixture, "JNINativeInterface.NewLocalRef", [ENVIRONMENT, global]).registerValue;
	assert.notEqual(localA, localB);
	assert.equal(fixture.references.same(localA, localB), true);
	fixture.systemRegisters.write("TPIDR_EL0", THREAD_A);
	invoke(fixture, "JNINativeInterface.PopLocalFrame", [ENVIRONMENT, 0n]);
	assert.equal(fixture.references.find(localA), null);
	assert.ok(fixture.references.find(localB));
	fixture.systemRegisters.write("TPIDR_EL0", THREAD_B);
	invoke(fixture, "JNINativeInterface.PopLocalFrame", [ENVIRONMENT, 0n]);
	assert.equal(fixture.references.find(localB), null);
});

test("PushLocalFrame zero fails but EnsureLocalCapacity zero succeeds", () => {
	const fixture = createFixture();
	const push = invoke(fixture, "JNINativeInterface.PushLocalFrame", [ENVIRONMENT, 0n]);
	assert.equal(push.result.returnCode, -1);
	assert.equal(push.registerValue, 0xffffffffn);
	const ensure = invoke(fixture, "JNINativeInterface.EnsureLocalCapacity", [ENVIRONMENT, 0n]);
	assert.equal(ensure.result.returnCode, 0);
	assert.equal(ensure.registerValue, 0n);
});

function createFixture() {
	const references = createJniGuestReferences();
	const registry = createNativeHostImportRegistry();
	registerFlutterJniReferenceHandlers(registry, {
		jniEnvironment: Object.freeze({ environmentAddress: ENVIRONMENT.toString() }),
		jniReferences: references
	});
	return {
		references,
		registers: createAarch64Registers(),
		registry,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD_A })
	};
}

function invoke(fixture, name, args) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	args.forEach((value, index) => fixture.registers.write(index, value));
	const handled = fixture.registry.handle(
		Object.freeze({ name }),
		Object.freeze({
			registers: fixture.registers,
			systemRegisters: fixture.systemRegisters
		})
	);
	assert.equal(handled.handled, true);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	return Object.freeze({
		registerValue: fixture.registers.read(0),
		result: handled.result
	});
}
