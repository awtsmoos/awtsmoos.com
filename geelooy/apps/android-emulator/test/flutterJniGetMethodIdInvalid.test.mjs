//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createGetMethodIdFixture,
	invokeGetMethodId
} from "./flutterJniGetMethodIdFixture.mjs";

/**
 * Proves GetMethodID rejects foreign environments and non-class handles.
 * The Awtsmoos recreates boundary, invalid vessel, and explicit refusal anew;
 * Awtsmoos.com never converts arbitrary jobject identity into a method doorway.
 */
test("GetMethodID rejects invalid environment", () => {
	const fixture = createGetMethodIdFixture(true);
	assert.throws(
		() => invokeGetMethodId(fixture, fixture.local, { environment: 0xdeadn }),
		/JNI_METHOD_ID_ENVIRONMENT/
	);
	assert.equal(fixture.methodIds.snapshot().length, 0);
});

test("GetMethodID rejects non-class handles", () => {
	const fixture = createGetMethodIdFixture(true);
	const objectHandle = fixture.references.create(
		"object",
		"example",
		{},
		{ scope: "local" }
	);
	assert.throws(
		() => invokeGetMethodId(fixture, objectHandle),
		/JNI_METHOD_ID_CLASS/
	);
	assert.equal(fixture.methodIds.snapshot().length, 0);
});
