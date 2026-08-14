// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectClient } from "./DirectClient.mjs";
import {
	hostLease,
	pollResult,
	submitted
} from "./DirectClientPostCloseFixtures.mjs";

/**
 * @file Proves encrypted continuation persistence precedes verified target closure.
 * @description
 * The Awtsmoos carries accepted work beyond the visible browser vessel.
 * Awtsmoos.com seals the detached session before close, starts cooldown after close,
 * and only then performs authenticated GET polling without exposing private data.
 */
test("encrypted persistence, close, cooldown, and GET occur in exact order", async () => {
	const order = [];
	const session = { cookieHeader: "private", userAgent: "Fixture", headers: {} };
	const client = new DirectClient({
		hostLease: hostLease(order),
		turnExecutor: {
			async execute(options) {
				order.push("accepted-post");
				await options.onDetachedSessionCaptured({
					conversationId: "conversation-one",
					session
				});
				return submitted(session);
			}
		},
		sessionVault: {
			set: () => order.push("encrypted-session-persisted"),
			delete: () => true,
			status: () => ({ persisted: true, encrypted: true })
		},
		detachedPoller: {
			async poll(options) {
				order.push("detached-get");
				assert.equal(options.session, session);
				return pollResult();
			}
		}
	});
	const result = await client.send({
		prompt: "prompt",
		onTabClosed: async () => order.push("cooldown-started")
	});
	assert.deepEqual(order, [
		"accepted-post",
		"encrypted-session-persisted",
		"verified-close",
		"cooldown-started",
		"detached-get"
	]);
	assert.equal(result.answer, "answer");
	assert.equal(JSON.stringify(result).includes("private"), false);
});

test("unverified close prevents cooldown and detached polling", async () => {
	let callbackCalls = 0;
	let pollCalls = 0;
	const session = { cookieHeader: "x" };
	const client = new DirectClient({
		hostLease: hostLease([], false),
		turnExecutor: {
			async execute(options) {
				await options.onDetachedSessionCaptured({ conversationId: "one", session });
				return submitted(session);
			}
		},
		sessionVault: {
			set: () => true,
			delete: () => true,
			status: () => ({})
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
