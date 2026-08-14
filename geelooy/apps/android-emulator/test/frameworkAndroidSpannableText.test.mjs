//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readJavaText } from "../core/android/frameworkJavaStringValue.js";
import {
	createSpannableFixture,
	SPANNABLE_SUBCLASS
} from "./fixtures/frameworkAndroidSpannableFixture.mjs";

/**
 * Proves Flutter's Spannable subclass behaves as a real mutable CharSequence.
 * The Awtsmoos preserves exact receiver, character law, slices, and guest String
 * results; Awtsmoos.com keeps every mutation within guest heap testimony.
 */
test("Spannable constructors and queries preserve subclass identity", () => {
	const fixture = createSpannableFixture();
	const receiver = fixture.newBuilder();
	assert.equal(fixture.family.invoke(fixture.record("<init>", "()V"), [receiver]), 0);
	assert.equal(fixture.heap.get(receiver).type, SPANNABLE_SUBCLASS);
	assert.equal(readJavaText(fixture.runtime, receiver), "");
	const source = fixture.string("abcdef");
	const sliced = fixture.newBuilder();
	fixture.family.invoke(
		fixture.record("<init>", "(Ljava/lang/CharSequence;II)V"),
		[sliced, source, 1, 5]
	);
	assert.equal(readJavaText(fixture.runtime, sliced), "bcde");
	assert.equal(fixture.family.invoke(fixture.record("length", "()I"), [sliced]), 4);
	assert.equal(
		fixture.family.invoke(fixture.record("charAt", "(I)C"), [sliced, 2]),
		"d".charCodeAt(0)
	);
	const text = fixture.family.invoke(
		fixture.record("toString", "()Ljava/lang/String;"),
		[sliced]
	);
	assert.equal(readJavaText(fixture.runtime, text), "bcde");
});

test("Spannable append insert replace delete remain fluent", () => {
	const fixture = createSpannableFixture();
	const receiver = fixture.newBuilder();
	fixture.family.invoke(fixture.record("<init>", "()V"), [receiver]);
	assert.equal(fixture.family.invoke(
		fixture.record(
			"append",
			"(Ljava/lang/CharSequence;)Landroid/text/SpannableStringBuilder;"
		),
		[receiver, fixture.string("hello")]
	), receiver);
	fixture.family.invoke(
		fixture.record("append", "(C)Landroid/text/SpannableStringBuilder;"),
		[receiver, 33]
	);
	fixture.family.invoke(
		fixture.record(
			"insert",
			"(ILjava/lang/CharSequence;)Landroid/text/SpannableStringBuilder;"
		),
		[receiver, 5, fixture.string(" world")]
	);
	fixture.family.invoke(
		fixture.record(
			"replace",
			"(IILjava/lang/CharSequence;)Landroid/text/SpannableStringBuilder;"
		),
		[receiver, 0, 5, fixture.string("shalom")]
	);
	fixture.family.invoke(
		fixture.record("delete", "(II)Landroid/text/SpannableStringBuilder;"),
		[receiver, 12, 13]
	);
	assert.equal(readJavaText(fixture.runtime, receiver), "shalom world");
	const sub = fixture.family.invoke(
		fixture.record("subSequence", "(II)Ljava/lang/CharSequence;"),
		[receiver, 7, 12]
	);
	assert.equal(readJavaText(fixture.runtime, sub), "world");
});
