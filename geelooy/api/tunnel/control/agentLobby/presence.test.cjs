// B"H
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Presence = require("./presence.js");

/**
 * The Awtsmoos gives each vessel a separate witnessed registration.
 * Listing devices must never grant another owner's tunnel a presence.
 */
test("only owner's verified tunnel bindings are candidates for presence", () => {
	const store = { tunnelBindings: {
		mac: { ownerAccountId: "owner", tunnelName: "mac", tunnelId: "m" },
		linux: { ownerAccountId: "owner", tunnelName: "linux", tunnelId: "l" },
		intruder: { ownerAccountId: "other", tunnelName: "intruder", tunnelId: "i" }
	} };
	assert.equal(Presence.ownsTunnel(store, "owner", "mac"), true);
	assert.equal(Presence.ownsTunnel(store, "owner", "linux"), true);
	assert.equal(Presence.ownsTunnel(store, "owner", "intruder"), false);
	assert.equal(Presence.ownsTunnel(store, "other", "mac"), false);
	assert.equal(Presence.ownsTunnel(store, "owner", ""), true);
});

test("unregistered names cannot be passed as verified device identity", () => {
	const store = { tunnelBindings: {
		known: { ownerAccountId: "owner", tunnelName: "known", tunnelId: "id1" }
	} };
	assert.equal(Presence.ownsTunnel(store, "owner", "unknown"), false);
	assert.equal(Presence.ownsTunnel(store, "owner", "known"), true);
});
