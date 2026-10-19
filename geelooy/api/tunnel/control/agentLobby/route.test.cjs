// B"H
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const ROUTE = path.resolve(__dirname, "../routes/agentLobby.js");
const AUTH = path.resolve(__dirname, "../core/auth.js");
const STORE = path.resolve(__dirname, "../core/store.js");
const PRESENCE = path.resolve(__dirname, "presence.js");
let identity;
const saved = new Map();
const fixture = { tunnelBindings: {}, agentLobby: {} };

/**
 * @file The Awtsmoos gives a voice only to an authenticated account.
 * Client-supplied claims cannot become authorities merely by their words.
 */
function substitute(filename, exports) {
	saved.set(filename, require.cache[filename]);
	require.cache[filename] = { id: filename, filename, loaded: true, exports };
}
substitute(AUTH, { currentIdentity: () => identity });
substitute(STORE, {
	readStore: () => fixture,
	mutateStore: callback => callback(fixture)
});
substitute(PRESENCE, { devices: () => [], ownsTunnel: () => true });
const Routes = require(ROUTE);
function context(params = {}) {
	return { paramKinds: { GET: params }, response: {
		setHeader() {}, statusCode: 0, headersSent: false
	} };
}
function parse(body) {
	return JSON.parse(body);
}

test("anonymous actors are refused", async () => {
	identity = { ok: false };
	assert.equal(parse(await Routes.agentLobbyList(context())).ok, false);
});

test("web session may read but not mutate via GET", async () => {
	identity = { ok: true, accountId: "owner", kind: "session", scopes: ["tunnel.read", "tunnel.write"] };
	assert.equal(parse(await Routes.agentLobbyList(context())).ok, true);
	assert.equal(parse(await Routes.agentLobbyJoin(context({ sessionId: "a", displayName: "A" }))).ok, false);
});

test("OAuth requires write scope for posting", async () => {
	identity = { ok: true, accountId: "owner", kind: "oauth", clientId: "tool", scopes: ["tunnel.read"] };
	assert.equal(parse(await Routes.agentLobbyJoin(context({ sessionId: "a", displayName: "A" }))).ok, false);
});

test("verified clients can join, message and read shared history", async () => {
	identity = { ok: true, accountId: "owner", kind: "oauth", clientId: "tool", scopes: ["tunnel.read", "tunnel.write"] };
	assert.equal(parse(await Routes.agentLobbyJoin(context({ sessionId: "a", displayName: "Reviewer" }))).ok, true);
	assert.equal(parse(await Routes.agentLobbyPost(context({ sessionId: "a", messageId: "abc", message: "Please coordinate", kind: "conflict" }))).ok, true);
	assert.equal(parse(await Routes.agentLobbyList(context())).messages[0].kind, "conflict");
});

test("another owner cannot read a message", async () => {
	identity = { ok: true, accountId: "other", kind: "oauth", clientId: "tool", scopes: ["tunnel.read"] };
	assert.deepEqual(parse(await Routes.agentLobbyList(context())).messages, []);
});

test.after(() => {
	for (const [name, original] of saved) {
		if (original) require.cache[name] = original;
		else delete require.cache[name];
	}
});
