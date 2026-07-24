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

/** The handoff reader must terminate at `[DONE]` without waiting for EOF. */
test("builds an incremental bounded SSE handoff reader", () => {
	const client = new PageContextRequestClient({});
	const request = {
		url: "https://chatgpt.com/backend-api/f/conversation",
		method: "POST",
		headers: { "Content-Type": "application/json" },
		postData: "{}"
	};
	const expression = client.buildExpression(
		request,
		client.filterHeaders(request.headers),
		180000
	);

	assert.match(expression, /body\.getReader\(\)/);
	assert.match(expression, /data: \[DONE\]/);
	assert.match(expression, /reader\.cancel\(\)/);
	assert.match(expression, /Conversation handoff read timed out/);
	assert.match(expression, /abortController\.abort\(\)/);
	assert.match(expression, /Conversation handoff exceeded one megabyte/);
});

/** The CDP call gets a margin beyond the in-page request budget. */
test("returns the incremental page-context response", async () => {
	const calls = [];
	const cdpClient = {
		send: async (method, params, timeoutMs) => {
			calls.push({ method, params, timeoutMs });
			return {
				result: {
					value: {
						status: 200,
						contentType: "text/event-stream; charset=utf-8",
						text: "data: [DONE]\n\n",
						endedByDoneMarker: true
					}
				}
			};
		}
	};
	const client = new PageContextRequestClient(cdpClient);
	const response = await client.send({
		url: "https://chatgpt.com/backend-api/f/conversation",
		method: "POST",
		headers: { "Content-Type": "application/json" },
		postData: "{}"
	}, 180000);

	assert.equal(response.endedByDoneMarker, true);
	assert.equal(calls[0].method, "Runtime.evaluate");
	assert.equal(calls[0].timeoutMs, 190000);
});
