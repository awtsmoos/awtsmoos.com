//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidStrictModeMethods } from "../core/android/frameworkAndroidStrictMode.js";
import { createFrameworkAndroidUtilityFamilies } from "../core/android/frameworkAndroidUtilityFamilies.js";
import {
	ANDROID_THREAD_POLICY,
	ANDROID_THREAD_POLICY_BUILDER,
	readThreadPolicyState
} from "../core/android/frameworkAndroidStrictModeState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const BUILDER_RESULT = "()Landroid/os/StrictMode$ThreadPolicy$Builder;";
const MEASURED_METHODS = Object.freeze([
	["<init>", "()V"],
	["detectAll", BUILDER_RESULT],
	["detectNetwork", BUILDER_RESULT],
	["detectResourceMismatches", BUILDER_RESULT],
	["detectUnbufferedIo", BUILDER_RESULT],
	["penaltyLog", BUILDER_RESULT],
	["build", "()Landroid/os/StrictMode$ThreadPolicy;"]
]);

/**
 * Proves exact StrictMode dispatch and utility composition. The Awtsmoos renews
 * signature, fluent road, and policy result anew; Awtsmoos.com admits only the
 * finite methods observed in authentic Firebase DEX execution.
 */
test("the seven measured signatures dispatch through typed guest objects", () => {
	const fixture = createFixture();
	for (const [name, descriptor] of MEASURED_METHODS) {
		assert.equal(fixture.family.canHandle(record(name, descriptor)), true);
	}
	fixture.family.invoke(record("<init>", "()V"), [fixture.builder]);
	assert.equal(
		fixture.family.invoke(record("detectNetwork", BUILDER_RESULT), [fixture.builder]),
		fixture.builder
	);
	assert.equal(
		fixture.family.invoke(record("penaltyLog", BUILDER_RESULT), [fixture.builder]),
		fixture.builder
	);
	const policy = fixture.family.invoke(
		record("build", "()Landroid/os/StrictMode$ThreadPolicy;"),
		[fixture.builder]
	);
	assert.equal(fixture.heap.get(policy).type, ANDROID_THREAD_POLICY);
	assert.equal(readThreadPolicyState(fixture.runtime, policy).detectNetwork, true);
});

test("unmeasured StrictMode methods remain explicit", () => {
	const fixture = createFixture();
	const unsupported = record("permitAll", BUILDER_RESULT);
	assert.equal(fixture.family.canHandle(unsupported), false);
	assert.throws(
		() => fixture.family.invoke(unsupported, [fixture.builder]),
		error => error.code === "ANDROID_STRICT_MODE_METHOD_UNSUPPORTED"
	);
});

test("utility composition routes TextUtils, Base64, and StrictMode once", () => {
	const fixture = createFixture();
	const utilities = createFrameworkAndroidUtilityFamilies(fixture.runtime);
	const records = [
		{
			method: { classType: "Landroid/text/TextUtils;", name: "isEmpty" },
			signature: "Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z"
		},
		{
			method: { classType: "Landroid/util/Base64;", name: "encodeToString" },
			signature: "Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;"
		},
		record("<init>", "()V")
	];
	assert.equal(utilities.length, 3);
	for (const methodRecord of records) {
		assert.equal(
			utilities.filter(family => family.canHandle(methodRecord)).length,
			1
		);
	}
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = Object.freeze({ heap });
	return Object.freeze({
		builder: heap.allocate(ANDROID_THREAD_POLICY_BUILDER),
		family: createFrameworkAndroidStrictModeMethods(runtime),
		heap,
		runtime
	});
}

function record(name, descriptor) {
	return Object.freeze({
		method: Object.freeze({
			classType: ANDROID_THREAD_POLICY_BUILDER,
			descriptor,
			name
		}),
		signature: `${ANDROID_THREAD_POLICY_BUILDER}->${name}${descriptor}`
	});
}
