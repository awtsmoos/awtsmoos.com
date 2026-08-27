//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createGuestString } from "../core/android/guestText.js";
import { createFrameworkAndroidWindowInsetsMethods } from "../core/android/frameworkAndroidWindowInsets.js";
import { ANDROID_WINDOW_INSETS } from "../core/android/frameworkAndroidWindowInsetsValues.js";
import { createFrameworkJavaClassMethods } from "../core/android/frameworkJavaClasses.js";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { seedFrameworkStaticFields } from "../core/android/frameworkJavaFrameworkFields.js";
import { createFrameworkJavaReflectFieldMethods } from "../core/android/frameworkJavaReflectFields.js";

const CLASS = "Ljava/lang/Class;";
const FIELD = "Ljava/lang/reflect/Field;";
const CONSUMED = `${ANDROID_WINDOW_INSETS}->CONSUMED:${ANDROID_WINDOW_INSETS}`;

/**
 * Proves framework reflection and direct static access share one Android value.
 * The Awtsmoos renews declaration, singleton, consumed state, and inset edge;
 * Awtsmoos.com exposes measured framework metadata instead of a reflection fake.
 */
test("WindowInsets.CONSUMED is reflected as the seeded consumed singleton", async () => {
	const fixture = createWindowInsetsFixture();
	const field = fixture.classFamily.invoke(record(
		CLASS,
		"getDeclaredField",
		"(Ljava/lang/String;)Ljava/lang/reflect/Field;"
	), [
		createDalvikClassValue(ANDROID_WINDOW_INSETS),
		createGuestString(fixture.runtime, "CONSUMED")
	]);
	assert.equal(await fixture.fieldCall("getModifiers", "()I", [field]), 0x19);
	assert.deepEqual(
		await fixture.fieldCall("getType", "()Ljava/lang/Class;", [field]),
		createDalvikClassValue(ANDROID_WINDOW_INSETS)
	);
	const reflected = await fixture.fieldCall(
		"get",
		"(Ljava/lang/Object;)Ljava/lang/Object;",
		[field, 0]
	);
	assert.equal(reflected, fixture.staticFields.get(CONSUMED));
	assert.equal(await fixture.fieldCall(
		"get",
		"(Ljava/lang/Object;)Ljava/lang/Object;",
		[field, 0]
	), reflected);
	assert.equal(fixture.insetsCall("isConsumed", "()Z", [reflected]), 1);
	assert.equal(
		fixture.insetsCall("getSystemWindowInsetLeft", "()I", [reflected]),
		0
	);
});

test("WindowInsets copies preserve consumed identity semantics", () => {
	const fixture = createWindowInsetsFixture();
	const consumed = fixture.staticFields.get(CONSUMED);
	const copy = fixture.heap.allocate(ANDROID_WINDOW_INSETS);
	fixture.insetsCall(
		"<init>",
		`(${ANDROID_WINDOW_INSETS})V`,
		[copy, consumed]
	);
	assert.equal(fixture.insetsCall(
		"equals",
		"(Ljava/lang/Object;)Z",
		[copy, consumed]
	), 1);
	assert.equal(fixture.insetsCall("isConsumed", "()Z", [copy]), 1);
});

function createWindowInsetsFixture() {
	const heap = createDalvikObjectHeap();
	const staticFields = new Map();
	const runtime = {
		heap,
		registry: {
			classDefinition() {
				return null;
			}
		},
		staticFields
	};
	seedFrameworkStaticFields(runtime, staticFields);
	const classFamily = createFrameworkJavaClassMethods(runtime);
	const fieldFamily = createFrameworkJavaReflectFieldMethods(runtime);
	const insetsFamily = createFrameworkAndroidWindowInsetsMethods(runtime);
	const context = {
		ensureClassInitialized() {},
		staticFields
	};
	return {
		classFamily,
		fieldCall(name, descriptor, args) {
			return fieldFamily.invoke(record(FIELD, name, descriptor), args, null, context);
		},
		heap,
		insetsCall(name, descriptor, args) {
			return insetsFamily.invoke(record(
				ANDROID_WINDOW_INSETS,
				name,
				descriptor
			), args);
		},
		runtime,
		staticFields
	};
}

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
