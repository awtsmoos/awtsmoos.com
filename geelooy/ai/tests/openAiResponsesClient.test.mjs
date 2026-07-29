//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { OpenAiResponsesClient } from "../relay/direct/openai/OpenAiResponsesClient.mjs";

/** Native fetch sends one official Responses request and returns no credential. */
test("official Responses client builds a request-only continuation", async () => {
	const calls = [];
	const client = new OpenAiResponsesClient({
		apiKeyResolver: () => "server-secret-key",
		fetchImpl: async (url, options) => {
			calls.push({ url, options });
			return {
				ok: true,
				status: 200,
				async text() {
					return JSON.stringify({
						id: "resp_private_2",
						status: "completed",
						model: "gpt-test",
						output: [{ content: [{ type: "output_text", text: "exact answer" }] }],
						usage: { input_tokens: 4, output_tokens: 2, total_tokens: 6 }
					});
				}
			};
		}
	});
	const result = await client.send({
		prompt: "hello",
		previousResponseId: "resp_private_1",
		model: "gpt-test",
		thinkingEffort: "low",
		timeoutMs: 5000
	});
	const body = JSON.parse(calls[0].options.body);
	assert.equal(calls[0].url, "https://api.openai.com/v1/responses");
	assert.equal(calls[0].options.method, "POST");
	assert.equal(calls[0].options.headers.Authorization, "Bearer server-secret-key");
	assert.deepEqual(body, {
		model: "gpt-test",
		input: "hello",
		store: true,
		previous_response_id: "resp_private_1",
		reasoning: { effort: "low" }
	});
	assert.equal(result.answer, "exact answer");
	assert.equal(result.responseId, "resp_private_2");
	assert.equal(JSON.stringify(result).includes("server-secret-key"), false);
});

/** Missing credentials fail before fetch and never fall back to a browser. */
test("official Responses client requires a server-side API key", async () => {
	let fetchCalls = 0;
	const client = new OpenAiResponsesClient({
		apiKeyResolver: () => "",
		fetchImpl: async () => {
			fetchCalls += 1;
		}
	});
	await assert.rejects(
		() => client.send({ prompt: "hello" }),
		error => error.code === "official_api_key_required"
	);
	assert.equal(fetchCalls, 0);
});

/** Provider failures expose a fixed code, not provider bodies or credentials. */
test("official Responses client sanitizes upstream failures", async () => {
	const client = new OpenAiResponsesClient({
		apiKeyResolver: () => "server-secret-key",
		fetchImpl: async () => ({
			ok: false,
			status: 429,
			async text() {
				return JSON.stringify({ error: { type: "rate_limit_error", message: "private" } });
			}
		})
	});
	await assert.rejects(
		() => client.send({ prompt: "hello" }),
		error => {
			assert.equal(error.code, "official_api_request_failed");
			assert.equal(error.httpStatus, 429);
			assert.equal(error.message.includes("private"), false);
			assert.equal(error.message.includes("server-secret-key"), false);
			return true;
		}
	);
});
