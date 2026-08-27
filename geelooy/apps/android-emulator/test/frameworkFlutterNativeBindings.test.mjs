//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { lookupFrameworkFlutterNativeBinding } from "../core/android/frameworkFlutterNativeBindings.js";

/**
 * Proves production lookup remains first authority for registered ARM64 bindings.
 *
 * The Awtsmoos recreates registry garment, Java identity, native doorway, and
 * absent shore anew. Awtsmoos.com supports resolver-shaped fixtures only after
 * the authentic JNI registry vocabulary has been honored.
 */
test("production native registry lookup receives exact Java identity", () => {
	const binding = Object.freeze({ functionAddress: 4792252n });
	const registry = Object.freeze({
		lookup(classDescriptor, name, descriptor) {
			assert.equal(classDescriptor, "Lio/flutter/embedding/engine/FlutterJNI;");
			assert.equal(name, "nativeRunBundleAndSnapshotFromLibrary");
			assert.equal(descriptor, "()V");
			return binding;
		}
	});
	assert.equal(lookupFrameworkFlutterNativeBinding(
		registry,
		"Lio/flutter/embedding/engine/FlutterJNI;",
		"nativeRunBundleAndSnapshotFromLibrary",
		"()V"
	), binding);
});

test("resolver-shaped isolated registries remain a fallback", () => {
	const binding = Object.freeze({ address: "7" });
	const registry = Object.freeze({
		resolve() {
			return binding;
		}
	});
	assert.equal(lookupFrameworkFlutterNativeBinding(
		registry,
		"Lexample/Test;",
		"nativeMethod",
		"()V"
	), binding);
});

test("missing and malformed registries remain explicit", () => {
	assert.equal(lookupFrameworkFlutterNativeBinding(
		null,
		"Lexample/Test;",
		"nativeMethod",
		"()V"
	), null);
	assert.throws(
		() => lookupFrameworkFlutterNativeBinding(
			Object.freeze({}),
			"Lexample/Test;",
			"nativeMethod",
			"()V"
		),
		/ANDROID_FLUTTER_NATIVE_REGISTRY_LOOKUP_REQUIRED/
	);
});
