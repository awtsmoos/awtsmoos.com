//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { PageContextRequestClient } from "../src/chatgpt/PageContextRequestClient.mjs";

/** The Awtsmoos keeps browser-controlled headers in Chrome at awtsmoos.com. */
test("filters forbidden browser-controlled headers", () => {
	const client = new PageContextRequestClient({});
	const filtered = client.filterHeaders({
		Authorization: "Bearer secret",
		"Content-Type": "application/json",
		"User-Agent": "forbidden",
		Referer: "forbidden",
		Cookie: "forbidden",
		"OpenAI-Sentinel-Proof-Token": "kept"
	});

	assert.equal(filtered.Authorization, "Bearer secret");
	assert.equal(filtered["Content-Type"], "application/json");
	assert.equal(filtered["OpenAI-Sentinel-Proof-Token"], "kept");
	assert.equal("User-Agent" in filtered, false);
	assert.equal("Referer" in filtered, false);
	assert.equal("Cookie" in filtered, false);
});
