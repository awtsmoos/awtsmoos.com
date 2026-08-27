//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaRegexMethods } from "../core/android/frameworkJavaRegex.js";
import { createGuestString, readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/** Proves Pattern compilation, matching, quotation, and source testimony. */
test("Pattern compiles and matches Firebase-style app identifiers", () => {
	const fixture = createFixture();
	const source = createGuestString(fixture.runtime, "^1:[0-9]+:android:[a-f0-9]+$");
	const pattern = invoke(fixture, "Pattern", "compile", [source]);
	const value = createGuestString(fixture.runtime, "1:123456:android:abcdef12");
	const matcher = invoke(fixture, "Pattern", "matcher", [pattern, value]);
	assert.equal(invoke(fixture, "Matcher", "matches", [matcher]), 1);
});

test("Pattern quote round-trips one literal expression", () => {
	const fixture = createFixture();
	const literal = createGuestString(fixture.runtime, "a+b\\E(c)");
	const quoted = invoke(fixture, "Pattern", "quote", [literal]);
	assert.match(readGuestText(fixture.runtime, quoted), /^\\Q/);
	const pattern = invoke(fixture, "Pattern", "compile", [quoted]);
	const matcher = invoke(fixture, "Pattern", "matcher", [pattern, literal]);
	assert.equal(invoke(fixture, "Matcher", "matches", [matcher]), 1);
});

test("Pattern static matches returns primitive Boolean testimony", () => {
	const fixture = createFixture();
	const source = createGuestString(fixture.runtime, "a+b");
	const value = createGuestString(fixture.runtime, "aaab");
	assert.equal(invoke(fixture, "Pattern", "matches", [source, value]), 1);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = Object.freeze({ heap });
	return Object.freeze({
		family: createFrameworkJavaRegexMethods(runtime),
		heap,
		runtime
	});
}

function invoke(fixture, type, name, args) {
	const classType = `Ljava/util/regex/${type};`;
	return fixture.family.invoke(Object.freeze({
		method: Object.freeze({ classType, name }),
		signature: `${classType}->${name}`
	}), args);
}
