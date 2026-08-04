// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { DirectClient } from "./DirectClient.mjs";

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
					promptVerified: true,
					dispatched: true,
					submissionTransport: "chatgpt-website-composer"
				};
			}
		}
	});
}

test("accepted POST closes, starts cooldown, and returns without answer polling", async () => {
	const order = [];
	const result = await acceptedTurn(order).send({
		prompt: "prompt",
		onTabClosed: async () => order.push("cooldown-started")
	});
	order.push("returned");
	assert.deepEqual(order, ["accepted-post", "verified-close", "cooldown-started", "returned"]);
	assert.equal(result.answer, "");
	assert.equal(result.done, false);
	assert.equal(result.dispatched, true);
	assert.equal(result.accepted, true);
	assert.equal(result.completionSource, "not-awaited-agent-continues-through-tunnel");
	assert.equal(result.responseStatus, 200);
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
