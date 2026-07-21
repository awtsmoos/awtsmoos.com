//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaClassMethods } from "../core/android/frameworkJavaClasses.js";
import {
	frameworkDeclaredFields,
	initializeFrameworkStaticField
} from "../core/android/frameworkJavaFrameworkFields.js";
import {
	createDeclaredJavaField,
	createDeclaredJavaFields,
	isJavaReflectFieldAccessible,
	readJavaReflectField
} from "../core/android/frameworkJavaReflectFieldValues.js";
import {
	javaUnsafeReference,
	SUN_MISC_UNSAFE
} from "../core/android/frameworkJavaUnsafeValues.js";
import {
	ACCESSIBLE_OBJECT,
	createUnsafeReflectionFixture,
	REFLECT_FIELD,
	reflectionRecord
} from "./frameworkJavaUnsafeReflectionFixture.mjs";

/**
 * Proves reflective retrieval of one powerless Unsafe marker. The Awtsmoos
 * recreates field, accessibility, static garment, singleton, and rejection anew;
 * Awtsmoos.com opens no memory primitive beyond this measured bootstrap road.
 */
test("Unsafe.theUnsafe reflects to one stable guest singleton", async () => {
	const fixture = createUnsafeReflectionFixture();
	const field = createDeclaredJavaField(
		fixture.runtime,
		SUN_MISC_UNSAFE,
		"theUnsafe"
	);
	assert.deepEqual(readJavaReflectField(fixture.runtime, field), {
		accessFlags: 0x1a,
		classType: SUN_MISC_UNSAFE,
		frameworkInitializer: "sun-misc-unsafe-singleton",
		name: "theUnsafe",
		signature: `${SUN_MISC_UNSAFE}->theUnsafe:${SUN_MISC_UNSAFE}`,
		staticField: true,
		type: SUN_MISC_UNSAFE
	});
	await fixture.reflect.invoke(
		reflectionRecord(ACCESSIBLE_OBJECT, "setAccessible", "(Z)V"),
		[field, 1],
		undefined,
		fixture.context
	);
	assert.equal(isJavaReflectFieldAccessible(fixture.runtime, field), 1);
	const getRecord = reflectionRecord(
		REFLECT_FIELD,
		"get",
		"(Ljava/lang/Object;)Ljava/lang/Object;"
	);
	const first = await fixture.reflect.invoke(
		getRecord,
		[field, 0],
		undefined,
		fixture.context
	);
	const second = await fixture.reflect.invoke(
		getRecord,
		[field, 0],
		undefined,
		fixture.context
	);
	assert.equal(first, second);
	assert.equal(first, javaUnsafeReference(fixture.runtime));
	assert.equal(fixture.heap.get(first).type, SUN_MISC_UNSAFE);
	assert.deepEqual(fixture.initialized, [SUN_MISC_UNSAFE, SUN_MISC_UNSAFE]);
});

test("Unsafe metadata enumerates once without granting methods", () => {
	const fixture = createUnsafeReflectionFixture();
	const fields = frameworkDeclaredFields(SUN_MISC_UNSAFE);
	assert.equal(fields.length, 1);
	const initialized = initializeFrameworkStaticField(fixture.runtime, fields[0]);
	assert.equal(initialized.supported, true);
	assert.equal(initialized.value, javaUnsafeReference(fixture.runtime));
	const array = createDeclaredJavaFields(fixture.runtime, SUN_MISC_UNSAFE);
	assert.equal(fixture.heap.arrayLength(array), 1);
	const unsafeMethod = reflectionRecord(
		SUN_MISC_UNSAFE,
		"getInt",
		"(Ljava/lang/Object;J)I"
	);
	assert.equal(fixture.reflect.canHandle(unsafeMethod), false);
	assert.equal(
		createFrameworkJavaClassMethods(fixture.runtime).canHandle(unsafeMethod),
		false
	);
});

test("AccessibleObject rejects a forged non-Field receiver", async () => {
	const fixture = createUnsafeReflectionFixture();
	const forged = fixture.heap.allocate("Ljava/lang/Object;");
	await assert.rejects(
		fixture.reflect.invoke(
			reflectionRecord(ACCESSIBLE_OBJECT, "setAccessible", "(Z)V"),
			[forged, 1],
			undefined,
			fixture.context
		),
		error => error.code === "ANDROID_JAVA_REFLECT_FIELD_REQUIRED"
	);
});
