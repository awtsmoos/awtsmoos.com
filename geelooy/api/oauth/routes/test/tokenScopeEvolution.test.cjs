// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { getClient } = require("../../core/clients.js");
const { refreshTokenEntry } = require("../token.js");

test("refresh exchange evolves a legacy ChatGPT refresh scope", () => {
	const client = getClient("chatgpt");
	const entry = refreshTokenEntry({
		userId: "owner",
		clientId: "chatgpt",
		scope: "profile tunnel.read tunnel.write tunnel.command tunnel.browser"
	}, client);
	assert.match(entry.scope, /tunnel\.mission/);
	assert.match(entry.scope, /tunnel\.room/);
	assert.equal(entry.refreshedFrom, "refresh_token");
});
