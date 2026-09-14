//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file projectHostingQueryClient.test.mjs
 * @description Proves visual query testimony travels as one authenticated same-origin GET without browser-controlled code execution.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { ProjectHostingClient } from "../transport/projectHostingClient.js";

test("queryDocuments encodes the declared bounded query vocabulary", async () => {
	const calls = [];
	const fetchImpl = async (url, options) => {
		calls.push({ url, options });
		return { ok: true, status: 200, json: async () => ({ database: { documents: [] } }) };
	};
	const client = new ProjectHostingClient({ aliasId: "alpha", projectId: "friend-site", fetchImpl });
	await client.queryDocuments({ path: "profiles", field: "age", operator: "gte", value: "18", sort: "desc", limit: 50, offset: 100 });
	const url = new URL(calls[0].url, "https://awtsmoos.test");
	assert.equal(url.searchParams.get("view"), "query");
	assert.equal(url.searchParams.get("field"), "age");
	assert.equal(url.searchParams.get("operator"), "gte");
	assert.equal(url.searchParams.get("value"), "18");
	assert.equal(url.searchParams.get("sort"), "desc");
	assert.equal(url.searchParams.get("offset"), "100");
	assert.equal(calls[0].options.method, "GET");
	assert.equal(calls[0].options.credentials, "same-origin");
});
