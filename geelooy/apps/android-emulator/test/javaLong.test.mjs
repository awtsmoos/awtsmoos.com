//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaObjectMethods } from "../core/android/frameworkJavaObjects.js";
import { readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves exact Java Long boxing across Dalvik wide-register layouts. The Awtsmoos
 * renews bit, wrapper, comparison, and text; Awtsmoos.com refuses every precision
 * loss that would arise from translating signed sixty-four-bit values to Number.
 */
test("Long.valueOf preserves signed 64-bit extremes", () => {
	const fixture = createLongFixture();
	assert.equal(fixture.call(
		"valueOf",
		"(J)Ljava/lang/Long;",
		[9223372036854775807n, 0]
	), 9223372036854775807n);
	assert.equal(fixture.call(
		"valueOf",
		"(J)Ljava/lang/Long;",
		[-9223372036854775808n, 0]
	), -9223372036854775808n);
	assert.equal(fixture.call(
		"valueOf",
		"(J)Ljava/lang/Long;",
		[9223372036854775808n, 0]
	), -9223372036854775808n);
});

test("Long conversions, comparison, and hash code follow Java rules", () => {
	const fixture = createLongFixture();
	assert.equal(fixture.instance("intValue", "()I", 4294967297n), 1);
	assert.equal(fixture.instance("shortValue", "()S", 65535n), -1);
	assert.equal(fixture.instance("byteValue", "()B", 255n), -1);
	assert.equal(fixture.instance("longValue", "()J", -7n), -7n);
	assert.equal(fixture.call("compare", "(JJ)I", [1n, 0, 2n, 0]), -1);
	assert.equal(fixture.call("compare", "(JJ)I", [2n, 0, 1n, 0]), 1);
	assert.equal(fixture.call("hashCode", "(J)I", [4294967296n, 0]), 1);
	assert.equal(fixture.instance("equals", "(Ljava/lang/Object;)Z", 5n, [5n]), 1);
	assert.equal(fixture.instance("equals", "(Ljava/lang/Object;)Z", 5n, [6n]), 0);
});

test("Long constructor wrappers and text remain exact", () => {
	const fixture = createLongFixture();
	const reference = fixture.heap.allocate("Ljava/lang/Long;");
	fixture.call("<init>", "(J)V", [reference, 9007199254740993n, 0]);
	assert.equal(fixture.instance("longValue", "()J", reference), 9007199254740993n);
	assert.equal(fixture.instance(
		"compareTo",
		"(Ljava/lang/Long;)I",
		reference,
		[9007199254740994n]
	), -1);
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
		() => fixture.call("valueOf", "(J)Ljava/lang/Long;", [Number.MAX_SAFE_INTEGER + 1, 0]),
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
	const methods = createFrameworkJavaObjectMethods(runtime);
	const call = (name, descriptor, args) => methods.invoke(
		methodRecord(name, descriptor),
		args
	);
	return Object.freeze({
		call,
		heap,
		instance(name, descriptor, receiver, extra = []) {
			return call(name, descriptor, [receiver, ...extra]);
		},
		runtime
	});
}

function methodRecord(name, descriptor) {
	const classType = "Ljava/lang/Long;";
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
