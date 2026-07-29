//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { RequestOnlyApiConversationService } from "../relay/direct/openai/RequestOnlyApiConversationService.mjs";

/** Official API conversations continue by response id behind one opaque local key. */
test("request-only API service creates and continues without leaking ids", async () => {
	const requests = [];
	let call = 0;
	const service = new RequestOnlyApiConversationService({
		pacer: {
			minimumIntervalMs: 10000,
			async enter() {
				return { waitMs: 0, intervalMs: call === 0 ? null : 10000 };
			}
		},
		client: {
			configured: () => true,
			async send(options) {
				requests.push(options);
				call += 1;
				return {
					responseId: `resp_private_${call}`,
					answer: `answer ${call}`,
					status: 200,
					done: true,
					model: "gpt-test",
					usage: null,
					requestLatencyMs: 7
				};
			}
		}
	});
	const created = await service.send({ prompt: "first" });
	const continued = await service.send({
		prompt: "second",
		conversationKey: created.conversationKey
	});
	assert.match(created.conversationKey, /^BH_DIRECT_/);
	assert.equal(continued.conversationKey, created.conversationKey);
	assert.equal(created.created, true);
	assert.equal(continued.created, false);
	assert.equal(requests[0].previousResponseId, null);
	assert.equal(requests[1].previousResponseId, "resp_private_1");
	assert.equal(continued.completionSource, "official-responses-api");
	const serialized = JSON.stringify({ created, continued });
	assert.equal(serialized.includes("resp_private_"), false);
});
