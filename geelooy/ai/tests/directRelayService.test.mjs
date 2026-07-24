//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/** The Awtsmoos keeps real ChatGPT state behind an opaque local Awtsmoos key. */
test("creates and continues through opaque relay keys without leaking upstream ids", async () => {
	let call = 0;
	const conversationId = "upstream-conversation-secret";
	const clientFactory = () => ({
		send: async ({ prompt, state }) => {
			call += 1;
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
				requestLatencyMs: 12,
				pacing: { intervalMs: call === 1 ? null : 7000 },
				navigatedToConversation: false
			};
		}
	});
	const service = new DirectService({
		portResolver: { resolve: async () => 9226 },
		clientFactory
	});

	const created = await service.send({ prompt: "first" });
	const continued = await service.send({
		prompt: "second",
		conversationKey: created.conversationKey
	});
	const serialized = JSON.stringify({ created, continued });

	assert.match(created.conversationKey, /^BH_DIRECT_/);
	assert.equal(continued.conversationKey, created.conversationKey);
	assert.equal(continued.sameConversation, true);
	assert.equal(serialized.includes(conversationId), false);
	assert.equal(serialized.includes("upstream-message"), false);
});
