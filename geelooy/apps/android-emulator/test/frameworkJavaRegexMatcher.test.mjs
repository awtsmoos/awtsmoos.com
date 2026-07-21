//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaRegexMethods } from "../core/android/frameworkJavaRegex.js";
import { createGuestString, readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/** Proves Matcher search, groups, reset, and replacement over guest strings. */
test("Matcher find advances and exposes captured group zero", () => {
	const fixture = createFixture("[0-9]+", "a12b34");
	assert.equal(call(fixture, "find"), 1);
	assert.equal(readGuestText(fixture.runtime, call(fixture, "group")), "12");
	assert.equal(call(fixture, "start"), 1);
	assert.equal(call(fixture, "end"), 3);
	assert.equal(call(fixture, "find"), 1);
	assert.equal(readGuestText(fixture.runtime, call(fixture, "group")), "34");
});

test("Matcher reset and replacement return guest strings", () => {
	const fixture = createFixture("[0-9]+", "a12b34");
	const replacement = createGuestString(fixture.runtime, "#");
	const replaced = call(fixture, "replaceAll", replacement);
	assert.equal(readGuestText(fixture.runtime, replaced), "a#b#");
	assert.deepEqual(call(fixture, "reset"), fixture.matcher);
	assert.equal(call(fixture, "lookingAt"), 0);
});

test("Matcher full match preserves captured groups", () => {
	const fixture = createFixture("([a-z]+)([0-9]+)", "abc12");
	assert.equal(call(fixture, "matches"), 1);
	assert.equal(call(fixture, "groupCount"), 2);
	assert.equal(readGuestText(fixture.runtime, call(fixture, "group", 1)), "abc");
});

function createFixture(source, text) {
	const heap = createDalvikObjectHeap();
	const runtime = Object.freeze({ heap });
	const family = createFrameworkJavaRegexMethods(runtime);
	const pattern = invoke(family, "Pattern", "compile", [
		createGuestString(runtime, source)
	]);
	const matcher = invoke(family, "Pattern", "matcher", [
		pattern,
		createGuestString(runtime, text)
	]);
	return Object.freeze({ family, heap, matcher, runtime });
}

function call(fixture, name, argument) {
	const args = argument === undefined
		? [fixture.matcher]
		: [fixture.matcher, argument];
	return invoke(fixture.family, "Matcher", name, args);
}

function invoke(family, type, name, args) {
	const classType = `Ljava/util/regex/${type};`;
	return family.invoke(Object.freeze({
		method: Object.freeze({ classType, name }),
		signature: `${classType}->${name}`
	}), args);
}
