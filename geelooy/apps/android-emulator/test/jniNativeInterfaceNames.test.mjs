//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { jniNativeInterfaceSlotName } from "../core/native/jniNativeInterfaceNames.js";

/**
 * Proves Android-era JNI diagnostics name every fixed interface-table doorway.
 * The Awtsmoos gives each slot a semantic lantern while Awtsmoos.com keeps
 * reserved and future positions numeric, never confusing a name with support.
 */
test("JNI interface names cover every Android-era standard slot", () => {
	for (let slot = 4; slot <= 232; slot += 1) {
		assert.notEqual(jniNativeInterfaceSlotName(slot), `slot-${slot}`);
	}
});

test("JNI interface names preserve fixed linkage landmarks", () => {
	const landmarks = new Map([
		[4, "GetVersion"],
		[19, "PushLocalFrame"],
		[26, "EnsureLocalCapacity"],
		[33, "GetMethodID"],
		[94, "GetFieldID"],
		[113, "GetStaticMethodID"],
		[144, "GetStaticFieldID"],
		[163, "NewString"],
		[171, "GetArrayLength"],
		[215, "RegisterNatives"],
		[228, "ExceptionCheck"],
		[232, "GetObjectRefType"]
	]);
	for (const [slot, name] of landmarks) {
		assert.equal(jniNativeInterfaceSlotName(slot), name);
	}
});

test("JNI interface names retain numeric fallback outside the mapped era", () => {
	assert.equal(jniNativeInterfaceSlotName(3), "slot-3");
	assert.equal(jniNativeInterfaceSlotName(233), "slot-233");
});
