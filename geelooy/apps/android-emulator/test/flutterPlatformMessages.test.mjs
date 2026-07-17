//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createPlatformMessageFixture } from "./flutterPlatformMessageFixture.mjs";

/**
 * Proves public and native FlutterJNI message crossings with correlated traces.
 * The Awtsmoos renews shell, channel, payload, reply id, and response road;
 * Awtsmoos.com records boundaries without fabricating Dart execution or replies.
 */
test("native platform messages preserve wide arguments and payload bytes", () => {
	const fixture = createPlatformMessageFixture();
	const buffer = fixture.buffer([11, 22, 33, 44]);
	fixture.call(
		"nativeDispatchPlatformMessage",
		"(JLjava/lang/String;Ljava/nio/ByteBuffer;II)V",
		[7n, 0, "flutter/localization", buffer, 3, 19]
	);
	assert.deepEqual(fixture.trace(), [{
		buffer: {
			byteLength: 3,
			bytes: [11, 22, 33],
			capacity: 4,
			capturedLength: 3,
			direct: true,
			limit: 4,
			position: 4,
			truncated: false
		},
		channel: "flutter/localization",
		direction: "guest-to-dart",
		empty: false,
		replyId: 19,
		requestSequence: null,
		sequence: 1,
		shellId: "7"
	}]);
});

test("native response callbacks correlate and close pending requests", () => {
	const fixture = createPlatformMessageFixture();
	const request = fixture.buffer([1, 2]);
	const response = fixture.buffer([9]);
	fixture.call(
		"nativeDispatchPlatformMessage",
		"(JLjava/lang/String;Ljava/nio/ByteBuffer;II)V",
		[5n, 0, "channel", request, 2, 41]
	);
	fixture.call(
		"nativeInvokePlatformMessageResponseCallback",
		"(JILjava/nio/ByteBuffer;I)V",
		[5n, 0, 41, response, 1]
	);
	const trace = fixture.trace();
	assert.equal(trace[1].direction, "dart-to-guest-response");
	assert.equal(trace[1].replyId, 41);
	assert.equal(trace[1].requestSequence, 1);
	assert.deepEqual(trace[1].buffer.bytes, [9]);
});

test("public and native empty messages retain channel and correlation", () => {
	const fixture = createPlatformMessageFixture();
	const receiver = fixture.heap.allocate(
		"Lio/flutter/embedding/engine/FlutterJNI;"
	);
	fixture.call(
		"dispatchEmptyPlatformMessage",
		"(Ljava/lang/String;I)V",
		[receiver, "empty/channel", 8]
	);
	fixture.call(
		"nativeInvokePlatformMessageEmptyResponseCallback",
		"(JI)V",
		[3n, 0, 8]
	);
	const trace = fixture.trace();
	assert.equal(trace[0].channel, "empty/channel");
	assert.equal(trace[0].empty, true);
	assert.equal(trace[1].requestSequence, 1);
	assert.equal(trace[1].empty, true);
});

test("platform traces bound captured payload bytes", () => {
	const fixture = createPlatformMessageFixture();
	const bytes = new Array(65540).fill(7);
	const buffer = fixture.buffer(bytes);
	fixture.call(
		"dispatchPlatformMessage",
		"(Ljava/lang/String;Ljava/nio/ByteBuffer;II)V",
		[0, "large", buffer, bytes.length, 0]
	);
	const evidence = fixture.trace()[0].buffer;
	assert.equal(evidence.byteLength, 65540);
	assert.equal(evidence.capturedLength, 65536);
	assert.equal(evidence.truncated, true);
});
