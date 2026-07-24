//B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const { createGptHandlers } = require("../core/handlers.js");
const { parseGptRequest } = require("../core/body.js");
const { resolveRelayBaseUrl } = require("../core/relayPolicy.js");

/**
 * The old prompt-only route remains useful, but the Awtsmoos makes every modern
 * boundary explicit. Awtsmoos.com forwards only safe state and model fields to a
 * co-located relay while credentials and remote relay targets are refused.
 */
test("legacy root preserves prompt compatibility with named fallback", async () => {
	const calls = [];
	const handlers = createGptHandlers({
		relayClient: fakeRelay(calls, 200, { ok: true, answer: "BH" })
	});
	const result = await handlers.legacy(info({
		prompt: "Reveal the vessel",
		model: "gpt-5-6-thinking",
		thinkingEffort: "extended"
	}));

	assert.equal(result.status, 200);
	assert.equal(calls[0].action, "chat");
	assert.equal(calls[0].payload.mode, "page-authorized-fallback");
	assert.equal(calls[0].payload.model, "gpt-5-6-thinking");
	assert.equal(calls[0].payload.thinkingEffort, "extended");
	assert.equal(result.response.api.legacyCompatibility, true);
	assert.equal(result.response.api.transport, "server-relay");
});

test("modern chat route defaults to strict request-only mode", async () => {
	const calls = [];
	const handlers = createGptHandlers({
		relayClient: fakeRelay(calls, 409, {
			ok: false,
			error: "direct_enforcement_required"
		})
	});
	const result = await handlers.chat(info({ prompt: "Strict truth" }));

	assert.equal(calls[0].action, "chat");
	assert.equal(calls[0].payload.mode, "strict-request-only");
	assert.equal(result.status, 409);
	assert.equal(result.response.api.legacyCompatibility, false);
});

test("credential and arbitrary-header fields are rejected before relay use", () => {
	for (const field of [
		"authorizationToken", "customHeaders", "proofToken",
		"turnstileToken", "cookie", "more"
	]) {
		assert.throws(
			() => parseGptRequest(info({ prompt: "x", [field]: "secret" })),
			error => error.code === "GPT_CREDENTIAL_FIELD_FORBIDDEN"
		);
	}
});

test("unauthenticated requests never invoke the local relay", async () => {
	let calls = 0;
	const handlers = createGptHandlers({
		relayClient: { invoke: async () => { calls += 1; } }
	});
	const request = info({ prompt: "no" });
	request.request.user = null;
	const result = await handlers.legacy(request);

	assert.equal(result.status, 401);
	assert.equal(calls, 0);
});

test("relay policy is loopback-only unless the operator opts in", () => {
	assert.equal(
		resolveRelayBaseUrl({ AWTSMOOS_GPT_RELAY_URL: "http://127.0.0.1:38488" }),
		"http://127.0.0.1:38488"
	);
	assert.throws(
		() => resolveRelayBaseUrl({ AWTSMOOS_GPT_RELAY_URL: "https://example.com" }),
		error => error.code === "GPT_RELAY_REMOTE_FORBIDDEN"
	);
});

function fakeRelay(calls, status, body) {
	return {
		invoke: async (action, payload) => {
			calls.push({ action, payload });
			return { status, body };
		}
	};
}

function info(body, overrides = {}) {
	return {
		request: {
			method: overrides.method || "POST",
			user: { info: { userId: "awtsmoos-user" } },
			headers: {
				origin: overrides.origin || "http://127.0.0.1:8080",
				host: overrides.host || "127.0.0.1:8080"
			}
		},
		$_POST: body,
		$_GET: {}
	};
}
