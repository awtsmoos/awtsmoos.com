// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves an unknown future AI can use Awtsmoos without provider registration.
 * @description
 * The Awtsmoos is not divided by model brands; this test invents FutureMind,
 * gives it only the universal external-agent identity, and proves Awtsmoos.com
 * binds its authorization code to PKCE, callback, client, and one-time exchange.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { getClient } = require("../../core/clients.js");
const { saveCode, takeCode } = require("../../core/codeStore.js");
const Pkce = require("../../core/pkce.js");
const Grants = require("../tokenGrants.js");

const verifier = "FutureMind_Awtsmoos_0123456789-._~abcdefghijkl";
const challenge = Pkce.challengeFor(verifier);

test("universal client is secretless, fixed-callback, and PKCE-bound", () => {
	const client = getClient("external-agent");
	assert.equal(client.clientSecret, "");
	assert.equal(client.requirePkce, true);
	assert.equal(client.pkceMethod, "S256");
	assert.equal(
		client.redirectAllowed("https://awtsmoos.com/api/oauth/agent-callback"),
		true
	);
	assert.equal(client.redirectAllowed("https://futuremind.example/callback"), false);
});

test("unknown FutureMind needs no provider-specific registry entry", () => {
	assert.equal(getClient("futuremind"), null);
	const client = getClient("external-agent");
	assert.equal(client.id, "external-agent");
	assert.match(client.defaultScope, /tunnel\.read/);
});

test("universal authorization rejects missing or non-S256 PKCE", () => {
	const client = getClient("external-agent");
	assert.deepEqual(Pkce.validateAuthorization(client, "", ""), {
		ok: false,
		error: "pkce_required"
	});
	assert.deepEqual(Pkce.validateAuthorization(client, challenge, "plain"), {
		ok: false,
		error: "unsupported_code_challenge_method"
	});
	assert.equal(Pkce.validateAuthorization(client, challenge, "S256").ok, true);
});

test("FutureMind exchanges a universal one-time code with its retained verifier", async () => {
	const client = {
		...getClient("external-agent"),
		refreshTokens: false
	};
	const code = await saveCode({
		userId: "futuremind-user",
		clientId: client.id,
		redirectUri: client.exampleRedirectUri,
		scope: client.defaultScope,
		state: "futuremind-state",
		codeChallenge: challenge,
		codeChallengeMethod: "S256"
	});
	const result = await Grants.authorizationCodeGrant({
		$i: {},
		request: {
			code,
			code_verifier: verifier,
			redirect_uri: client.exampleRedirectUri
		},
		client,
		json: (_$i, body, status) => ({ body, status }),
		missingCode: () => ({ missing: true }),
		tokenResponse: (_$i, _client, entry) => ({ ok: true, entry })
	});
	assert.equal(result.ok, true);
	assert.equal(result.entry.userId, "futuremind-user");
	assert.equal(await takeCode(code), null);
});
