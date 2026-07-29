//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { LocalConversationService } from "../relay/direct/local/LocalConversationService.mjs";

/** Local history continues behind one opaque key and stays bounded. */
test("local conversation service preserves bounded continuity", async () => {
	const requests = [];
	const service = new LocalConversationService({
		maximumMessages: 4,
		pacer: { minimumIntervalMs: 10000, async enter() { return { waitMs: 0 }; } },
		client: {
			async configured() { return true; },
			async send({ messages }) {
				requests.push(messages);
				return {
					answer: `answer-${requests.length}`,
					status: 200,
					done: true,
					model: "local-test",
					usage: null,
					requestLatencyMs: 5
				};
			}
		}
	});
	const first = await service.send({ prompt: "one" });
	const second = await service.send({ prompt: "two", conversationKey: first.conversationKey });
	assert.match(first.conversationKey, /^BH_DIRECT_/);
	assert.equal(second.conversationKey, first.conversationKey);
	assert.equal(second.created, false);
	assert.deepEqual(requests[1].map(message => message.role), [
		"system", "user", "assistant", "user"
	]);
	assert.equal(JSON.stringify(second).includes("answer-1"), false);
});
