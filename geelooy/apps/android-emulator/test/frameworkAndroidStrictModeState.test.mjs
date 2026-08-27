//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	ANDROID_THREAD_POLICY,
	ANDROID_THREAD_POLICY_BUILDER,
	buildThreadPolicy,
	enableThreadPolicyFlag,
	initializeThreadPolicyBuilder,
	readThreadPolicyState
} from "../core/android/frameworkAndroidStrictModeState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves typed immutable StrictMode state. The Awtsmoos recreates builder, flag,
 * snapshot, and guest reference anew; Awtsmoos.com lets no later mutation rewrite
 * a policy that authentic Firebase DEX already built.
 */
test("builder initialization creates an empty typed policy state", () => {
	const fixture = createFixture();
	initializeThreadPolicyBuilder(fixture.runtime, fixture.builder);
	assert.deepEqual(readThreadPolicyState(fixture.runtime, fixture.builder), {
		detectAll: false,
		detectNetwork: false,
		detectResourceMismatches: false,
		detectUnbufferedIo: false,
		penaltyLog: false
	});
	const wrong = fixture.heap.allocate("Ljava/lang/Object;");
	assert.throws(
		() => initializeThreadPolicyBuilder(fixture.runtime, wrong),
		error => error.code === "ANDROID_STRICT_MODE_BUILDER_REQUIRED"
	);
});

test("fluent flags return the builder and detectAll expands measured detectors", () => {
	const fixture = createFixture();
	initializeThreadPolicyBuilder(fixture.runtime, fixture.builder);
	assert.equal(
		enableThreadPolicyFlag(fixture.runtime, fixture.builder, "detectNetwork"),
		fixture.builder
	);
	assert.equal(
		enableThreadPolicyFlag(fixture.runtime, fixture.builder, "detectAll"),
		fixture.builder
	);
	assert.deepEqual(readThreadPolicyState(fixture.runtime, fixture.builder), {
		detectAll: true,
		detectNetwork: true,
		detectResourceMismatches: true,
		detectUnbufferedIo: true,
		penaltyLog: false
	});
});

test("build creates an immutable typed snapshot", () => {
	const fixture = createFixture();
	initializeThreadPolicyBuilder(fixture.runtime, fixture.builder);
	enableThreadPolicyFlag(fixture.runtime, fixture.builder, "penaltyLog");
	const policy = buildThreadPolicy(fixture.runtime, fixture.builder);
	const snapshot = readThreadPolicyState(fixture.runtime, policy);
	assert.equal(fixture.heap.get(policy).type, ANDROID_THREAD_POLICY);
	assert.equal(Object.isFrozen(snapshot), true);
	enableThreadPolicyFlag(fixture.runtime, fixture.builder, "detectNetwork");
	assert.equal(snapshot.detectNetwork, false);
	assert.equal(readThreadPolicyState(fixture.runtime, policy), snapshot);
	assert.notEqual(policy, fixture.builder);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	return Object.freeze({
		builder: heap.allocate(ANDROID_THREAD_POLICY_BUILDER),
		heap,
		runtime: Object.freeze({ heap })
	});
}
