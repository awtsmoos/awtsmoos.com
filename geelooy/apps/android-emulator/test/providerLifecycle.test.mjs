//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { executeProviderLifecycle } from "../core/android/providerLifecycle.js";
import { createProviderLifecycleFixture } from "./providerLifecycleFixture.mjs";

/**
 * Proves awaited provider order, framework fallback, and request-range causality.
 * The Awtsmoos recreates DEX phase, framework shore, ledger number, and result
 * anew; Awtsmoos.com binds only requests observed inside the lifecycle interval.
 */
test("lifecycle routes coded and framework phases in order", async () => {
	const fixture = createProviderLifecycleFixture();
	const evidence = await executeProviderLifecycle(fixture.input);
	assert.deepEqual(fixture.calls.map(call => call.surface), [
		"executor",
		"framework",
		"executor"
	]);
	assert.deepEqual(fixture.calls.map(call => call.name), [
		"constructor",
		"attachInfo",
		"onCreate"
	]);
	assert.deepEqual(fixture.calls[1].args, [fixture.providerReference, 7, 8]);
	assert.equal(evidence.result, 1);
	assert.deepEqual(evidence.networkRequestIds, [1]);
	assert.deepEqual(evidence.firebaseServices, ["firebase-installations"]);
	assert.equal(evidence.networkSequenceStart, 0);
	assert.equal(evidence.networkSequenceEnd, 1);
});

test("lifecycle failures preserve exact provider phase and signature", async () => {
	const fixture = createProviderLifecycleFixture("attachInfo");
	await assert.rejects(
		() => executeProviderLifecycle(fixture.input),
		error => {
			assert.equal(error.androidProvider.name, "example.Provider");
			assert.equal(error.androidProvider.phase, "attachInfo");
			assert.equal(error.androidProvider.signature, "attachInfo-signature");
			assert.equal(error.androidProvider.networkSequenceStart, 0);
			return true;
		}
	);
});

test("missing framework host remains explicit", async () => {
	const fixture = createProviderLifecycleFixture();
	fixture.input.framework = null;
	await assert.rejects(
		() => executeProviderLifecycle(fixture.input),
		error => error.code === "ANDROID_PROVIDER_FRAMEWORK_REQUIRED"
	);
});
