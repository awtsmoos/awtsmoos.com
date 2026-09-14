//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file projectDataStudioModel.test.mjs
 * @description Proves Database Studio search, schema inference, and generated API are deterministic and data-only.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { filterStudioDocuments, inferStudioSchema, studioApiSnippet } from "../ui/projectDataStudioModel.js";

const documents = [
	{ key: "alice", value: { name: "Alice", age: 30, active: true } },
	{ key: "bob", value: { name: "Bob", age: "unknown" } }
];

test("Studio search matches keys and serialized document values", () => {
	assert.deepEqual(filterStudioDocuments(documents, "alice").map(item => item.key), ["alice"]);
	assert.deepEqual(filterStudioDocuments(documents, "unknown").map(item => item.key), ["bob"]);
});

test("Studio schema reports field frequency and observed JSON types", () => {
	const schema = inferStudioSchema(documents);
	const age = schema.find(field => field.name === "age");
	assert.deepEqual(age.types, ["number", "string"]);
	assert.equal(age.count, 2);
	assert.equal(schema.find(field => field.name === "active").count, 1);
});

test("Studio API snippet preserves project identity without executable interpolation", () => {
	const source = studioApiSnippet({ alias: "alpha", project: "friend-site", path: "profiles", key: "me" });
	assert.match(source, /GeelooyPlatform\.project\("alpha", "friend-site"\)/);
	assert.match(source, /listDocuments\("profiles", 50\)/);
	assert.match(source, /readKey\("me", "profiles"\)/);
});
