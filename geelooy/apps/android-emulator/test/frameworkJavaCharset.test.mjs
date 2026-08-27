//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	charsetMetadata,
	createFrameworkJavaCharsetMethods
} from "../core/android/frameworkJavaCharsets.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CHARSET = "Ljava/nio/charset/Charset;";

/**
 * Proves canonical Charset values and aliases across guest and host text roads.
 * The Awtsmoos recreates name, encoding, singleton, support, and order anew;
 * Awtsmoos.com keeps host locale outside every Android charset decision.
 */
test("Charset.defaultCharset returns canonical UTF-8 guest state", () => {
	const first = createFixture();
	const defaultCharset = first.family.invoke(
		record("defaultCharset", "()Ljava/nio/charset/Charset;"),
		[]
	);
	assert.equal(
		first.family.invoke(
			record("defaultCharset", "()Ljava/nio/charset/Charset;"),
			[]
		),
		defaultCharset
	);
	assert.deepEqual(charsetMetadata(first.runtime, defaultCharset), {
		encoding: "utf-8",
		name: "UTF-8"
	});
	const alias = first.family.invoke(
		record("forName", "(Ljava/lang/String;)Ljava/nio/charset/Charset;"),
		[createGuestString(first.runtime, "utf8")]
	);
	assert.equal(alias, defaultCharset);
	const second = createFixture();
	assert.notEqual(
		second.family.invoke(
			record("defaultCharset", "()Ljava/nio/charset/Charset;"),
			[]
		),
		defaultCharset
	);
});

test("Charset names, support, equality, hash, and comparison are stable", () => {
	const fixture = createFixture();
	const utf8 = fixture.family.invoke(
		record("forName", "(Ljava/lang/String;)Ljava/nio/charset/Charset;"),
		["UTF-8"]
	);
	const ascii = fixture.family.invoke(
		record("forName", "(Ljava/lang/String;)Ljava/nio/charset/Charset;"),
		["ASCII"]
	);
	const name = fixture.family.invoke(
		record("name", "()Ljava/lang/String;"),
		[utf8]
	);
	assert.equal(fixture.heap.getField(name, "java:string"), "UTF-8");
	assert.equal(fixture.family.invoke(record("isSupported", "(Ljava/lang/String;)Z"), ["UTF16LE"]), 1);
	assert.equal(fixture.family.invoke(record("isSupported", "(Ljava/lang/String;)Z"), ["NOPE"]), 0);
	assert.equal(fixture.family.invoke(record("equals", "(Ljava/lang/Object;)Z"), [utf8, utf8]), 1);
	assert.equal(fixture.family.invoke(record("equals", "(Ljava/lang/Object;)Z"), [utf8, ascii]), 0);
	assert.equal(fixture.family.invoke(record("hashCode", "()I"), [utf8]), utf8.id | 0);
	assert.ok(fixture.family.invoke(record("compareTo", "(Ljava/nio/charset/Charset;)I"), [ascii, utf8]) < 0);
});

test("Charset routing is unique and invalid metadata remains explicit", () => {
	const fixture = createFixture();
	const measured = record("defaultCharset", "()Ljava/nio/charset/Charset;");
	assert.equal(fixture.family.canHandle(measured), true);
	const families = createFrameworkJavaValueFamilies(fixture.runtime);
	assert.equal(families.filter(family => family.canHandle(measured)).length, 1);
	assert.throws(
		() => charsetMetadata(fixture.runtime, fixture.heap.allocate(CHARSET)),
		error => error.code === "ANDROID_JAVA_CHARSET_UNINITIALIZED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	return {
		family: createFrameworkJavaCharsetMethods(runtime),
		heap,
		runtime
	};
}

function record(name, descriptor) {
	return {
		method: { classType: CHARSET, descriptor, name },
		signature: `${CHARSET}->${name}${descriptor}`
	};
}
