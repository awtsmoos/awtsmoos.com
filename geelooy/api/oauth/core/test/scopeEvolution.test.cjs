// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");
const { getClient } = require("../clients.js");
const Evolution = require("../scopeEvolution.js");
const { verifyAwtsmoosOAuthToken } = require("../tokenReader.js");

function signedLegacyToken(entry, secret) {
	const encoded = Buffer.from(JSON.stringify({
		entry,
		zman: Date.now(),
		hoshufuh: { expiresIn: 3600 }
	})).toString("base64url");
	const payload = `B\"H.${encoded}`;
	const signature = crypto
		.createHmac("sha256", secret)
		.update(payload)
		.digest("hex");
	return `${payload}.${signature}`;
}

test("ChatGPT client declares mission room authority", () => {
	const client = getClient("chatgpt");
	assert(client.requiredScopes.includes("tunnel.mission"));
	assert(client.requiredScopes.includes("tunnel.room"));
	assert(client.scopes.includes("tunnel.room"));
	assert.match(client.defaultScope, /tunnel\.mission/);
	assert.match(client.defaultScope, /tunnel\.room/);
});

test("legacy ChatGPT tokens evolve only through registered requirements", () => {
	const client = getClient("chatgpt");
	const evolved = Evolution.effectiveScope(
		client,
		"profile tunnel.read tunnel.write tunnel.command tunnel.browser"
	);
	assert.match(evolved, /tunnel\.mission/);
	assert.match(evolved, /tunnel\.room/);
	const unrelated = Evolution.effectiveScope({ defaultScope: "profile" }, "profile");
	assert.equal(unrelated, "profile");
});

test("bearer verification upgrades an existing trusted ChatGPT token", () => {
	const secret = "scope-evolution-secret";
	const token = signedLegacyToken({
		kind: "oauth_access",
		userId: "owner",
		clientId: "chatgpt",
		scope: "profile tunnel.read tunnel.write tunnel.command tunnel.browser"
	}, secret);
	const verified = verifyAwtsmoosOAuthToken(token, secret);
	assert.equal(verified.ok, true);
	assert.match(verified.entry.scope, /tunnel\.mission/);
	assert.match(verified.entry.scope, /tunnel\.room/);
});
