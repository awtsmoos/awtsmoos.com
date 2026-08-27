//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readGuestText } from "../core/android/guestText.js";
import { createFrameworkJavaObjectMethods } from "../core/android/frameworkJavaObjects.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves Java Enum identity, ordinal ordering, and declaring class. The Awtsmoos
 * renews constant name, ordinal, and immutable type garment; Awtsmoos.com records
 * generic Java behavior without AndroidX or application-specific branches.
 */
test("Enum constructor preserves name, ordinal, and declaring class", () => {
	const fixture = createEnumFixture();
	const destroyed = fixture.constant("DESTROYED", 0);
	assert.equal(fixture.call("ordinal", "()I", [destroyed]), 0);
	assert.equal(
		readGuestText(fixture.runtime, fixture.call("name", "()Ljava/lang/String;", [destroyed])),
		"DESTROYED"
	);
	assert.equal(
		readGuestText(fixture.runtime, fixture.call("toString", "()Ljava/lang/String;", [destroyed])),
		"DESTROYED"
	);
	assert.deepEqual(
		fixture.call("getDeclaringClass", "()Ljava/lang/Class;", [destroyed]),
		{
			descriptor: "Ltest/LifecycleState;",
			kind: "dalvik-class"
		}
	);
});

test("Enum comparison and identity follow Java rules", () => {
	const fixture = createEnumFixture();
	const destroyed = fixture.constant("DESTROYED", 0);
	const created = fixture.constant("CREATED", 1);
	assert.equal(fixture.call("compareTo", "(Ljava/lang/Enum;)I", [destroyed, created]), -1);
	assert.equal(fixture.call("equals", "(Ljava/lang/Object;)Z", [destroyed, destroyed]), 1);
	assert.equal(fixture.call("equals", "(Ljava/lang/Object;)Z", [destroyed, created]), 0);
	assert.equal(fixture.call("hashCode", "()I", [destroyed]), destroyed.id);
});

test("Enum rejects invalid ordinals and cross-type comparison", () => {
	const fixture = createEnumFixture();
	assert.throws(
		() => fixture.constant("BROKEN", -1),
		error => error.code === "ANDROID_JAVA_ENUM_ORDINAL_INVALID"
	);
	const left = fixture.constant("LEFT", 0);
	const right = fixture.constant("RIGHT", 0, "Ltest/OtherState;");
	assert.throws(
		() => fixture.call("compareTo", "(Ljava/lang/Enum;)I", [left, right]),
		error => error.code === "ANDROID_JAVA_ENUM_TYPE_MISMATCH"
	);
});

function createEnumFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkJavaObjectMethods(runtime);
	const call = (name, descriptor, args) => methods.invoke(
		methodRecord(name, descriptor),
		args
	);
	return Object.freeze({
		call,
		constant(name, ordinal, type = "Ltest/LifecycleState;") {
			const reference = heap.allocate(type);
			call("<init>", "(Ljava/lang/String;I)V", [reference, name, ordinal]);
			return reference;
		},
		heap,
		runtime
	});
}

function methodRecord(name, descriptor) {
	const classType = "Ljava/lang/Enum;";
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
