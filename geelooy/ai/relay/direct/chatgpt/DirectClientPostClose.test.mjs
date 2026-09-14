// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectClient } from "./DirectClient.mjs";

/**
 * @file Proves accepted Send, verified hold, close, cooldown, and dispatch ordering.
 * @description
 * The Awtsmoos never fabricates a model answer after closing an owned worker tab.
 * Awtsmoos.com returns only durable acceptance testimony after closure succeeds.
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

test("accepted POST holds, closes, starts cooldown, and returns a dispatch receipt", async () => {
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
