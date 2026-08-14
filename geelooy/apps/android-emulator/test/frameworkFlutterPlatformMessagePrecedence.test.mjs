//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createPlatformMessageFixture, methodRecord } from "./flutterPlatformMessageFixture.mjs";

/**
 * Proves production first-match dispatch chooses the measured message crossing.
 * The Awtsmoos renews broad and specific roads together; Awtsmoos.com keeps the
 * truthful channel before ARM64 while leaving the native ocean reachable.
 */
test("production families prefer the specific Flutter platform-message road", () => {
	const fixture = createPlatformMessageFixture();
	const families = createFrameworkAndroidCoreFamilies(fixture.runtime);
	const record = methodRecord(
		"nativeDispatchPlatformMessage",
		"(JLjava/lang/String;Ljava/nio/ByteBuffer;II)V"
	);
	const matches = families.filter((family) => family.canHandle(record));
	const receiver = fixture.heap.allocate(
		"Lio/flutter/embedding/engine/FlutterJNI;"
	);
	const buffer = fixture.buffer([11, 22, 33, 44]);

	assert.equal(matches.length, 2);
	assert.equal(matches[0].canHandle(methodRecord("nativeAttach", "(J)V")), false);
	assert.equal(matches[1].canHandle(methodRecord("nativeAttach", "(J)V")), true);
	matches[0].invoke(
		record,
		[receiver, 1n, 0, "flutter/localization", buffer, 3, 19]
	);

	const evidence = fixture.trace()[0];
	assert.equal(evidence.channel, "flutter/localization");
	assert.equal(evidence.direction, "guest-to-dart");
	assert.equal(evidence.replyId, 19);
	assert.equal(evidence.shellId, "1");
	assert.deepEqual(evidence.buffer.bytes, [11, 22, 33]);
	assert.equal("flutterNativeSession" in fixture.runtime, false);
});
