// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { DetachedConversationPoller } from "./DetachedConversationPoller.mjs";

test("detached poller performs GET requests only and opens no browser vessel", async () => {
	const calls = [];
	let reductions = 0;
	const poller = new DetachedConversationPoller({
		intervalMs: 1000,
		sleep: async () => undefined,
		fetcher: async (url, options) => {
			calls.push({ url, options });
			return { status: 200, json: async () => ({ mapping: {} }) };
		},
		reducer: {
			reduce(_document, options) {
				reductions += 1;
				return reductions === 1
					? { done: false }
					: { done: true, answer: "finished", conversationId: options.conversationId,
						parentMessageId: "assistant-one", itemCount: 3 };
			}
		}
	});
	const result = await poller.poll({
		conversationId: "conversation-one",
		userMessageId: "user-one",
		previousParentMessageId: null,
		session: { cookieHeader: "session=private", userAgent: "Fixture", headers: {} },
		timeoutMs: 10000
	});
	assert.equal(result.answer, "finished");
	assert.equal(result.completionSource, "detached-authenticated-get");
	assert.equal(calls.length, 2);
	assert.ok(calls.every(call => call.options.method === "GET"));
	assert.ok(calls.every(call => call.url.includes("conversation-one")));
});
