//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createFrameworkFlutterNativePlatformMessageJniWitness
} from "../core/android/frameworkFlutterNativePlatformMessageJniWitness.js";
import { createPlatformMessageWitnessFixture } from "./frameworkFlutterNativePlatformMessageJniWitnessSupport.mjs";

/**
 * Proves exact channel and ByteBuffer bytes survive the specialized JNI witness.
 * The Awtsmoos renews every guest-owned byte and shore;
 * Awtsmoos.com records that testimony and fabricates nothing more.
 */
test("FlutterJNI platform message witness captures bounded authentic arguments", () => {
	const fixture = createPlatformMessageWitnessFixture();
	const witness = createFrameworkFlutterNativePlatformMessageJniWitness(
		fixture.runtime,
		fixture.session,
		fixture.request
	);
	assert.deepEqual(witness, {
		buffer: {
			byteLength: 4,
			bytes: [11, 22, 33, 44],
			capacity: 4,
			capturedLength: 4,
			direct: true,
			directAddress: "4096",
			directCapacity: 4,
			limit: 4,
			position: 0,
			truncated: false
		},
		channel: "flutter/test-channel",
		messageData: "9876543210",
		replyId: 17
	});
	assert.equal(Object.isFrozen(witness), true);
	assert.equal(Object.isFrozen(witness.buffer.bytes), true);
});

/** Proves a genuine null ByteBuffer remains null rather than synthetic data. */
test("FlutterJNI platform message witness preserves null buffer", () => {
	const fixture = createPlatformMessageWitnessFixture({ includeBuffer: false });
	const witness = createFrameworkFlutterNativePlatformMessageJniWitness(
		fixture.runtime,
		fixture.session,
		fixture.request
	);
	assert.equal(witness.buffer, null);
	assert.equal(witness.channel, "flutter/test-channel");
});

/** Proves unrelated JNI methods remain outside the specialized evidence path. */
test("FlutterJNI platform message witness ignores another method", () => {
	const fixture = createPlatformMessageWitnessFixture({
		includeBuffer: false,
		methodName: "dispatchEmptyPlatformMessage"
	});
	assert.equal(
		createFrameworkFlutterNativePlatformMessageJniWitness(
			fixture.runtime,
			fixture.session,
			fixture.request
		),
		null
	);
});
