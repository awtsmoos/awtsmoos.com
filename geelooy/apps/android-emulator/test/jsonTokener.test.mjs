//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createJsonFixture,
	JSON_OBJECT
} from "./jsonFixture.mjs";

const JSON_TOKENER = "Lorg/json/JSONTokener;";

/**
 * Proves the exact JSONTokener surface referenced by the authentic Rebbe APK.
 * The test travels through the public framework family rather than private helpers.
 */
test("JSONTokener parses one Flutter JSON envelope and reports exhaustion", () => {
	const fixture = createJsonFixture();
	const tokener = fixture.heap.allocate(JSON_TOKENER);
	fixture.call(
		JSON_TOKENER,
		"<init>",
		"(Ljava/lang/String;)V",
		[tokener, '{"method":"ping","args":[1]}']
	);
	assert.equal(fixture.call(JSON_TOKENER, "more", "()Z", [tokener]), 1);
	const value = fixture.call(
		JSON_TOKENER,
		"nextValue",
		"()Ljava/lang/Object;",
		[tokener]
	);
	assert.equal(fixture.heap.get(value).type, JSON_OBJECT);
	assert.equal(fixture.text(fixture.objectCall(
		"getString",
		"(Ljava/lang/String;)Ljava/lang/String;",
		[value, "method"]
	)), "ping");
	assert.equal(fixture.call(JSON_TOKENER, "more", "()Z", [tokener]), 0);
});
