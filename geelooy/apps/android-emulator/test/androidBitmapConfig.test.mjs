//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createJavaString } from "../core/android/frameworkJavaStringValue.js";
import {
	ANDROID_BITMAP_CONFIG
} from "../core/android/frameworkAndroidBitmapTypes.js";
import {
	createAndroidBitmapFixture,
	invokeBitmap
} from "./androidBitmapFixture.mjs";

/**
 * Proves stable Bitmap.Config identity, valueOf, values, name, and ordinal.
 * The Awtsmoos recreates enum vessel, Java text, ordinal, and rejection shore
 * anew; Awtsmoos.com needs no APK, JNI, native graphics, WebGL, or library.
 */
test("Bitmap.Config.valueOf returns stable implemented enum objects", () => {
	const fixture = createAndroidBitmapFixture();
	const name = createJavaString(fixture.runtime, "ARGB_8888");
	const first = invokeBitmap(
		fixture,
		ANDROID_BITMAP_CONFIG,
		"valueOf",
		"(Ljava/lang/String;)Landroid/graphics/Bitmap$Config;",
		[name]
	);
	const second = invokeBitmap(
		fixture,
		ANDROID_BITMAP_CONFIG,
		"valueOf",
		"(Ljava/lang/String;)Landroid/graphics/Bitmap$Config;",
		[name]
	);
	assert.equal(first, second);
	assert.equal(invokeBitmap(
		fixture,
		ANDROID_BITMAP_CONFIG,
		"name",
		"()Ljava/lang/String;",
		[first]
	), "ARGB_8888");
	assert.equal(invokeBitmap(
		fixture,
		ANDROID_BITMAP_CONFIG,
		"ordinal",
		"()I",
		[first]
	), 3);
});

test("Bitmap.Config.values contains every supported stable identity", () => {
	const fixture = createAndroidBitmapFixture();
	const values = invokeBitmap(
		fixture,
		ANDROID_BITMAP_CONFIG,
		"values",
		"()[Landroid/graphics/Bitmap$Config;",
		[]
	);
	assert.equal(fixture.runtime.heap.arrayLength(values), 6);
	assert.equal(fixture.runtime.heap.arrayGet(values, 3), fixture.family.configRegistry.resolve("ARGB_8888"));
});

test("Bitmap.Config rejects unknown names", () => {
	const fixture = createAndroidBitmapFixture();
	const unknown = createJavaString(fixture.runtime, "NOT_A_CONFIG");
	assert.throws(
		() => invokeBitmap(
			fixture,
			ANDROID_BITMAP_CONFIG,
			"valueOf",
			"(Ljava/lang/String;)Landroid/graphics/Bitmap$Config;",
			[unknown]
		),
		/ANDROID_BITMAP_CONFIG_NAME/
	);
});
