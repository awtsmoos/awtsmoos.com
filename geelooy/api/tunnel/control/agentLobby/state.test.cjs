// B"H
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const State = require("./state.js");

/**
 * The Awtsmoos makes each vessel distinct. This testimony tests how
 * separate clients speak while sharing one owner's durable message scroll.
 */
test("two distinct tunnel agents share one account-wide conversation", () => {
	const store = {};
	const mac = { accountId: "owner", clientId: "mac-client" };
	const linux = { accountId: "owner", clientId: "linux-client" };
	State.join(store, mac, {
		sessionId: "mac-123", displayName: "Mac reviewer", tunnelName: "mac"
	}, 1000);
	State.join(store, linux, {
		sessionId: "linux-321", displayName: "Linux publisher", tunnelName: "linux"
	}, 1000);
	const message = State.post(store, mac, {
		sessionId: "mac-123", messageId: "msg-1", message: "Let's coordinate before deletion", kind: "conflict"
	}, 1001);
	assert.equal(message.kind, "conflict");
	assert.equal(State.snapshot(store, linux.accountId, 1002).messages[0].text,
		"Let's coordinate before deletion");
	assert.equal(State.snapshot(store, mac.accountId, 1002).sessions.length, 2);
	const answer = State.post(store, linux, {
		sessionId: "linux-321", messageId: "msg-2", message: "Please pause; let's reconcile"
	}, 1003);
	assert.equal(answer.sequence, 2);
});

test("other accounts cannot read or overwrite the owner's messages", () => {
	const store = {};
	const alice = { accountId: "alice", clientId: "same-app" };
	const bob = { accountId: "bob", clientId: "same-app" };
	State.join(store, alice, { sessionId: "one", displayName: "Alice" }, 10);
	State.post(store, alice, { sessionId: "one", messageId: "m1", message: "private" }, 11);
	assert.deepEqual(State.snapshot(store, "bob").messages, []);
	assert.throws(() => State.post(store, bob, {
		sessionId: "one", messageId: "m2", message: "spoof"
	}), /join_required/);
});

test("request retries deduplicate and conflicting message IDs cannot overwrite", () => {
	const store = {};
	const user = { accountId: "u", clientId: "c" };
	State.join(store, user, { sessionId: "s", displayName: "Agent" }, 100);
	const body = { sessionId: "s", messageId: "fixed", message: "intention", kind: "intent" };
	assert.equal(State.post(store, user, body, 101).sequence, 1);
	assert.equal(State.post(store, user, body, 102).duplicate, true);
	assert.equal(State.snapshot(store, "u").messages.length, 1);
	assert.throws(() => State.post(store, user, { ...body, message: "changed" }), /conflict/);
});

test("declared sessions expire without falsely claiming an actor is online", () => {
	const store = {};
	const identity = { accountId: "u", clientId: "c" };
	State.join(store, identity, { sessionId: "s", displayName: "Agent" }, 1000);
	assert.equal(State.snapshot(store, "u", 1200).sessions[0].state, "online");
	assert.equal(State.snapshot(store, "u", 123000).sessions[0].state, "offline");
});

test("message size, actor labels and kinds are bounded", () => {
	const store = {};
	const identity = { accountId: "u", clientId: "c" };
	assert.throws(() => State.join(store, identity, {
		sessionId: "bad/path", displayName: "Agent"
	}), /invalid_session/);
	State.join(store, identity, { sessionId: "s", displayName: "Agent" });
	assert.throws(() => State.post(store, identity, {
		sessionId: "s", messageId: "huge", message: "x".repeat(2401)
	}), /invalid_message/);
	assert.throws(() => State.post(store, identity, {
		sessionId: "s", messageId: "badkind", message: "x", kind: "owner_approved"
	}), /invalid_message_kind/);
});
