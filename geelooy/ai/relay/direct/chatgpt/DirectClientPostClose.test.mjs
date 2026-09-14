//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectClient } from "./DirectClient.mjs";

/**
 * @file Proves one accepted Send returns durable conversation, hold, close, and cooldown evidence.
 * @description
 * The Awtsmoos never fabricates an answer, yet never forgets the conversation born from the Send;
 * Awtsmoos.com returns its canonical thread together with verified closure so recovery knows where to mend.
 */
function acceptedTurn(order, verified = true) {
	return new DirectClient({
		hostLease: {
			async run(operation) {
				const value = await operation({}, { source: "fresh", acquireMs: 0 });
				order.push("verified-close");
				return { ...value, tabClose: { closed: verified, verified, attempts: 1 } };
			},
			close: async () => undefined,
			status: () => ({})
		},
		sendHold: {
			async wait(acceptedAt) {
				order.push("verified-hold");
				return { acceptedAt, heldMs: 20000, minimumMs: 20000, verified: true };
			}
		},
		turnExecutor: {
			async execute() {
				order.push("accepted-post");
				return {
					submission: {
						conversationId: "conversation-one",
						userMessageId: "user-one",
						acceptedAt: 123456789
					},
					responseStatus: 200,
					requestLatencyMs: 1,
					hostReuseSource: "fresh",
					composerTouched: true,
					promptVerified: true,
					dispatched: true,
					submissionTransport: "chatgpt-website-composer"
				};
			}
		}
	});
}

test("accepted POST holds, closes, and returns the canonical conversation receipt", async () => {
	const order = [];
	const result = await acceptedTurn(order).send({
		prompt: "prompt",
		onTabClosed: async () => order.push("cooldown-started")
	});
	order.push("returned");
	assert.deepEqual(order, [
		"accepted-post", "verified-hold", "verified-close", "cooldown-started", "returned"
	]);
	assert.equal(result.answer, "");
	assert.equal(result.done, false);
	assert.equal(result.dispatched, true);
	assert.equal(result.accepted, true);
	assert.equal(result.conversationId, "conversation-one");
	assert.equal(result.conversationKey, "conversation-one");
	assert.equal(result.conversationUrl, "https://chatgpt.com/c/conversation-one");
	assert.equal(result.pacing.verified, true);
	assert.equal(result.completionSource, "not-awaited-agent-continues-through-tunnel");
});

test("unverified close prevents cooldown and dispatch receipt", async () => {
	const order = [];
	let callbacks = 0;
	await assert.rejects(() => acceptedTurn(order, false).send({
		prompt: "prompt",
		onTabClosed: async () => { callbacks += 1; }
	}), error => error.code === "owned_target_close_unverified");
	assert.equal(callbacks, 0);
});
