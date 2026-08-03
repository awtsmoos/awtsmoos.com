//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationCompletionPoller } from "../relay/direct/chatgpt/ConversationCompletionPoller.mjs";

/** A successful authenticated route GET never opens the legacy fallbacks. */
test("completion prefers authenticated route native DOM", async () => {
	let routeCalls = 0;
	const poller = new ConversationCompletionPoller(null, {
		domPoller: { async poll() { return { done: true, pollCount: 2 }; } },
		graphPoller: { async poll() { throw new Error("legacy graph should not run"); } },
		routePoller: { async poll() { routeCalls += 1; } }
	});
	const result = await poller.poll({ timeoutMs: 60000 });
	assert.equal(result.completionSource, "authenticated-route-get-dom");
	assert.equal(routeCalls, 0);
});

/** A failed request GET falls back only to another authenticated GET observer. */
test("completion falls back without repeating the POST", async () => {
	let clock = 1000;
	const routeOptions = [];
	const poller = new ConversationCompletionPoller(null, {
		primaryTimeoutMs: 15000,
		domPoller: { async poll() { clock += 7000; throw new Error("DOM unavailable"); } },
		graphPoller: { async poll() { throw new Error("GET unavailable"); } },
		routePoller: { async poll(options) { routeOptions.push(options); return { done: true, pollCount: 1 }; } },
		now: () => clock
	});
	const result = await poller.poll({ timeoutMs: 60000, conversationId: "safe" });
	assert.equal(result.completionSource, "route-observer-get");
	assert.equal(routeOptions.length, 1);
	assert.equal(routeOptions[0].timeoutMs, 53000);
});
