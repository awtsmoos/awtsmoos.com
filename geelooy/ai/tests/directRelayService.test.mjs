//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/** The Awtsmoos keeps real ChatGPT state behind an opaque local Awtsmoos key. */
test("explicit fallback creates and continues without leaking upstream ids", async () => {
	let call = 0;
	const conversationId = "upstream-conversation-secret";
	const clientFactory = () => ({
		send: async ({ prompt, state }) => {
			call += 1;
			return makeResult({ prompt, state, conversationId, call });
		}
	});
	const service = new DirectService({
		portResolver: { resolve: async () => 9226 },
		clientFactory
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
	assert.equal(created.mode, "page-authorized-fallback");
	assert.equal(continued.conversationKey, created.conversationKey);
	assert.equal(continued.sameConversation, true);
	assert.equal(serialized.includes(conversationId), false);
	assert.equal(serialized.includes("upstream-message"), false);
});

/** Strict mode must inspect capability and stop before constructing a carrier. */
test("strict request-only mode refuses normal enforcement without fallback", async () => {
	let clientFactoryCalls = 0;
	const capability = {
		ok: true,
		mode: "strict-request-only",
		enforcementRequired: true,
		strictChatReady: false,
		fallbackRequired: true
	};
	const service = new DirectService({
		portResolver: { resolve: async () => 9226 },
		clientFactory: () => {
			clientFactoryCalls += 1;
			throw new Error("Carrier client must not be constructed in strict mode.");
		},
		capabilityService: {
			inspect: async () => capability
		}
	});

	await assert.rejects(
		() => service.send({ prompt: "strict" }),
		error => {
			assert.equal(error.code, "direct_enforcement_required");
			assert.deepEqual(error.capability, capability);
			return true;
		}
	);
	assert.equal(clientFactoryCalls, 0);
});

function makeResult({ prompt, state, conversationId, call }) {
	return {
		answer: `answer:${prompt}`,
		state: {
			conversationId: state?.conversationId ?? conversationId,
			parentMessageId: `upstream-message-${call}`
		},
		status: 200,
		done: true,
		frames: 4,
		items: 6,
		subscriptionAttempts: 1,
		requestLatencyMs: 12,
		pacing: { intervalMs: call === 1 ? null : 7000 },
		navigatedToConversation: false
	};
}
