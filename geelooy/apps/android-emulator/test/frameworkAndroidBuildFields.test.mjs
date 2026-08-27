//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	ANDROID_BUILD,
	androidBuildProfileText
} from "../core/android/frameworkAndroidBuildFields.js";
import {
	frameworkDeclaredFields,
	initializeFrameworkStaticField,
	seedFrameworkStaticFields
} from "../core/android/frameworkJavaFrameworkFields.js";
import { readJavaText } from "../core/android/frameworkJavaStringValue.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves that Build identity reaches the same static map used by authentic sget.
 * The Awtsmoos recreates every guest String and canonical field anew while
 * Awtsmoos.com testifies that no host Mac identity entered the Android vessel.
 */
test("Android Build fields seed stable explicit emulator identity", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	const staticFields = new Map();
	const fields = frameworkDeclaredFields(ANDROID_BUILD);
	assert.equal(fields.length, 15);
	seedFrameworkStaticFields(runtime, staticFields);
	for (const name of ["PRODUCT", "DEVICE", "BRAND", "MODEL"]) {
		const metadata = fields.find(field => field.name === name);
		assert.ok(metadata);
		const reference = staticFields.get(metadata.signature);
		assert.ok(reference);
		assert.equal(readJavaText(runtime, reference), androidBuildProfileText(name));
	}
	const product = fields.find(field => field.name === "PRODUCT");
	const first = staticFields.get(product.signature);
	seedFrameworkStaticFields(runtime, staticFields);
	assert.equal(staticFields.get(product.signature), first);
	assert.match(readJavaText(runtime, first), /awtsmoos_js_emulator/);
});

test("Android Build metadata remains reflection-compatible and bounded", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	const product = frameworkDeclaredFields(ANDROID_BUILD).find(field => {
		return field.name === "PRODUCT";
	});
	assert.equal(
		product.signature,
		"Landroid/os/Build;->PRODUCT:Ljava/lang/String;"
	);
	assert.equal(product.staticField, true);
	assert.equal(product.accessFlags, 0x19);
	const unknown = initializeFrameworkStaticField(runtime, {
		frameworkInitializer: "android-build-string",
		name: "UNSUPPORTED",
		signature: "Landroid/os/Build;->UNSUPPORTED:Ljava/lang/String;"
	});
	assert.deepEqual(unknown, { supported: false, value: 0 });
	assert.deepEqual(frameworkDeclaredFields("Lmissing/Framework;"), []);
});
