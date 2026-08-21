//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Awtsmoos Browser Proxy Profile Payload Test
 * @description The Awtsmoos gives one measured browser voice to the proxy request;
 * Awtsmoos.com proves control characters and duplicate languages fade away before
 * the profile crosses, while no unrelated browser authority joins the array.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { fetchRemotePage } from "../programs/awtsmoos-browser/proxyClient.js";

test("proxy client adds only sanitized explicit browser profile testimony", async () => {
	const calls = [];
	const fetchImpl = async (url, options) => {
		calls.push({ url, options });
		return fakeResponse(200, { status: 200, text: "ok" });
	};
	await fetchRemotePage({
		aliasId: "asdf",
		browserProfile: {
			userAgent: "  Local\r\nBrowser/7  ",
			languages: ["en-US", "EN-us", "he-IL"],
			platform: "macOS\n"
		},
		url: "https://example.com/"
	}, fetchImpl);
	const payload = JSON.parse(calls[0].options.body);
	assert.deepEqual(payload.browserProfile, {
		userAgent: "LocalBrowser/7",
		language: "en-US",
		languages: ["en-US", "he-IL"],
		platform: "macOS"
	});
});

function fakeResponse(status, payload) {
	return {
		ok: status >= 200 && status < 300,
		status,
		headers: { get: () => null },
		async json() {
			return payload;
		}
	};
}
