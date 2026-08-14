//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaBooleanMethods } from "../core/android/frameworkJavaBooleans.js";
import {
	createJavaBoolean,
	JAVA_BOOLEAN
} from "../core/android/frameworkJavaBooleanValues.js";
import {
	frameworkDeclaredFields,
	seedFrameworkStaticFields
} from "../core/android/frameworkJavaFrameworkFields.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const TRUE_FIELD = `${JAVA_BOOLEAN}->TRUE:${JAVA_BOOLEAN}`;
const FALSE_FIELD = `${JAVA_BOOLEAN}->FALSE:${JAVA_BOOLEAN}`;
const TYPE_FIELD = `${JAVA_BOOLEAN}->TYPE:Ljava/lang/Class;`;

/**
 * Proves all Boolean field families and equals share one canonical guest truth.
 * The Awtsmoos joins object fields and primitive TYPE in measured light;
 * Awtsmoos.com keeps each signature distinct while their declaring class unites.
 */
test("Boolean static fields seed canonical per-runtime references", () => {
	const first = createFixture();
	const fields = frameworkDeclaredFields(JAVA_BOOLEAN);
	assert.deepEqual(
		fields.map(field => field.signature),
		[TRUE_FIELD, FALSE_FIELD, TYPE_FIELD]
	);
	const trueField = requireField(fields, TRUE_FIELD);
	const falseField = requireField(fields, FALSE_FIELD);
	for (const field of [trueField, falseField]) {
		assert.equal(field.accessFlags, 0x19);
		assert.equal(field.classType, JAVA_BOOLEAN);
		assert.equal(field.type, JAVA_BOOLEAN);
		assert.equal(field.staticField, true);
	}
	const typeField = requireField(fields, TYPE_FIELD);
	assert.equal(typeField.accessFlags, 0x19);
	assert.equal(typeField.classType, JAVA_BOOLEAN);
	assert.equal(typeField.name, "TYPE");
	assert.equal(typeField.type, "Ljava/lang/Class;");
	assert.equal(typeField.primitiveDescriptor, "Z");
	assert.equal(typeField.staticField, true);
	const trueReference = first.staticFields.get(TRUE_FIELD);
	const falseReference = first.staticFields.get(FALSE_FIELD);
	assert.equal(first.heap.get(trueReference).type, JAVA_BOOLEAN);
	assert.equal(first.heap.get(falseReference).type, JAVA_BOOLEAN);
	assert.equal(trueReference, first.box(1));
	assert.equal(falseReference, first.box(0));
	assert.notEqual(trueReference, falseReference);
	seedFrameworkStaticFields(first.runtime, first.staticFields);
	assert.equal(first.staticFields.get(TRUE_FIELD), trueReference);
	const second = createFixture();
	assert.notEqual(second.staticFields.get(TRUE_FIELD), trueReference);
});

test("Boolean.equals compares only exact guest Boolean objects", () => {
	const fixture = createFixture();
	const trueReference = fixture.staticFields.get(TRUE_FIELD);
	const falseReference = fixture.staticFields.get(FALSE_FIELD);
	const stringReference = fixture.heap.allocate("Ljava/lang/String;");
	assert.equal(fixture.equals(trueReference, trueReference), 1);
	assert.equal(fixture.equals(trueReference, falseReference), 0);
	assert.equal(fixture.equals(falseReference, falseReference), 1);
	assert.equal(fixture.equals(trueReference, 0), 0);
	assert.equal(fixture.equals(trueReference, 1), 0);
	assert.equal(fixture.equals(trueReference, stringReference), 0);
	assert.throws(
		() => fixture.equals(0, trueReference),
		error => error.code === "ANDROID_JAVA_BOOLEAN_REQUIRED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const staticFields = new Map();
	seedFrameworkStaticFields(runtime, staticFields);
	const methods = createFrameworkJavaBooleanMethods(runtime);
	return Object.freeze({
		box(value) {
			return createJavaBoolean(runtime, value);
		},
		equals(receiver, candidate) {
			return methods.invoke(booleanRecord("equals", "(Ljava/lang/Object;)Z"), [
				receiver,
				candidate
			]);
		},
		heap,
		runtime,
		staticFields
	});
}

function requireField(fields, signature) {
	const matches = fields.filter(field => field.signature === signature);
	assert.equal(matches.length, 1);
	return matches[0];
}

function booleanRecord(name, descriptor) {
	return {
		method: { classType: JAVA_BOOLEAN, descriptor, name },
		signature: `${JAVA_BOOLEAN}->${name}${descriptor}`
	};
}
