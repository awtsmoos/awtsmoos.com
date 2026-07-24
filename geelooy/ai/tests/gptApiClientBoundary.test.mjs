//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { GptApiClient } from "../js/chatgpt/api/GptApiClient.js";

/** The browser boundary is explicit when the extension is not installed. */
test("missing extension produces a stable safe error", async () => {
	const client = new GptApiClient({
		fetcher: publicCapabilityFetch([]),
		bridge: null
	});

	await assert.rejects(
		() => client.chat({ prompt: "needs bridge" }),
		error => error.code === "GPT_BROWSER_BRIDGE_UNAVAILABLE"
	);
});

/** Cached topology avoids repeated public-server preflight for continuations. */
test("browser topology is cached across chat continuations", async () => {
	const requests = [];
	const client = new GptApiClient({
		fetcher: publicCapabilityFetch(requests),
		bridge: {
			directChat: async payload => ({
				ok: true,
				answer: payload.prompt,
				conversationKey: "BH_DIRECT_cached"
			})
		}
	});
	await client.chat({ prompt: "one" });
	await client.chat({
		prompt: "two",
		conversationKey: "BH_DIRECT_cached"
	});

	assert.equal(requests.length, 1);
	assert.match(requests[0].url, /\/capability$/);
});

/** Explicit refresh repeats only the harmless capability preflight. */
test("topology refresh does not send chat state", async () => {
	const requests = [];
	const client = new GptApiClient({
		fetcher: publicCapabilityFetch(requests),
		bridge: {
			directCapability: async () => ({
				ok: true,
				mode: "strict-request-only"
			})
		}
	});
	await client.capability();
	await client.capability({ refresh: true });

	assert.equal(requests.length, 2);
	assert.equal(requests.every(item => item.options.body === undefined), true);
});

function publicCapabilityFetch(requests) {
	return async (url, options) => {
		requests.push({ url, options });
		return new Response(JSON.stringify({
			ok: true,
			transport: "browser-extension",
			clientExecutionRequired: true,
			serverRelayAttempted: false
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	};
}
