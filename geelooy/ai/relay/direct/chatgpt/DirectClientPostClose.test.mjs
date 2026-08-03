// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { DirectClient } from "./DirectClient.mjs";

test("verified tab close and cooldown callback precede detached answer polling", async () => {
	const order = [];
	const session = { cookieHeader: "private", userAgent: "Fixture", headers: {} };
	const client = new DirectClient({
		hostLease: {
			async run(operation) {
				const value = await operation({}, { source: "fresh", acquireMs: 0 });
				order.push("verified-close");
				return { ...value, tabClose: { closed: true, verified: true, attempts: 1 } };
			},
			close: async () => undefined,
			status: () => ({})
		},
		turnExecutor: {
			async execute() {
				order.push("accepted-post");
				return {
					submission: { conversationId: "conversation-one", userMessageId: "user-one",
						previousParentMessageId: null, session },
					requestLatencyMs: 1, hostReuseSource: "fresh",
					submissionTransport: "chatgpt-website-composer"
				};
			}
		},
		detachedPoller: {
			async poll(options) {
				order.push("detached-get");
				assert.equal(options.session, session);
				return { done: true, answer: "answer", conversationId: "conversation-one",
					parentMessageId: "assistant-one", itemCount: 3, pollCount: 1,
					completionSource: "detached-authenticated-get" };
			}
		}
	});
	const result = await client.send({
		prompt: "prompt",
		onTabClosed: async () => order.push("cooldown-started")
	});
	assert.deepEqual(order, ["accepted-post", "verified-close", "cooldown-started", "detached-get"]);
	assert.equal(result.answer, "answer");
	assert.equal(Object.hasOwn(result.state, "detachedSession"), false);
	assert.equal(JSON.stringify(result).includes("private"), false);
});

test("unverified close prevents cooldown and detached polling", async () => {
	let callbackCalls = 0;
	let pollCalls = 0;
	const client = new DirectClient({
		hostLease: {
			async run(operation) {
				const value = await operation({}, { source: "fresh", acquireMs: 0 });
				return { ...value, tabClose: { closed: false, verified: false } };
			},
			close: async () => undefined,
			status: () => ({})
		},
		turnExecutor: {
			async execute() {
				return { submission: { conversationId: "one", session: { cookieHeader: "x" } } };
			}
		},
		detachedPoller: { async poll() { pollCalls += 1; } }
	});
	await assert.rejects(() => client.send({
		prompt: "prompt",
		onTabClosed: async () => { callbackCalls += 1; }
	}), error => error.code === "owned_target_close_unverified");
	assert.equal(callbackCalls, 0);
	assert.equal(pollCalls, 0);
});
