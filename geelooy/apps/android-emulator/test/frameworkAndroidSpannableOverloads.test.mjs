//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readJavaText } from "../core/android/frameworkJavaStringValue.js";
import { createSpannableFixture } from "./fixtures/frameworkAndroidSpannableFixture.mjs";

const AUTHENTIC_METHODS = Object.freeze([
	["<init>", "()V"],
	["<init>", "(Ljava/lang/CharSequence;)V"],
	["<init>", "(Ljava/lang/CharSequence;II)V"],
	["append", "(C)Landroid/text/SpannableStringBuilder;"],
	["append", "(Ljava/lang/CharSequence;)Landroid/text/SpannableStringBuilder;"],
	["append", "(Ljava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;"],
	["append", "(Ljava/lang/CharSequence;Ljava/lang/Object;I)Landroid/text/SpannableStringBuilder;"],
	["charAt", "(I)C"],
	["delete", "(II)Landroid/text/SpannableStringBuilder;"],
	["getSpanEnd", "(Ljava/lang/Object;)I"],
	["getSpanFlags", "(Ljava/lang/Object;)I"],
	["getSpanStart", "(Ljava/lang/Object;)I"],
	["getSpans", "(IILjava/lang/Class;)[Ljava/lang/Object;"],
	["insert", "(ILjava/lang/CharSequence;)Landroid/text/SpannableStringBuilder;"],
	["insert", "(ILjava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;"],
	["length", "()I"],
	["nextSpanTransition", "(IILjava/lang/Class;)I"],
	["removeSpan", "(Ljava/lang/Object;)V"],
	["replace", "(IILjava/lang/CharSequence;)Landroid/text/SpannableStringBuilder;"],
	["replace", "(IILjava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;"],
	["setSpan", "(Ljava/lang/Object;III)V"],
	["subSequence", "(II)Ljava/lang/CharSequence;"],
	["toString", "()Ljava/lang/String;"]
]);

/**
 * Locks every authentic overload and the ranged/span mutations omitted by the
 * first focused suite. The Awtsmoos preserves exact descriptor law and fluent
 * receiver identity; Awtsmoos.com rejects every unmeasured overload.
 */
test("Spannable routing accepts exactly the authentic method surface", () => {
	const fixture = createSpannableFixture();
	for (const [name, descriptor] of AUTHENTIC_METHODS) {
		assert.equal(fixture.family.canHandle(fixture.record(name, descriptor)), true);
	}
	assert.equal(
		fixture.family.canHandle(fixture.record("append", "(I)Ljava/lang/Object;")),
		false
	);
});

test("ranged append insert replace preserve exact slices and identity", () => {
	const fixture = createSpannableFixture();
	const receiver = initialize(fixture, "ab");
	const source = fixture.string("WXYZ");
	assert.equal(invoke(fixture, receiver, "append",
		"(Ljava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;",
		[source, 1, 3]), receiver);
	assert.equal(readJavaText(fixture.runtime, receiver), "abXY");
	assert.equal(invoke(fixture, receiver, "insert",
		"(ILjava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;",
		[1, source, 1, 3]), receiver);
	assert.equal(readJavaText(fixture.runtime, receiver), "aXYbXY");
	assert.equal(invoke(fixture, receiver, "replace",
		"(IILjava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;",
		[1, 3, source, 2, 4]), receiver);
	assert.equal(readJavaText(fixture.runtime, receiver), "aYZbXY");
});

test("append with span records the appended range and flags", () => {
	const fixture = createSpannableFixture();
	const receiver = initialize(fixture, "a");
	const span = fixture.heap.allocate("Lexample/Span;");
	assert.equal(invoke(fixture, receiver, "append",
		"(Ljava/lang/CharSequence;Ljava/lang/Object;I)Landroid/text/SpannableStringBuilder;",
		[fixture.string("bc"), span, 7]), receiver);
	assert.equal(readJavaText(fixture.runtime, receiver), "abc");
	for (const [name, expected] of [
		["getSpanStart", 1],
		["getSpanEnd", 3],
		["getSpanFlags", 7]
	]) {
		assert.equal(invoke(fixture, receiver, name, "(Ljava/lang/Object;)I", [span]), expected);
	}
});

function initialize(fixture, text) {
	const receiver = fixture.newBuilder();
	fixture.family.invoke(
		fixture.record("<init>", "(Ljava/lang/CharSequence;)V"),
		[receiver, fixture.string(text)]
	);
	return receiver;
}

function invoke(fixture, receiver, name, descriptor, args) {
	return fixture.family.invoke(fixture.record(name, descriptor), [receiver, ...args]);
}
