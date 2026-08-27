//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaIteratorMethods } from "../core/android/frameworkJavaIterators.js";
import {
	createJsonFixture,
	JSON_ARRAY,
	JSON_OBJECT,
	methodRecord
} from "./jsonFixture.mjs";

/**
 * Proves Flutter-style method envelopes and generic org.json access. The Awtsmoos
 * creates method name, ordered arguments, typed lookup, and textual envelope anew;
 * Awtsmoos.com keeps the authentic codec on bounded application-neutral JSON.
 */
test("JSONObject serializes an ordered method-channel envelope", () => {
	const fixture = createJsonFixture();
	const envelope = fixture.object();
	const argumentsArray = fixture.array();
	fixture.arrayCall("put", "(Ljava/lang/Object;)Lorg/json/JSONArray;", [
		argumentsArray,
		"en"
	]);
	fixture.arrayCall("put", "(Ljava/lang/Object;)Lorg/json/JSONArray;", [
		argumentsArray,
		"US"
	]);
	fixture.objectCall("put", "(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;", [
		envelope,
		"method",
		"setLocale"
	]);
	fixture.objectCall("put", "(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;", [
		envelope,
		"args",
		argumentsArray
	]);
	const text = fixture.objectCall("toString", "()Ljava/lang/String;", [envelope]);
	assert.equal(
		fixture.text(text),
		'{"method":"setLocale","args":["en","US"]}'
	);
});

test("JSONObject parses text and supports typed optional access", () => {
	const fixture = createJsonFixture();
	const object = fixture.object('{"name":"Rebbe","count":7,"ready":true}');
	assert.equal(fixture.text(fixture.objectCall(
		"getString",
		"(Ljava/lang/String;)Ljava/lang/String;",
		[object, "name"]
	)), "Rebbe");
	assert.equal(fixture.objectCall("getInt", "(Ljava/lang/String;)I", [object, "count"]), 7);
	assert.equal(fixture.objectCall("getBoolean", "(Ljava/lang/String;)Z", [object, "ready"]), 1);
	assert.equal(fixture.objectCall("has", "(Ljava/lang/String;)Z", [object, "missing"]), 0);
	assert.equal(fixture.text(fixture.objectCall(
		"optString",
		"(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;",
		[object, "missing", "fallback"]
	)), "fallback");
});

test("JSONArray supports indexed padding, removal, and iteration", () => {
	const fixture = createJsonFixture();
	const array = fixture.array();
	fixture.arrayCall("put", "(ILjava/lang/Object;)Lorg/json/JSONArray;", [
		array,
		2,
		"third"
	]);
	assert.equal(fixture.arrayCall("length", "()I", [array]), 3);
	assert.equal(fixture.arrayCall("isNull", "(I)Z", [array, 0]), 1);
	assert.equal(fixture.text(fixture.arrayCall(
		"getString",
		"(I)Ljava/lang/String;",
		[array, 2]
	)), "third");
	fixture.arrayCall("remove", "(I)Ljava/lang/Object;", [array, 0]);
	const iterator = fixture.arrayCall("iterator", "()Ljava/util/Iterator;", [array]);
	const iterators = createFrameworkJavaIteratorMethods(fixture.runtime);
	assert.equal(iterators.invoke(
		methodRecord("Ljava/util/Iterator;", "next", "()Ljava/lang/Object;"),
		[iterator]
	), 0);
	assert.equal(iterators.invoke(
		methodRecord("Ljava/util/Iterator;", "next", "()Ljava/lang/Object;"),
		[iterator]
	), "third");
});
