//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import {
	readGuestArray,
	readJavaText
} from "../core/android/frameworkJavaStringValue.js";
import { createSpannableFixture } from "./fixtures/frameworkAndroidSpannableFixture.mjs";

const OBJECT_CLASS = createDalvikClassValue("Ljava/lang/Object;");

/**
 * Proves ordered spans remain guest records through queries and text mutation.
 * The Awtsmoos preserves object, range, flags, transition, array, and removal;
 * Awtsmoos.com adjusts boundaries without host Android span machinery.
 */
test("Spannable span records support exact queries and guest arrays", () => {
	const fixture = createSpannableFixture();
	const receiver = initialized(fixture, "hello");
	const span = fixture.heap.allocate("Lexample/Span;");
	fixture.family.invoke(
		fixture.record("setSpan", "(Ljava/lang/Object;III)V"),
		[receiver, span, 1, 4, 33]
	);
	assert.equal(query(fixture, receiver, "getSpanStart", span), 1);
	assert.equal(query(fixture, receiver, "getSpanEnd", span), 4);
	assert.equal(query(fixture, receiver, "getSpanFlags", span), 33);
	const array = fixture.family.invoke(
		fixture.record("getSpans", "(IILjava/lang/Class;)[Ljava/lang/Object;"),
		[receiver, 0, 5, OBJECT_CLASS]
	);
	assert.deepEqual(readGuestArray(fixture.runtime, array), [span]);
	assert.equal(fixture.family.invoke(
		fixture.record("nextSpanTransition", "(IILjava/lang/Class;)I"),
		[receiver, 0, 5, OBJECT_CLASS]
	), 1);
});

test("Spannable mutations adjust and remove span boundaries", () => {
	const fixture = createSpannableFixture();
	const receiver = initialized(fixture, "hello");
	const span = fixture.heap.allocate("Lexample/Span;");
	fixture.family.invoke(
		fixture.record("setSpan", "(Ljava/lang/Object;III)V"),
		[receiver, span, 1, 4, 7]
	);
	fixture.family.invoke(
		fixture.record("insert", "(ILjava/lang/CharSequence;)Landroid/text/SpannableStringBuilder;"),
		[receiver, 0, fixture.string("X")]
	);
	assert.equal(query(fixture, receiver, "getSpanStart", span), 2);
	assert.equal(query(fixture, receiver, "getSpanEnd", span), 5);
	fixture.family.invoke(
		fixture.record("delete", "(II)Landroid/text/SpannableStringBuilder;"),
		[receiver, 0, 2]
	);
	assert.equal(readJavaText(fixture.runtime, receiver), "ello");
	assert.equal(query(fixture, receiver, "getSpanStart", span), 0);
	assert.equal(query(fixture, receiver, "getSpanEnd", span), 3);
	fixture.family.invoke(
		fixture.record("removeSpan", "(Ljava/lang/Object;)V"),
		[receiver, span]
	);
	assert.equal(query(fixture, receiver, "getSpanStart", span), -1);
});

function initialized(fixture, text) {
	const receiver = fixture.newBuilder();
	fixture.family.invoke(
		fixture.record("<init>", "(Ljava/lang/CharSequence;)V"),
		[receiver, fixture.string(text)]
	);
	return receiver;
}

function query(fixture, receiver, name, span) {
	const descriptor = "(Ljava/lang/Object;)I";
	return fixture.family.invoke(fixture.record(name, descriptor), [receiver, span]);
}
