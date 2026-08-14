//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaLongMethods } from "../core/android/frameworkJavaLongs.js";
import { readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap, isDalvikReference } from "../core/dalvik/objectHeap.js";

/**
 * Proves exact Java Long scalar truth and guest wrapper identity. The Awtsmoos
 * renews bit and vessel without confusing their light; Awtsmoos.com keeps every
 * signed value exact while object-returning methods remain heap references.
 */
test("Long.valueOf returns exact cached guest wrappers", () => {
	const fixture = createLongFixture();
	for (const value of [
		9223372036854775807n,
		-9223372036854775808n,
		9223372036854775808n
	]) {
		const reference = fixture.box(value);
		assert.equal(isDalvikReference(reference), true);
		assert.equal(fixture.heap.get(reference).type, "Ljava/lang/Long;");
		assert.equal(fixture.value(reference), BigInt.asIntN(64, value));
	}
	assert.equal(fixture.box(-128n), fixture.box(-128n));
	assert.equal(fixture.box(127n), fixture.box(127n));
	assert.notEqual(fixture.box(128n), fixture.box(128n));
});

test("Long conversions, comparison, equality, and hash follow Java", () => {
	const fixture = createLongFixture();
	assert.equal(fixture.instance("intValue", "()I", fixture.box(4294967297n)), 1);
	assert.equal(fixture.instance("shortValue", "()S", fixture.box(65535n)), -1);
	assert.equal(fixture.instance("byteValue", "()B", fixture.box(255n)), -1);
	assert.equal(fixture.value(fixture.box(-7n)), -7n);
	assert.equal(fixture.call("compare", "(JJ)I", [1n, 0, 2n, 0]), -1);
	assert.equal(fixture.call("compare", "(JJ)I", [2n, 0, 1n, 0]), 1);
	assert.equal(fixture.call("hashCode", "(J)I", [4294967296n, 0]), 1);
	assert.equal(fixture.instance(
		"equals",
		"(Ljava/lang/Object;)Z",
		fixture.box(5n),
		[fixture.box(5n)]
	), 1);
	assert.equal(fixture.instance(
		"compareTo",
		"(Ljava/lang/Long;)I",
		fixture.box(5n),
		[fixture.box(6n)]
	), -1);
});

test("Long constructor and text remain exact", () => {
	const fixture = createLongFixture();
	const reference = fixture.heap.allocate("Ljava/lang/Long;");
	fixture.call("<init>", "(J)V", [reference, 9007199254740993n, 0]);
	assert.equal(fixture.value(reference), 9007199254740993n);
	const text = fixture.instance("toString", "()Ljava/lang/String;", reference);
	assert.equal(readGuestText(fixture.runtime, text), "9007199254740993");
	const staticText = fixture.call(
		"toString",
		"(J)Ljava/lang/String;",
		[-11n, 0]
	);
	assert.equal(readGuestText(fixture.runtime, staticText), "-11");
});

test("Long rejects unsafe host numbers and unsupported methods", () => {
	const fixture = createLongFixture();
	assert.throws(
		() => fixture.box(Number.MAX_SAFE_INTEGER + 1),
		error => error.code === "ANDROID_JAVA_LONG_INVALID"
	);
	assert.throws(
		() => fixture.call("rotateLeft", "(JI)J", [1n, 0, 2]),
		error => error.code === "ANDROID_JAVA_LONG_METHOD_UNSUPPORTED"
	);
});

function createLongFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkJavaLongMethods(runtime);
	const call = (name, descriptor, args) => methods.invoke(
		methodRecord(name, descriptor),
		args
	);
	return Object.freeze({
		box(value) {
			return call("valueOf", "(J)Ljava/lang/Long;", [value, 0]);
		},
		call,
		heap,
		instance(name, descriptor, receiver, extra = []) {
			return call(name, descriptor, [receiver, ...extra]);
		},
		runtime,
		value(reference) {
			return call("longValue", "()J", [reference]);
		}
	});
}

function methodRecord(name, descriptor) {
	const classType = "Ljava/lang/Long;";
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
