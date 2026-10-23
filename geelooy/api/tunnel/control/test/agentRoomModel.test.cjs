// B"H
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Model = require("../core/accountRoom/model.js");

/**
 * @file Two shluchim, one account, and an honest distinct testimony.
 * Neither agent can claim human authority from a chat message alone.
 */
const mac = {
	agentId: "agent:asdf:mac-a", agentSessionId: "session-mac-a",
	deviceId: "awt-awtsmoos-2184", name: "Mac coordinator"
};
const linux = {
	agentId: "agent:asdf:linux-b", agentSessionId: "session-linux-b",
	deviceId: "awt-root-73967", name: "Server publisher"
};
const account = { clientId: "external-agent" };

function setup() {
	const store = {};
	Model.join(store, "asdf", account, mac, 5000);
	Model.join(store, "asdf", account, linux, 5000);
	return store;
}

test("two separate sessions see one shared roster", () => {
	const store = setup();
	const view = Model.snapshot(store, "asdf", 0, 5010);
	assert.equal(view.agents.length, 2);
	assert.notEqual(view.agents[0].key, view.agents[1].key);
	assert(view.agents.every(agent => agent.online && !agent.identityAttested));
});

test("A sends B receives, B replies A receives", () => {
	const store = setup();
	const first = Model.send(store, "asdf", account, {
		...mac, clientMessageId: "first", message: "Please discuss deletion first", kind: "conflict"
	}, 5015);
	assert.equal(Model.snapshot(store, "asdf", 0, 5020).messages[0].id, first.message.id);
	Model.send(store, "asdf", account, {
		...linux, clientMessageId: "reply", message: "Requesting evidence", kind: "chat"
	}, 5022);
	const readBack = Model.snapshot(store, "asdf", first.message.sequence, 5025);
	assert.deepEqual(readBack.messages.map(row => row.content), ["Requesting evidence"]);
});

test("restart-style serialization preserves messages and prevents duplicate retries", () => {
	const store = setup();
	const input = { ...mac, clientMessageId: "once", message: "Preserve every scroll" };
	const first = Model.send(store, "asdf", account, input, 5060);
	const restored = JSON.parse(JSON.stringify(store));
	const replay = Model.send(restored, "asdf", account, input, 5065);
	assert.equal(replay.replayed, true);
	assert.equal(replay.message.id, first.message.id);
	assert.equal(Model.snapshot(restored, "asdf").messages.length, 1);
});

test("account B cannot read account A", () => {
	const store = setup();
	Model.send(store, "asdf", account, { ...mac,
		clientMessageId: "secret", message: "Private coordination" });
	assert.equal(Model.snapshot(store, "other").messages.length, 0);
	assert.equal(Model.snapshot(store, "other").agents.length, 0);
});

test("offline expires; online refreshes on renewed join", () => {
	const store = setup();
	assert.equal(Model.snapshot(store, "asdf", 0, 100000).agents.every(a => !a.online), true);
	Model.join(store, "asdf", account, mac, 100010);
	assert.equal(Model.snapshot(store, "asdf", 0, 100020).agents.filter(a => a.online).length, 1);
});

test("unjoined users and invalid messages are rejected", () => {
	const store = {};
	assert.throws(() => Model.send(store, "asdf", account,
		{ ...mac, clientMessageId: "not-joined", message: "hello" }), /join_required/);
	Model.join(store, "asdf", account, mac);
	assert.throws(() => Model.send(store, "asdf", account,
		{ ...mac, clientMessageId: "oversize", message: "z".repeat(4097) }), /invalid_message/);
});
