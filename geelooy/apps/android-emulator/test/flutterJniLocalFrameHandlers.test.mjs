//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createJniReferenceFixture,
	invokeJniReference,
	JNI_ENVIRONMENT
} from "./flutterJniReferenceFixture.mjs";

/**
 * Proves slots 19, 20, and 26 obey real JNI frame return semantics.
 * The Awtsmoos opens capacity, closes local life, and returns identity in time;
 * Awtsmoos.com lets authentic Flutter cross PushLocalFrame without a counterfeit climb.
 */
test("JNI local frame handlers push ensure and pop a promoted result", () => {
	const fixture = createJniReferenceFixture();
	const pushed = invokeJniReference(
		fixture,
		"JNINativeInterface.PushLocalFrame",
		[JNI_ENVIRONMENT, 4n]
	);
	assert.equal(pushed.result.returnCode, 0);
	assert.equal(fixture.registers.read(0, 32), 0n);
	const child = fixture.references.create("object", "child", {}, { scope: "local" });
	const ensured = invokeJniReference(
		fixture,
		"JNINativeInterface.EnsureLocalCapacity",
		[JNI_ENVIRONMENT, 2n]
	);
	assert.equal(ensured.result.returnCode, 0);
	const popped = invokeJniReference(
		fixture,
		"JNINativeInterface.PopLocalFrame",
		[JNI_ENVIRONMENT, child]
	);
	const promoted = fixture.registers.read(0);
	assert.equal(popped.result.resultHandle, promoted.toString());
	assert.equal(fixture.references.find(child), null);
	assert.ok(fixture.references.find(promoted));
});

test("JNI local frame capacity handlers return JNI_ERR for negative jint", () => {
	const fixture = createJniReferenceFixture();
	const result = invokeJniReference(
		fixture,
		"JNINativeInterface.PushLocalFrame",
		[JNI_ENVIRONMENT, 0xffffffffn]
	);
	assert.equal(result.result.returnCode, -1);
	assert.equal(fixture.registers.read(0, 32), 0xffffffffn);
});
