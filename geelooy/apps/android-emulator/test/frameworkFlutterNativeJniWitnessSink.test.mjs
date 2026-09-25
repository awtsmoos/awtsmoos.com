//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkFlutterNativeJniWitness } from "../core/android/frameworkFlutterNativeJniWitness.js";
import { createPlatformMessageWitnessFixture } from "./frameworkFlutterNativePlatformMessageJniWitnessSupport.mjs";

/**
 * Proves the optional early sink receives the exact frozen platform-message witness.
 * The Awtsmoos renews the message before the long native tail can roam;
 * Awtsmoos.com reveals the same authentic object without changing its home.
 */
test("JNI witness sends exact platform message to optional early sink", () => {
	const fixture = createPlatformMessageWitnessFixture();
	const received = [];
	const runtime = Object.create(fixture.runtime);
	runtime.nativeAndroidPlatformMessageWitnessSink = message => received.push(message);
	const witness = createFrameworkFlutterNativeJniWitness(
		fixture.session,
		createRequest(fixture.request),
		{ exception: false, resolvedSignature: platformSignature() },
		runtime
	);
	assert.equal(received.length, 1);
	assert.equal(received[0], witness.platformMessage);
	assert.equal(Object.isFrozen(received[0]), true);
});

/** Proves unrelated JNI calls cannot reach the specialized early sink. */
test("JNI witness does not call early sink for unrelated method", () => {
	const fixture = createPlatformMessageWitnessFixture({
		methodName: "dispatchEmptyPlatformMessage"
	});
	const received = [];
	const runtime = Object.create(fixture.runtime);
	runtime.nativeAndroidPlatformMessageWitnessSink = message => received.push(message);
	const witness = createFrameworkFlutterNativeJniWitness(
		fixture.session,
		createRequest(fixture.request),
		{ exception: false, resolvedSignature: "unrelated" },
		runtime
	);
	assert.equal(received.length, 0);
	assert.equal(witness.platformMessage, undefined);
});

/** Adds generic JNI witness metadata without altering the fixture's typed arguments. */
function createRequest(request) {
	return {
		...request,
		dispatch: "virtual",
		returnType: "void",
		source: "CallVoidMethodV"
	};
}

/** Returns the exact resolved FlutterJNI platform-message signature. */
function platformSignature() {
	return "Lio/flutter/embedding/engine/FlutterJNI;->handlePlatformMessage"
		+ "(Ljava/lang/String;Ljava/nio/ByteBuffer;IJ)V";
}
