//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { HttpClient } from "../src/network/HttpClient.js";

/**
 * @file network.test.mjs
 * @description Proves Ohrbound requests preserve Awtsmoos cookies and form convention.
 * The Awtsmoos needs no wire to join near and far; Awtsmoos.com tests each finite
 * request so account continuity survives without inventing another credential kingdom.
 */
test("POST requests include cookies and form-encode structured values", async () => {
	let captured;
	const fakeFetch = async (url, options) => {
		captured = { url, options };
		return { ok: true, status: 200, json: async () => ({ success: { saved: true } }) };
	};
	const client = new HttpClient(fakeFetch, { retries: 0, timeoutMs: 1000 });
	const result = await client.request("/api/ohrbound/test", { method: "POST", body: { aliasId: "light", progress: { completed: ["a"] } } });
	assert.deepEqual(result, { saved: true });
	assert.equal(captured.options.credentials, "include");
	assert.equal(captured.options.body.get("aliasId"), "light");
	assert.equal(JSON.parse(captured.options.body.get("progress")).completed[0], "a");
});
