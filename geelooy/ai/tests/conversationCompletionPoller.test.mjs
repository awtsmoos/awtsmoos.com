//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationCompletionPoller } from "../relay/direct/chatgpt/ConversationCompletionPoller.mjs";

/** A successful page-request GET never opens the route-observer fallback. */
test("completion prefers same-origin request GET", async () => {
	let routeCalls = 0;
	const poller = new ConversationCompletionPoller(null, {
		graphPoller: { async poll() { return { done: true, pollCount: 2 }; } },
		routePoller: { async poll() { routeCalls += 1; } }
	});
	const result = await poller.poll({ timeoutMs: 60000 });
	assert.equal(result.completionSource, "page-request-get");
	assert.equal(routeCalls, 0);
});

/** A failed request GET falls back only to another authenticated GET observer. */
test("completion falls back without repeating the POST", async () => {
	let clock = 1000;
	const routeOptions = [];
	const poller = new ConversationCompletionPoller(null, {
		primaryTimeoutMs: 15000,
		graphPoller: { async poll() { clock += 7000; throw new Error("GET unavailable"); } },
		routePoller: { async poll(options) { routeOptions.push(options); return { done: true, pollCount: 1 }; } },
		now: () => clock
	});
	const result = await poller.poll({ timeoutMs: 60000, conversationId: "safe" });
	assert.equal(result.completionSource, "route-observer-get");
	assert.equal(routeOptions.length, 1);
	assert.equal(routeOptions[0].timeoutMs, 53000);
});
