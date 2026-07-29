//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { LocalConversationService } from "../relay/direct/local/LocalConversationService.mjs";
import { RequestOnlyProviderRouter } from "../relay/direct/local/RequestOnlyProviderRouter.mjs";

/** A local conversation can be created, read, continued, and read again. */
test("local transcript retrieval preserves ordered continuation", async () => {
	let call = 0;
	const service = new LocalConversationService({
		pacer: {
			minimumIntervalMs: 10000,
			async enter() { return { waitMs: 0, intervalMs: call ? 10000 : null }; }
		},
		client: {
			async configured() { return true; },
			async send() {
				call += 1;
				return {
					answer: `answer-${call}`,
					status: 200,
					done: true,
					model: "local-test",
					usage: null,
					requestLatencyMs: 7
				};
			}
		}
	});
	const created = await service.send({ prompt: "first prompt" });
	const firstRead = service.conversation(created.conversationKey);
	assert.equal(firstRead.messageCount, 2);
	assert.deepEqual(firstRead.messages, [
		{ role: "user", content: "first prompt" },
		{ role: "assistant", content: "answer-1" }
	]);
	const continued = await service.send({
		prompt: "second prompt",
		conversationKey: created.conversationKey
	});
	const secondRead = service.conversation(created.conversationKey);
	assert.equal(continued.conversationKey, created.conversationKey);
	assert.equal(secondRead.messageCount, 4);
	assert.deepEqual(secondRead.messages.slice(-2), [
		{ role: "user", content: "second prompt" },
		{ role: "assistant", content: "answer-2" }
	]);
	assert.equal(JSON.stringify(secondRead).includes("system"), false);
});

/** Unknown opaque keys fail with one stable public code. */
test("provider router rejects unknown transcript keys", () => {
	const empty = {
		conversation: () => null,
		configured: () => false,
		reset: () => ({ deleted: 0 }),
		status: () => ({ configured: false })
	};
	const router = new RequestOnlyProviderRouter({
		apiService: empty,
		localService: empty
	});
	assert.throws(
		() => router.conversation("BH_DIRECT_UNKNOWN"),
		error => error.code === "direct_conversation_expired"
	);
});
