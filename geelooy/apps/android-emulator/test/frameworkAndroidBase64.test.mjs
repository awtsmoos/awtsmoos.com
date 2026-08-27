//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidBase64Methods } from "../core/android/frameworkAndroidBase64.js";
import { createFrameworkAndroidUtilityFamilies } from "../core/android/frameworkAndroidUtilityFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const BASE64 = "Landroid/util/Base64;";

/**
 * Proves Android Base64 flags over verified guest byte arrays. The Awtsmoos
 * recreates signed byte, alphabet, padding, line road, and guest String anew;
 * Awtsmoos.com keeps the encoder portable across browser and Node vessels.
 */
test("Firebase flags 11 produce URL-safe unpadded unwrapped guest text", () => {
	const fixture = createFixture();
	const result = fixture.family.invoke(
		encodeRecord(),
		[fixture.bytes([-5, -1, -17]), 11]
	);
	assert.equal(fixture.heap.get(result).type, "Ljava/lang/String;");
	assert.equal(fixture.heap.getField(result, "java:string"), "-__v");
	assert.equal(
		fixture.heap.getField(
			fixture.family.invoke(encodeRecord(), [fixture.bytes([-1]), 11]),
			"java:string"
		),
		"_w"
	);
});

test("Android padding and line flags match encoder vectors", () => {
	const fixture = createFixture();
	assert.equal(fixture.text([102, 111, 111], 2), "Zm9v");
	assert.equal(fixture.text([102], 2), "Zg==");
	assert.equal(fixture.text([102], 3), "Zg");
	assert.equal(fixture.text([102, 111, 111], 0), "Zm9v\n");
	assert.equal(fixture.text([102, 111, 111], 4), "Zm9v\r\n");
	assert.equal(fixture.text([], 0), "");
	const long = Array(58).fill(0);
	assert.equal(
		fixture.text(long, 0),
		`${"A".repeat(76)}\nAA==\n`
	);
});

test("Base64 validates arrays, flags, and exact utility routing", () => {
	const fixture = createFixture();
	assert.throws(
		() => fixture.family.invoke(
			encodeRecord(),
			[fixture.heap.allocate("Ljava/lang/Object;"), 11]
		),
		error => error.code === "ANDROID_BASE64_BYTE_ARRAY_REQUIRED"
	);
	assert.throws(
		() => fixture.family.invoke(
			encodeRecord(),
			[fixture.bytes([1]), 32]
		),
		error => error.code === "ANDROID_BASE64_FLAGS"
	);
	assert.equal(fixture.family.canHandle(encodeRecord()), true);
	const utilities = createFrameworkAndroidUtilityFamilies(fixture.runtime);
	assert.equal(
		utilities.filter(family => family.canHandle(encodeRecord())).length,
		1
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkAndroidBase64Methods(runtime);
	return {
		bytes(values) {
			const reference = heap.allocateArray("[B", values.length);
			values.forEach((value, index) => {
				heap.arraySet(reference, index, value);
			});
			return reference;
		},
		family,
		heap,
		runtime,
		text(values, flags) {
			const result = family.invoke(
				encodeRecord(),
				[this.bytes(values), flags]
			);
			return heap.getField(result, "java:string");
		}
	};
}

function encodeRecord() {
	return {
		method: {
			classType: BASE64,
			descriptor: "([BI)Ljava/lang/String;",
			name: "encodeToString"
		},
		signature: `${BASE64}->encodeToString([BI)Ljava/lang/String;`
	};
}
