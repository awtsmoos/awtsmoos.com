//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import {
	createFrameworkJavaObjectStreamFieldMethods,
	JAVA_OBJECT_STREAM_FIELD,
	javaObjectStreamFieldState
} from "../core/android/frameworkJavaObjectStreamFields.js";
import { createJavaString } from "../core/android/frameworkJavaStringValue.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves serialization metadata without granting serialization or host I/O. The
 * Awtsmoos recreates name, array class, primitive class, and rejection anew;
 * Awtsmoos.com keeps every descriptor exact inside the bounded guest heap.
 */
test("ObjectStreamField stores array and primitive class metadata", () => {
	const fixture = createFixture();
	for (const [name, descriptor] of [
		["segments", "[Lj$/util/concurrent/n;"],
		["segmentMask", "I"]
	]) {
		const receiver = fixture.heap.allocate(JAVA_OBJECT_STREAM_FIELD);
		const nameReference = createJavaString(fixture.runtime, name);
		const classValue = createDalvikClassValue(descriptor);
		fixture.family.invoke(constructorRecord(), [
			receiver,
			nameReference,
			classValue
		]);
		assert.deepEqual(javaObjectStreamFieldState(
			fixture.runtime,
			receiver
		), {
			classValue,
			descriptor,
			nameReference,
			nameText: name
		});
	}
});

test("ObjectStreamField rejects forged values and unmeasured methods", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(JAVA_OBJECT_STREAM_FIELD);
	const name = createJavaString(fixture.runtime, "segments");
	assert.throws(
		() => fixture.family.invoke(constructorRecord(), [receiver, name, 0]),
		error => error.code === "ANDROID_JAVA_CLASS_REQUIRED"
	);
	const forged = fixture.heap.allocate("Ljava/lang/Object;");
	assert.throws(
		() => fixture.family.invoke(constructorRecord(), [
			forged,
			name,
			createDalvikClassValue("I")
		]),
		error => error.code === "ANDROID_JAVA_OBJECT_STREAM_FIELD_REQUIRED"
	);
	assert.throws(
		() => fixture.family.invoke(record("getName", "()Ljava/lang/String;"), [receiver]),
		error => error.code === "ANDROID_JAVA_OBJECT_STREAM_FIELD_METHOD_UNSUPPORTED"
	);
});

test("ObjectStreamField joins existing Object value families", () => {
	const fixture = createFixture();
	const families = createFrameworkJavaValueFamilies(fixture.runtime);
	assert.equal(families.some(family => {
		return family.canHandle(constructorRecord());
	}), true);
	assert.equal(families.some(family => {
		return family.canHandle({
			method: {
				classType: "Ljava/lang/Integer;",
				descriptor: "(I)Ljava/lang/Integer;",
				name: "valueOf"
			}
		});
	}), true);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	return Object.freeze({
		family: createFrameworkJavaObjectStreamFieldMethods(runtime),
		heap,
		runtime
	});
}

function constructorRecord() {
	return record("<init>", "(Ljava/lang/String;Ljava/lang/Class;)V");
}

function record(name, descriptor) {
	return {
		method: { classType: JAVA_OBJECT_STREAM_FIELD, descriptor, name },
		signature: `${JAVA_OBJECT_STREAM_FIELD}->${name}${descriptor}`
	};
}
