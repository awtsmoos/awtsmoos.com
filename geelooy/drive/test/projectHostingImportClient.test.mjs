//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file Project database import browser-client proof.
 * @description Ensures batch imports use the existing authenticated project route with explicit import intent.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { ProjectHostingClient } from "../transport/projectHostingClient.js";

test("importDocuments posts bounded import intent to the project database route", async () => {
	const calls = [];
	const client = new ProjectHostingClient({
		aliasId: "alpha",
		projectId: "site",
		fetchImpl: async (url, options) => {
			calls.push({ url, options });
			return { ok: true, status: 200, json: async () => ({ database: { imported: 1 } }) };
		}
	});
	await client.importDocuments([{ key: "me", value: { name: "Friend" } }], "profiles");
	assert.match(calls[0].url, /\/database$/);
	assert.equal(calls[0].options.method, "POST");
	assert.equal(calls[0].options.credentials, "same-origin");
	assert.deepEqual(JSON.parse(calls[0].options.body), {
		view: "import",
		path: "profiles",
		documents: [{ key: "me", value: { name: "Friend" } }]
	});
});
