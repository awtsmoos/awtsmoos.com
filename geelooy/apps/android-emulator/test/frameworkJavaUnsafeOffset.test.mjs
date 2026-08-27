//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readJavaUnsafeFieldOffset } from "../core/android/frameworkJavaUnsafeOffsets.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createDeclaredJavaField } from "../core/android/frameworkJavaReflectFieldValues.js";
import { SUN_MISC_UNSAFE } from "../core/android/frameworkJavaUnsafeValues.js";
import {
	createUnsafeOffsetFixture,
	UNSAFE_OFFSET_OWNER,
	unsafeOffsetRecord,
	unsafeRecord
} from "./frameworkJavaUnsafeOffsetFixture.mjs";

/**
 * Proves opaque runtime-local Unsafe field tokens. The Awtsmoos recreates Field,
 * signature, token, reverse testimony, and rejection anew; Awtsmoos.com grants
 * no address arithmetic, read, write, volatile, allocation, or CAS authority.
 */
test("objectFieldOffset is stable, distinct, and reversible", () => {
	const fixture = createUnsafeOffsetFixture();
	const sizeCtlA = createDeclaredJavaField(
		fixture.runtime,
		UNSAFE_OFFSET_OWNER,
		"sizeCtl"
	);
	const sizeCtlB = createDeclaredJavaField(
		fixture.runtime,
		UNSAFE_OFFSET_OWNER,
		"sizeCtl"
	);
	const baseCount = createDeclaredJavaField(
		fixture.runtime,
		UNSAFE_OFFSET_OWNER,
		"baseCount"
	);
	const first = fixture.offset(sizeCtlA);
	assert.equal(first, fixture.offset(sizeCtlB));
	assert.notEqual(first, fixture.offset(baseCount));
	assert.deepEqual(readJavaUnsafeFieldOffset(fixture.runtime, first), {
		accessFlags: 0x40,
		classType: UNSAFE_OFFSET_OWNER,
		name: "sizeCtl",
		signature: `${UNSAFE_OFFSET_OWNER}->sizeCtl:I`,
		staticField: false,
		type: "I"
	});
});

test("objectFieldOffset rejects static fields and forged receivers", () => {
	const fixture = createUnsafeOffsetFixture();
	const staticField = createDeclaredJavaField(
		fixture.runtime,
		UNSAFE_OFFSET_OWNER,
		"serialVersionUID"
	);
	assert.throws(
		() => fixture.offset(staticField),
		error => error.code === "ANDROID_JAVA_UNSAFE_INSTANCE_FIELD_REQUIRED"
	);
	const instanceField = createDeclaredJavaField(
		fixture.runtime,
		UNSAFE_OFFSET_OWNER,
		"sizeCtl"
	);
	for (const receiver of [
		fixture.heap.allocate(SUN_MISC_UNSAFE),
		fixture.heap.allocate("Ljava/lang/Object;")
	]) {
		assert.throws(
			() => fixture.family.invoke(unsafeOffsetRecord(), [receiver, instanceField]),
			error => error.code === "ANDROID_JAVA_UNSAFE_REQUIRED"
		);
	}
});

test("Unsafe family exposes only objectFieldOffset", () => {
	const fixture = createUnsafeOffsetFixture();
	const getInt = unsafeRecord("getInt", "(Ljava/lang/Object;J)I");
	assert.throws(
		() => fixture.family.invoke(getInt, [fixture.unsafe, 0, 1n]),
		error => error.code === "ANDROID_JAVA_UNSAFE_METHOD_UNSUPPORTED"
	);
	const families = createFrameworkJavaValueFamilies(fixture.runtime);
	assert.equal(
		families.filter(family => family.canHandle(unsafeOffsetRecord())).length,
		1
	);
});
