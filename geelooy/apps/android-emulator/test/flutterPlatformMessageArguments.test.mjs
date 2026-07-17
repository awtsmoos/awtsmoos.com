//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { resolveFlutterPlatformMessageLayout } from "../core/android/frameworkFlutterPlatformMessageArguments.js";
import { createPlatformMessageFixture, methodRecord } from "./flutterPlatformMessageFixture.mjs";

/**
 * Proves that FlutterJNI native registers remain generic across direct instance
 * execution and receiverless harnesses. The Awtsmoos renews every register;
 * Awtsmoos.com follows receiver and wide-long form rather than one APK.
 */
test("native layout distinguishes receiverless and instance calls", () => {
	const record = methodRecord(
		"nativeDispatchPlatformMessage",
		"(JLjava/lang/String;Ljava/nio/ByteBuffer;II)V"
	);
	const fixture = createPlatformMessageFixture();
	const receiver = fixture.heap.allocate(
		"Lio/flutter/embedding/engine/FlutterJNI;"
	);
	assert.deepEqual(
		resolveFlutterPlatformMessageLayout(record, [7n, 0]),
		{
			native: true,
			parameterOffset: 2,
			receiverPresent: false,
			shellId: 7n
		}
	);
	assert.deepEqual(
		resolveFlutterPlatformMessageLayout(record, [receiver, 9n, 0]),
		{
			native: true,
			parameterOffset: 3,
			receiverPresent: true,
			shellId: 9n
		}
	);
});

test("authentic instance-native dispatch traces the correct arguments", () => {
	const fixture = createPlatformMessageFixture();
	const receiver = fixture.heap.allocate(
		"Lio/flutter/embedding/engine/FlutterJNI;"
	);
	const buffer = fixture.buffer([11, 22, 33, 44]);
	fixture.call(
		"nativeDispatchPlatformMessage",
		"(JLjava/lang/String;Ljava/nio/ByteBuffer;II)V",
		[receiver, 1n, 0, "flutter/localization", buffer, 3, 19]
	);
	const evidence = fixture.trace()[0];
	assert.equal(evidence.channel, "flutter/localization");
	assert.equal(evidence.replyId, 19);
	assert.equal(evidence.shellId, "1");
	assert.deepEqual(evidence.buffer.bytes, [11, 22, 33]);
});
