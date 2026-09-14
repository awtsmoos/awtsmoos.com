//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file projectHostingDocumentsClient.test.mjs
 * @description Proves Database Studio document previews remain one same-origin authenticated GET with explicit view and bounds.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { ProjectHostingClient } from "../transport/projectHostingClient.js";

test("document preview uses the existing guarded project database route", async () => {
	const calls = [];
	const fetchImpl = async (url, options) => {
		calls.push({ url, options });
		return { ok: true, status: 200, json: async () => ({ database: { documents: [] } }) };
	};
	const client = new ProjectHostingClient({ aliasId: "alpha", projectId: "friend-site", fetchImpl });
	await client.listDocuments("profiles", 75, 150);
	assert.equal(calls.length, 1);
	assert.match(calls[0].url, /\/database\?/);
	assert.match(calls[0].url, /view=documents/);
	assert.match(calls[0].url, /path=profiles/);
	assert.match(calls[0].url, /limit=75/);
	assert.match(calls[0].url, /offset=150/);
	assert.equal(calls[0].options.method, "GET");
	assert.equal(calls[0].options.credentials, "same-origin");
});
