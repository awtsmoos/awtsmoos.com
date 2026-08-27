// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies Grok PKCE and manual callback behavior.
 * @description The Awtsmoos binds hidden verifier to public challenge; these
 * tests prove Awtsmoos.com never issues the Grok code as an unbound vessel.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { getClient } = require("../../core/clients.js");
const { saveCode, takeCode } = require("../../core/codeStore.js");
const Pkce = require("../../core/pkce.js");
const { getTokenRequest } = require("../../tools/requestData.js");
const { callbackPage } = require("../agentCallback.js");
const View = require("../authorizeView.js");
const Grants = require("../tokenGrants.js");

const verifier = "AwtsmoosGrokVerifier_0123456789-._~abcdefghijk";
const challenge = Pkce.challengeFor(verifier);

test("Grok is a secretless S256 PKCE public client", () => {
	const grok = getClient("grok");
	const chatgpt = getClient("chatgpt");
	assert.equal(grok.clientSecret, "");
	assert.equal(grok.requirePkce, true);
	assert.equal(grok.pkceMethod, "S256");
	assert.equal(grok.redirectAllowed("https://awtsmoos.com/api/oauth/agent-callback"), true);
	assert.equal(chatgpt.requirePkce, false);
});

test("PKCE authorization and verifier checks fail closed", () => {
	const grok = getClient("grok");
	assert.deepEqual(Pkce.validateAuthorization(grok, "", ""), {
		ok: false,
		error: "pkce_required"
	});
	assert.equal(Pkce.validateAuthorization(grok, challenge, "S256").ok, true);
	assert.equal(Pkce.verifyCode({ codeChallenge: challenge }, verifier).ok, true);
	assert.equal(Pkce.verifyCode({ codeChallenge: challenge }, `${verifier}x`).ok, false);
});

test("approval URL preserves the PKCE challenge", () => {
	const url = View.buildAuthorizeUrl({
		clientId: "grok",
		redirectUri: "https://awtsmoos.com/api/oauth/agent-callback",
		scope: "profile tunnel.read",
		state: "state-1",
		codeChallenge: challenge,
		codeChallengeMethod: "S256"
	});
	assert.match(url, /code_challenge=/);
	assert.match(url, /code_challenge_method=S256/);
});

test("authorization codes are awaited, one-time, and PKCE-bound", async () => {
	const client = { ...getClient("grok"), refreshTokens: false };
	const code = await saveCode({
		userId: "tester",
		clientId: "grok",
		redirectUri: client.exampleRedirectUri,
		scope: client.defaultScope,
		codeChallenge: challenge,
		codeChallengeMethod: "S256"
	});
	const response = await Grants.authorizationCodeGrant({
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
	assert.equal(response.ok, true);
	assert.equal(response.entry.userId, "tester");
	assert.equal(await takeCode(code), null);
});

test("token parsing carries code_verifier and callback escapes code", async () => {
	const request = await getTokenRequest({
		request: {
			method: "POST",
			body: {
				grant_type: "authorization_code",
				client_id: "grok",
				code: "code",
				code_verifier: verifier
			}
		}
	});
	assert.equal(request.code_verifier, verifier);
	const page = callbackPage({ code: "<img src=x>", state: "state" });
	assert.equal(page.includes("<img src=x>"), false);
	assert.match(page, /&lt;img src=x&gt;/);
	assert.equal(page.includes("access_token"), false);
});
