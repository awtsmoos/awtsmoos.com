//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/** Browser fallback still creates and continues without leaking upstream ids. */
test("explicit fallback preserves opaque browser continuity", async () => {
	let call = 0;
	const conversationId = "upstream-conversation-secret";
	const service = new DirectService({
		portResolver: { resolve: async () => 9226 },
		clientFactory: () => ({
			send: async ({ prompt, state }) => {
				call += 1;
				return makeBrowserResult({ prompt, state, conversationId, call });
			}
		}),
		apiService: unavailableApi(),
		localService: unavailableLocal()
	});
	const created = await service.send({
		prompt: "first",
		mode: "page-authorized-fallback"
	});
	const continued = await service.send({
		prompt: "second",
		conversationKey: created.conversationKey,
		mode: "page-authorized-fallback"
	});
	const serialized = JSON.stringify({ created, continued });
	assert.match(created.conversationKey, /^BH_DIRECT_/);
	assert.equal(continued.conversationKey, created.conversationKey);
	assert.equal(continued.sameConversation, true);
	assert.equal(serialized.includes(conversationId), false);
	assert.equal(serialized.includes("upstream-message"), false);
});

/** Strict mode uses the official API without constructing or inspecting a browser. */
test("strict request-only mode prefers configured official API", async () => {
	let fallbackCalls = 0;
	let localCalls = 0;
	const apiCalls = [];
	const service = new DirectService({
		fallbackService: fallbackStub(() => fallbackCalls += 1),
		apiService: {
			configured: () => true,
			async send(options) {
				apiCalls.push(options);
				return { ok: true, answer: "official request only" };
			},
			reset: () => ({ deleted: 0 }),
			status: () => providerStatus(true, "official-responses-api")
		},
		localService: {
			async configured() { return true; },
			async send() {
				localCalls += 1;
				return { ok: true, answer: "local request only" };
			},
			reset: () => ({ deleted: 0 }),
			status: () => providerStatus(true, "local-llama-http")
		}
	});
	const result = await service.send({ prompt: "strict" });
	assert.equal(result.answer, "official request only");
	assert.equal(apiCalls.length, 1);
	assert.equal(localCalls, 0);
	assert.equal(fallbackCalls, 0);
	const capability = await service.capability();
	assert.equal(capability.transport, "official-responses-api");
	assert.equal(capability.browserRequired, false);
	assert.equal(capability.browserInspected, false);
});

/** Strict mode uses local HTTP when the official credential is absent. */
test("strict request-only mode falls back to localhost, never browser", async () => {
	let fallbackCalls = 0;
	let localCalls = 0;
	const service = new DirectService({
		fallbackService: fallbackStub(() => fallbackCalls += 1),
		apiService: unavailableApi(),
		localService: {
			async configured() { return true; },
			async send() {
				localCalls += 1;
				return { ok: true, answer: "local request only" };
			},
			reset: () => ({ deleted: 0 }),
			status: () => providerStatus(true, "local-llama-http")
		}
	});
	const result = await service.send({ prompt: "strict" });
	assert.equal(result.answer, "local request only");
	assert.equal(localCalls, 1);
	assert.equal(fallbackCalls, 0);
	assert.equal((await service.capability()).transport, "local-llama-http");
});

/** Missing request-only providers fail immediately without browser work. */
test("strict request-only mode fails before browser interaction", async () => {
	let fallbackCalls = 0;
	const service = new DirectService({
		fallbackService: fallbackStub(() => fallbackCalls += 1),
		apiService: unavailableApi(),
		localService: unavailableLocal()
	});
	await assert.rejects(
		() => service.send({ prompt: "strict" }),
		error => error.code === "request_only_provider_unavailable"
	);
	assert.equal(fallbackCalls, 0);
	const capability = await service.capability();
	assert.equal(capability.strictChatReady, false);
	assert.equal(capability.browserInspected, false);
	assert.equal(capability.failureCode, "request_only_provider_unavailable");
});

function unavailableApi() {
	return {
		configured: () => false,
		async send() { throw new Error("Official API must not be called."); },
		reset: () => ({ deleted: 0 }),
		status: () => providerStatus(false, "official-responses-api")
	};
}

function unavailableLocal() {
	return {
		async configured() { return false; },
		async send() { throw new Error("Local model must not be called."); },
		reset: () => ({ deleted: 0 }),
		status: () => providerStatus(false, "local-llama-http")
	};
}

function providerStatus(configured, transport) {
	return { configured, transport, minimumIntervalMs: 10000, activeConversations: 0 };
}

function fallbackStub(onSend) {
	return {
		async send() { onSend(); },
		async close() {},
		status: () => ({})
	};
}

function makeBrowserResult({ prompt, state, conversationId, call }) {
	return {
		answer: `answer:${prompt}`,
		state: {
			conversationId: state?.conversationId ?? conversationId,
			parentMessageId: `upstream-message-${call}`
		},
		status: 200,
		done: true,
		frames: 0,
		items: 6,
		subscriptionAttempts: 1,
		completionSource: "page-request-get",
		requestLatencyMs: 12,
		pacing: { intervalMs: call === 1 ? null : 10000 },
		hostReuseSource: call === 1 ? "fresh" : "reused",
		navigatedToConversation: false
	};
}
