//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	initializeJavaList,
	javaListValues
} from "../core/android/frameworkJavaListStorage.js";
import {
	initializeJavaMap,
	putJavaMapValue
} from "../core/android/frameworkJavaMapStorage.js";
import { createJsonFixture } from "./jsonFixture.mjs";

/**
 * Proves Map/List wrapping, exact Long output, names, and cycle rejection. The
 * Awtsmoos creates nested collection, JSON garment, numeral, and guarded recursion
 * anew; Awtsmoos.com keeps arbitrary APK channel values on shared guest storage.
 */
test("JSONObject.wrap converts Java Map and List values recursively", () => {
	const fixture = createJsonFixture();
	const list = fixture.heap.allocate("Ljava/util/ArrayList;");
	initializeJavaList(fixture.runtime, list);
	javaListValues(fixture.runtime, list).push("Alef", "Beis");
	const map = fixture.heap.allocate("Ljava/util/LinkedHashMap;");
	initializeJavaMap(fixture.runtime, map);
	putJavaMapValue(fixture.runtime, map, "letters", list);
	putJavaMapValue(fixture.runtime, map, "count", 2n);
	const wrapped = fixture.objectCall(
		"wrap",
		"(Ljava/lang/Object;)Ljava/lang/Object;",
		[map]
	);
	const text = fixture.objectCall(
		"toString",
		"()Ljava/lang/String;",
		[wrapped]
	);
	assert.equal(
		fixture.text(text),
		'{"letters":["Alef","Beis"],"count":2}'
	);
});

test("JSONObject names exposes insertion-ordered keys", () => {
	const fixture = createJsonFixture();
	const object = fixture.object();
	for (const key of ["first", "second"]) {
		fixture.objectCall(
			"put",
			"(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;",
			[object, key, key]
		);
	}
	const names = fixture.objectCall(
		"names",
		"()Lorg/json/JSONArray;",
		[object]
	);
	const text = fixture.arrayCall(
		"toString",
		"()Ljava/lang/String;",
		[names]
	);
	assert.equal(fixture.text(text), '["first","second"]');
});

test("JSON parser creates nested object and array references", () => {
	const fixture = createJsonFixture();
	const object = fixture.object('{"nested":{"values":[1,2,3]}}');
	const nested = fixture.objectCall(
		"getJSONObject",
		"(Ljava/lang/String;)Lorg/json/JSONObject;",
		[object, "nested"]
	);
	const values = fixture.objectCall(
		"getJSONArray",
		"(Ljava/lang/String;)Lorg/json/JSONArray;",
		[nested, "values"]
	);
	assert.equal(fixture.arrayCall("length", "()I", [values]), 3);
	assert.equal(fixture.arrayCall("getInt", "(I)I", [values, 1]), 2);
});

test("JSON serialization rejects recursive object cycles", () => {
	const fixture = createJsonFixture();
	const object = fixture.object();
	fixture.objectCall(
		"put",
		"(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;",
		[object, "self", object]
	);
	assert.throws(
		() => fixture.objectCall(
			"toString",
			"()Ljava/lang/String;",
			[object]
		),
		error => error.code === "ANDROID_JSON_CYCLE"
	);
});
