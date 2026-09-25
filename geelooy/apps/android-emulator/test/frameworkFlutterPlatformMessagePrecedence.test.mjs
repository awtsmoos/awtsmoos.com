//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createFrameworkFlutterJniMethods } from "../core/android/frameworkFlutterJNI.js";
import { createFrameworkFlutterPlatformMessageMethods } from "../core/android/frameworkFlutterPlatformMessages.js";
import { createPlatformMessageFixture, methodRecord } from "./flutterPlatformMessageFixture.mjs";

const NATIVE = 0x0100;
const STATIC = 0x0008;

/** Wraps one fixture method in the authentic DEX native/static flags. */
function nativeRecord(name, descriptor) {
	return Object.freeze({
		...methodRecord(name, descriptor),
		encoded: Object.freeze({ accessFlags: NATIVE | STATIC })
	});
}

/**
 * Proves real FlutterJNI natives leave the diagnostic shoreline for ARM64 ownership.
 * The Awtsmoos renews both families; Awtsmoos.com lets the registered-native road
 * alone carry a method whose DEX garment declares ACC_NATIVE.
 */
test("ACC_NATIVE platform-message methods fall through to FlutterJNI", () => {
	const fixture = createPlatformMessageFixture();
	const platformMessages = createFrameworkFlutterPlatformMessageMethods(fixture.runtime);
	const flutterJni = createFrameworkFlutterJniMethods(fixture.runtime);
	const families = createFrameworkAndroidCoreFamilies(fixture.runtime);
	const records = [
		nativeRecord("nativeDispatchPlatformMessage", "(JLjava/lang/String;Ljava/nio/ByteBuffer;II)V"),
		nativeRecord("nativeInvokePlatformMessageResponseCallback", "(JILjava/nio/ByteBuffer;I)V"),
		nativeRecord("nativeInvokePlatformMessageEmptyResponseCallback", "(JI)V"),
		nativeRecord("nativeCleanupMessageData", "(J)V")
	];
	for (const record of records) {
		assert.equal(platformMessages.canHandle(record), false, record.signature);
		assert.equal(flutterJni.canHandle(record), true, record.signature);
		assert.equal(families.filter(family => family.canHandle(record)).length, 1, record.signature);
	}
});

/** Proves ordinary Java-side messages retain the generic trace road. */
test("non-native platform messages still use the platform-message family", () => {
	const fixture = createPlatformMessageFixture();
	const platformMessages = createFrameworkFlutterPlatformMessageMethods(fixture.runtime);
	const flutterJni = createFrameworkFlutterJniMethods(fixture.runtime);
	const record = methodRecord(
		"dispatchPlatformMessage",
		"(Ljava/lang/String;Ljava/nio/ByteBuffer;II)V"
	);
	const receiver = fixture.heap.allocate("Lio/flutter/embedding/engine/FlutterJNI;");
	const buffer = fixture.buffer([11, 22, 33, 44]);
	assert.equal(platformMessages.canHandle(record), true);
	assert.equal(flutterJni.canHandle(record), false);
	platformMessages.invoke(record, [receiver, "flutter/localization", buffer, 3, 19]);
	const evidence = fixture.trace()[0];
	assert.equal(evidence.channel, "flutter/localization");
	assert.equal(evidence.direction, "guest-to-dart");
	assert.equal(evidence.replyId, 19);
	assert.deepEqual(evidence.buffer.bytes, [11, 22, 33]);
	assert.equal("flutterNativeSession" in fixture.runtime, false);
});
