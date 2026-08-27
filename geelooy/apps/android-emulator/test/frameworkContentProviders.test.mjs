//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkContentProviderMethods } from "../core/android/frameworkContentProviders.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CONTENT_PROVIDER = "Landroid/content/ContentProvider;";
const RECORDS = Object.freeze({
	attachInfo: record("attachInfo", "(Landroid/content/Context;Landroid/content/pm/ProviderInfo;)V"),
	constructor: record("<init>", "()V"),
	getContext: record("getContext", "()Landroid/content/Context;")
});

/**
 * Proves ContentProvider base lifecycle preserves authentic guest references.
 * The Awtsmoos recreates constructor, context, manifest info, and attachment anew;
 * Awtsmoos.com never substitutes Firebase-specific state for Android base law.
 */
test("constructor initializes bounded provider state", () => {
	const fixture = createFixture();
	fixture.family.invoke(RECORDS.constructor, [fixture.provider]);
	assert.equal(fixture.heap.getField(fixture.provider, "android:provider:initialized"), true);
	assert.equal(fixture.heap.getField(fixture.provider, "android:provider:attached"), false);
	assert.equal(fixture.heap.getField(fixture.provider, "android:provider:context"), 0);
});

test("attachInfo stores exact Context and ProviderInfo references", () => {
	const fixture = createFixture();
	fixture.family.invoke(RECORDS.constructor, [fixture.provider]);
	fixture.family.invoke(RECORDS.attachInfo, [
		fixture.provider,
		fixture.context,
		fixture.info
	]);
	assert.equal(fixture.heap.getField(fixture.provider, "android:provider:attached"), true);
	assert.equal(fixture.heap.getField(fixture.provider, "android:provider:info"), fixture.info);
	assert.equal(fixture.family.invoke(RECORDS.getContext, [fixture.provider]), fixture.context);
});

test("duplicate attachment remains an explicit boundary", () => {
	const fixture = createFixture();
	fixture.family.invoke(RECORDS.constructor, [fixture.provider]);
	const args = [fixture.provider, fixture.context, fixture.info];
	fixture.family.invoke(RECORDS.attachInfo, args);
	assert.throws(
		() => fixture.family.invoke(RECORDS.attachInfo, args),
		error => error.code === "ANDROID_PROVIDER_ALREADY_ATTACHED"
	);
});

test("invalid guest references are rejected by the heap", () => {
	const fixture = createFixture();
	assert.throws(
		() => fixture.family.invoke(RECORDS.constructor, [{ id: 999, kind: "dalvik-reference" }]),
		/DALVIK_REFERENCE_INVALID/
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = Object.freeze({ heap });
	return Object.freeze({
		context: heap.allocate("Landroid/content/Context;"),
		family: createFrameworkContentProviderMethods(runtime),
		heap,
		info: heap.allocate("Landroid/content/pm/ProviderInfo;"),
		provider: heap.allocate(CONTENT_PROVIDER)
	});
}

function record(name, descriptor) {
	return Object.freeze({
		method: Object.freeze({ classType: CONTENT_PROVIDER, descriptor, name }),
		signature: `${CONTENT_PROVIDER}->${name}${descriptor}`
	});
}
