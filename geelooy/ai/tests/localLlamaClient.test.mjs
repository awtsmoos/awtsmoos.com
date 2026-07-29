//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { LocalLlamaClient } from "../relay/direct/local/LocalLlamaClient.mjs";

/** Loopback chat sends only a bounded OpenAI-compatible request. */
test("local llama client sends deterministic chat completion", async () => {
	const calls = [];
	const client = new LocalLlamaClient({
		baseUrl: "http://127.0.0.1:18080/",
		model: "local-test",
		fetchImpl: async (url, options) => {
			calls.push({ url, options });
			return {
				ok: true,
				status: 200,
				async text() {
					return JSON.stringify({
						model: "local-test",
						choices: [{ finish_reason: "stop", message: { content: "exact" } }],
						usage: { prompt_tokens: 3, completion_tokens: 1, total_tokens: 4 }
					});
				}
			};
		}
	});
	const result = await client.send({
		messages: [{ role: "user", content: "reply exactly" }]
	});
	const body = JSON.parse(calls[0].options.body);
	assert.equal(calls[0].url, "http://127.0.0.1:18080/v1/chat/completions");
	assert.equal(body.temperature, 0);
	assert.equal(body.stream, false);
	assert.deepEqual(body.chat_template_kwargs, { enable_thinking: false });
	assert.equal(result.answer, "exact");
	assert.equal(result.usage.totalTokens, 4);
});

/** Health failure is a safe false rather than an exception. */
test("local llama client reports unavailable safely", async () => {
	const client = new LocalLlamaClient({
		fetchImpl: async () => { throw new Error("offline"); }
	});
	assert.equal(await client.configured(), false);
});
