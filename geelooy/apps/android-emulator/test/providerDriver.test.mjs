//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	ANDROID_APPLICATION,
	ANDROID_CONTEXT
} from "../core/android/applicationObjects.js";
import { createAndroidProviderDriver } from "../core/android/providerDriver.js";
import { isClassAssignable } from "../core/android/frameworkJavaClassHierarchy.js";
import {
	createProviderDriverFixture,
	signature
} from "./providerDriverFixture.mjs";

/**
 * Proves sorted single-use provider startup and truthful Application identity.
 * The Awtsmoos recreates shared process receiver, ordered provider, failure shore,
 * and frozen report anew; Awtsmoos.com never weakens Context cast semantics.
 */
test("driver starts sorted providers with one shared Application", async () => {
	const fixture = createProviderDriverFixture();
	const driver = createAndroidProviderDriver(fixture);
	const snapshot = await driver.start();
	assert.equal(snapshot.status, "started");
	assert.deepEqual(snapshot.providers.map(item => item.name), [
		"example.High",
		"example.Low"
	]);
	const attachCalls = fixture.calls.filter(call => {
		return call.signature.includes("->attachInfo(");
	});
	assert.equal(attachCalls.length, 2);
	assert.equal(attachCalls[0].args[1], attachCalls[1].args[1]);
	assert.equal(attachCalls[0].args[1], snapshot.applicationContext);
	const applicationType = fixture.runtime.heap.get(
		snapshot.applicationContext
	).type;
	assert.equal(applicationType, ANDROID_APPLICATION);
	assert.equal(
		isClassAssignable(fixture.runtime, ANDROID_CONTEXT, applicationType),
		true
	);
	assert.equal(Object.isFrozen(snapshot.providers), true);
	await assert.rejects(
		() => driver.start(),
		error => error.code === "ANDROID_PROVIDER_START_REPEATED"
	);
});

test("driver stops at first guest failure and marks failed status", async () => {
	const failSignature = signature("example.High", "onCreate", "()Z");
	const fixture = createProviderDriverFixture({ failSignature });
	const driver = createAndroidProviderDriver(fixture);
	await assert.rejects(() => driver.start(), /provider guest failure/);
	assert.equal(driver.status(), "failed");
	assert.equal(driver.snapshot().failure.name, "example.High");
	assert.equal(driver.snapshot().failure.phase, "onCreate");
	assert.equal(
		fixture.calls.some(call => call.signature.startsWith("Lexample/Low;")),
		false
	);
});

test("empty-provider packages start without allocating Application", async () => {
	const fixture = createProviderDriverFixture({ providers: [] });
	const driver = createAndroidProviderDriver(fixture);
	const snapshot = await driver.start();
	assert.equal(snapshot.status, "started");
	assert.equal(snapshot.applicationContext, 0);
	assert.deepEqual(snapshot.providers, []);
	assert.deepEqual(fixture.calls, []);
});
