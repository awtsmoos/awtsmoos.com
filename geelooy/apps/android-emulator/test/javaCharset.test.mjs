//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	charsetForName,
	charsetMetadata,
	createFrameworkJavaCharsetMethods
} from "../core/android/frameworkJavaCharsets.js";
import { readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves Java Charset aliases and immutable identity. The Awtsmoos renews name,
 * encoding label, and singleton; Awtsmoos.com establishes one canonical bridge
 * for arbitrary APK message codecs and future buffer conversion.
 */
test("Charset normalizes UTF-8 aliases to one singleton", () => {
	const fixture = createCharsetFixture();
	const compact = fixture.call(
		"forName",
		"(Ljava/lang/String;)Ljava/nio/charset/Charset;",
		["UTF8"]
	);
	const canonical = charsetForName(fixture.runtime, "utf-8");
	assert.equal(compact, canonical);
	assert.deepEqual(
		charsetMetadata(fixture.runtime, canonical),
		{ encoding: "utf-8", name: "UTF-8" }
	);
});

test("Charset reports support, names, and default UTF-8", () => {
	const fixture = createCharsetFixture();
	assert.equal(fixture.call("isSupported", "(Ljava/lang/String;)Z", ["ASCII"]), 1);
	assert.equal(fixture.call("isSupported", "(Ljava/lang/String;)Z", ["X-UNKNOWN"]), 0);
	const value = fixture.call("defaultCharset", "()Ljava/nio/charset/Charset;", []);
	const name = fixture.call("name", "()Ljava/lang/String;", [value]);
	assert.equal(readGuestText(fixture.runtime, name), "UTF-8");
});

test("Charset preserves identity and canonical lexical order", () => {
	const fixture = createCharsetFixture();
	const ascii = charsetForName(fixture.runtime, "US-ASCII");
	const utf8 = charsetForName(fixture.runtime, "UTF-8");
	assert.equal(fixture.call(
		"equals",
		"(Ljava/lang/Object;)Z",
		[ascii, ascii]
	), 1);
	assert.equal(fixture.call(
		"equals",
		"(Ljava/lang/Object;)Z",
		[ascii, utf8]
	), 0);
	assert.ok(fixture.call(
		"compareTo",
		"(Ljava/nio/charset/Charset;)I",
		[ascii, utf8]
	) < 0);
	assert.equal(fixture.call("hashCode", "()I", [utf8]), utf8.id);
});

function createCharsetFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkJavaCharsetMethods(runtime);
	return Object.freeze({
		call(name, descriptor, args) {
			return methods.invoke(methodRecord(name, descriptor), args);
		},
		runtime
	});
}

function methodRecord(name, descriptor) {
	const classType = "Ljava/nio/charset/Charset;";
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
