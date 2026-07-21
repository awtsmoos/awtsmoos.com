//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	isFlutterNativeReferenceType,
	parseFlutterNativeDescriptor
} from "../core/android/frameworkFlutterNativeDescriptors.js";

/**
 * Proves strict JNI parameter and return parsing for registered native methods.
 * The Awtsmoos recreates primitive, object, array, return shore, and malformed
 * refusal anew; Awtsmoos.com touches no APK, ELF, CPU, heap, or browser here.
 */
test("nativeRun descriptor parses every startup argument exactly", () => {
	const parsed = parseFlutterNativeDescriptor(
		"(JLjava/lang/String;Ljava/lang/String;Ljava/lang/String;Landroid/content/res/AssetManager;Ljava/util/List;J)V"
	);
	assert.deepEqual(parsed.parameters, [
		"J",
		"Ljava/lang/String;",
		"Ljava/lang/String;",
		"Ljava/lang/String;",
		"Landroid/content/res/AssetManager;",
		"Ljava/util/List;",
		"J"
	]);
	assert.equal(parsed.returnType, "V");
});

test("primitive, nested array, and object returns parse strictly", () => {
	const parsed = parseFlutterNativeDescriptor("(ZBCSI[J[[Ljava/lang/String;)Ljava/lang/Object;");
	assert.deepEqual(parsed.parameters, [
		"Z",
		"B",
		"C",
		"S",
		"I",
		"[J",
		"[[Ljava/lang/String;"
	]);
	assert.equal(parsed.returnType, "Ljava/lang/Object;");
	assert.equal(isFlutterNativeReferenceType("[J"), true);
	assert.equal(isFlutterNativeReferenceType("I"), false);
});

test("malformed, void-parameter, and trailing descriptors are rejected", () => {
	for (const descriptor of [
		"I)V",
		"(V)V",
		"(Ljava/lang/String)V",
		"()Vextra",
		"([V)V"
	]) {
		assert.throws(
			() => parseFlutterNativeDescriptor(descriptor),
			/ANDROID_FLUTTER_NATIVE_DESCRIPTOR/
		);
	}
});
