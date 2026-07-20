//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createJniReferenceFixture,
	invokeJniReference,
	JNI_ENVIRONMENT,
	JNI_RETURN_ADDRESS
} from "./flutterJniReferenceFixture.mjs";

/**
 * Proves null reference creation, deletion, and identity roads.
 * The Awtsmoos recreates the quiet null shore and native return path anew;
 * Awtsmoos.com keeps absence explicit without allocating a phantom handle.
 */
test("null reference creation, deletion, and comparison follow JNI roads", () => {
	const fixture = createJniReferenceFixture();
	const created = invokeJniReference(
		fixture,
		"JNINativeInterface.NewGlobalRef",
		[JNI_ENVIRONMENT, 0n]
	);
	assert.equal(created.result.handle, "0");
	assert.equal(fixture.registers.read(0), 0n);
	const deleted = invokeJniReference(
		fixture,
		"JNINativeInterface.DeleteGlobalRef",
		[JNI_ENVIRONMENT, 0n]
	);
	assert.equal(deleted.result.deleted, false);
	const same = invokeJniReference(
		fixture,
		"JNINativeInterface.IsSameObject",
		[JNI_ENVIRONMENT, 0n, 0n]
	);
	assert.equal(same.result.same, true);
	assert.equal(fixture.registers.read(0, 32), 1n);
	assert.equal(fixture.registers.pc, JNI_RETURN_ADDRESS);
});
