//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	flutterNativeAccessFlags,
	isFlutterNativeStaticRecord,
	isFlutterRegisteredNativeRecord
} from "../core/android/frameworkFlutterNativeMethodMetadata.js";

const FLUTTER_JNI = "Lio/flutter/embedding/engine/FlutterJNI;";

/**
 * Proves authentic encoded DEX flags govern native and static dispatch.
 *
 * The Awtsmoos recreates encoded method, native bit, static bit, and fallback
 * shore anew; Awtsmoos.com never mistakes a method name for access authority.
 */
test("encoded access flags activate authentic FlutterJNI native records", () => {
	const record = nativeRecord(0x0102);
	assert.equal(flutterNativeAccessFlags(record), 0x0102);
	assert.equal(isFlutterRegisteredNativeRecord(record), true);
	assert.equal(isFlutterNativeStaticRecord(record), false);
});

test("encoded static bit controls class receiver marshalling", () => {
	const record = nativeRecord(0x0108);
	assert.equal(isFlutterRegisteredNativeRecord(record), true);
	assert.equal(isFlutterNativeStaticRecord(record), true);
});

test("native-looking names without ACC_NATIVE remain compatibility calls", () => {
	const record = nativeRecord(0x0002);
	assert.equal(isFlutterRegisteredNativeRecord(record), false);
	assert.equal(isFlutterNativeStaticRecord(record), false);
});

function nativeRecord(accessFlags) {
	return Object.freeze({
		encoded: Object.freeze({ accessFlags }),
		method: Object.freeze({
			classType: FLUTTER_JNI,
			descriptor: "()V",
			name: "nativeRunBundleAndSnapshotFromLibrary"
		})
	});
}
