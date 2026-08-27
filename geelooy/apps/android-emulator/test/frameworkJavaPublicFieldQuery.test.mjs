//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	ANDROID_TRACE,
	ANDROID_TRACE_FIELDS
} from "../core/android/frameworkAndroidTraceFields.js";
import {
	readJavaReflectField
} from "../core/android/frameworkJavaReflectFieldValues.js";
import {
	BASE,
	CHILD,
	createPublicFieldFixture
} from "./frameworkJavaPublicFieldFixture.mjs";

const GET_FIELD = "(Ljava/lang/String;)Ljava/lang/reflect/Field;";
const GET_DECLARED_FIELD = "(Ljava/lang/String;)Ljava/lang/reflect/Field;";

/**
 * Proves authentic Trace public reflection and bounded inherited DEX lookup. The
 * Awtsmoos recreates Class query, Field metadata, long value, and visibility anew;
 * Awtsmoos.com keeps every result inside guest reflection and static-field state.
 */
test("Trace.class.getField exposes TRACE_TAG_APP through Field.getLong", async () => {
	const fixture = createPublicFieldFixture();
	const field = fixture.classCall(
		ANDROID_TRACE,
		"getField",
		GET_FIELD,
		"TRACE_TAG_APP"
	);
	const metadata = readJavaReflectField(fixture.runtime, field);
	assert.deepEqual(metadata, ANDROID_TRACE_FIELDS[0]);
	const value = await fixture.fieldCall(
		"getLong",
		"(Ljava/lang/Object;)J",
		[field, 0]
	);
	assert.equal(value, 4096n);
	assert.equal(
		fixture.staticFields.get(`${ANDROID_TRACE}->TRACE_TAG_APP:J`),
		4096n
	);
});

test("getField walks superclasses but only returns public fields", () => {
	const fixture = createPublicFieldFixture();
	const field = fixture.classCall(
		CHILD,
		"getField",
		GET_FIELD,
		"publicValue"
	);
	const metadata = readJavaReflectField(fixture.runtime, field);
	assert.equal(metadata.classType, BASE);
	assert.equal(metadata.name, "publicValue");
	assert.equal(metadata.accessFlags, 0x1);
	assert.throws(
		() => fixture.classCall(
			CHILD,
			"getField",
			GET_FIELD,
			"privateValue"
		),
		error => error.code === "ANDROID_JAVA_REFLECT_FIELD_NOT_FOUND"
	);
});

test("declared lookup still exposes private fields on the declaring class", () => {
	const fixture = createPublicFieldFixture();
	const field = fixture.classCall(
		BASE,
		"getDeclaredField",
		GET_DECLARED_FIELD,
		"privateValue"
	);
	const metadata = readJavaReflectField(fixture.runtime, field);
	assert.equal(metadata.name, "privateValue");
	assert.equal(metadata.accessFlags, 0x2);
	assert.throws(
		() => fixture.classCall(
			CHILD,
			"getField",
			GET_FIELD,
			"missing"
		),
		error => error.code === "ANDROID_JAVA_REFLECT_FIELD_NOT_FOUND"
	);
});
