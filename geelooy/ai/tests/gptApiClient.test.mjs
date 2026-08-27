//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { GptApiClient } from "../js/chatgpt/api/GptApiClient.js";

/** The public descriptor hands capability to the visitor's normal extension. */
test("capability follows browser-extension topology", async () => {
	let bridgeCalls = 0;
	const requests = [];
	const client = new GptApiClient({
		fetcher: sequenceFetch(requests, [publicCapability()]),
		bridge: {
			directCapability: async () => {
				bridgeCalls += 1;
				return { ok: true, mode: "strict-request-only" };
			}
		}
	});
	const result = await client.capability();

	assert.equal(bridgeCalls, 1);
	assert.equal(requests.length, 1);
	assert.match(requests[0].url, /\/capability$/);
	assert.equal(result.mode, "strict-request-only");
	assert.equal(result.apiTransport, "browser-extension");
});

/** Public chat discovers topology first, so its prompt never reaches the API. */
test("chat keeps public prompt inside the local bridge", async () => {
	let bridgePayload = null;
	const requests = [];
	const client = new GptApiClient({
		fetcher: sequenceFetch(requests, [publicCapability()]),
		bridge: {
			directChat: async payload => {
				bridgePayload = payload;
				return { ok: true, answer: "BH", conversationKey: "BH_DIRECT_local" };
			}
		}
	});
	const result = await client.chat({
		prompt: "private prompt",
		mode: "page-authorized-fallback",
		model: "gpt-5-6-thinking",
		thinkingEffort: "extended"
	});

	assert.equal(requests.length, 1);
	assert.match(requests[0].url, /\/capability$/);
	assert.equal(requests[0].options.body, undefined);
	assert.equal(JSON.stringify(requests).includes("private prompt"), false);
	assert.equal(bridgePayload.prompt, "private prompt");
	assert.equal(result.answer, "BH");
});

/** A co-located topology preflight is followed by one server-side chat request. */
test("local server relay result stays on the server path", async () => {
	let bridgeCalls = 0;
	const requests = [];
	const client = new GptApiClient({
		fetcher: sequenceFetch(requests, [
			serverCapability(),
			{
				ok: true,
				answer: "server answer",
				api: { transport: "server-relay" }
			}
		]),
		bridge: {
			directChat: async () => {
				bridgeCalls += 1;
			}
		}
	});
	const result = await client.chat({ prompt: "local" });

	assert.equal(requests.length, 2);
	assert.match(requests[0].url, /\/capability$/);
	assert.match(requests[1].url, /\/chat$/);
	assert.equal(result.answer, "server answer");
	assert.equal(bridgeCalls, 0);
});

function publicCapability() {
	return {
		ok: true,
		transport: "browser-extension",
		clientExecutionRequired: true,
		serverRelayAttempted: false
	};
}

function serverCapability() {
	return {
		ok: true,
		mode: "strict-request-only",
		api: { transport: "server-relay" }
	};
}

function sequenceFetch(requests, bodies) {
	let index = 0;
	return async (url, options) => {
		requests.push({ url, options });
		const body = bodies[Math.min(index, bodies.length - 1)];
		index += 1;
		return new Response(JSON.stringify(body), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	};
}
