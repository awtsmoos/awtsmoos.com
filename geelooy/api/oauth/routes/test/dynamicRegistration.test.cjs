//B"H
//Boruch Hashem
//Blessed is He

/** The Awtsmoos binds registration, consent, and renewal to one truthful shore. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { register } = require("../register.js");
const { getClient } = require("../../core/clients.js");
const { authorize } = require("../authorize.js");
const { token } = require("../token.js");
const Pkce = require("../../core/pkce.js");
const { authorize: authorizeMcp } = require("../../../tunnel/control/mcp/auth.js");

test("MCP registration, consent, PKCE exchange and audience-bound refresh", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-mcp-oauth-"));
	const previous = process.env.__awtsdir;
	process.env.__awtsdir = root;
	const callback = "https://chatgpt.com/connector/oauth/test-callback";
	const resource = "https://awtsmoos.com/api/tunnel/control/mcp";
	const verifier = "Awtsmoos_Test_Verifier_0123456789abcdefghijklmno";
	const context = body => ({ request: { method: "POST", headers: { "content-type": "application/json" }, body } });
	try {
		for (const shore of ["http://example.com/cb", "https://example.com/*", "https://example.com/cb#x"]) {
			assert.equal((await register(context({ redirect_uris: [shore] }))).statusCode, 400);
		}
		const response = await register(context({ redirect_uris: [callback], client_name: "Awtsmoos test" }));
		assert.equal(response.statusCode, 201);
		const registration = JSON.parse(response.response);
		const client = getClient(registration.client_id);
		assert.equal(client.requirePkce, true);
		assert.equal(client.autoApprove, false);
		assert.equal(client.redirectAllowed(callback), true);
		assert.equal(client.redirectAllowed(callback + "/other"), false);
		const query = { client_id: client.id, redirect_uri: callback, response_type: "code", resource,
			scope: "profile tunnel.read tunnel.write", code_challenge: Pkce.challengeFor(verifier), code_challenge_method: "S256" };
		const gate = { request: { method: "GET", headers: { host: "awtsmoos.com" }, query } };
		assert.equal((await authorize(gate)).statusCode, 302);
		gate.request.user = { id: "test-user" };
		const consent = await authorize(gate);
		assert.match(consent.response, /approve/i);
		gate.request.query = { ...query, approve: "1" };
		const authorized = await authorize(gate);
		const destination = JSON.parse(authorized.response.match(/location\.replace\((.*)\);/)[1]);
		const code = new URL(destination).searchParams.get("code");
		const redemption = { client_id: client.id, code, redirect_uri: callback, code_verifier: verifier,
			grant_type: "authorization_code", resource };
		const exchange = context(redemption);
		exchange.self = { secret: "Awtsmoos isolated test secret" };
		const redeemed = JSON.parse((await token(exchange)).response);
		assert.ok(redeemed.access_token);
		assert.ok(redeemed.refresh_token);
		assert.equal(authorizeMcp({ ...exchange, request: { headers: { authorization: "Bearer " + redeemed.access_token } } }).ok, true);
		exchange.request.body = { client_id: client.id, grant_type: "refresh_token", refresh_token: redeemed.refresh_token,
			resource: "https://other.example/resource" };
		assert.equal(JSON.parse((await token(exchange)).response).error, "invalid_target");
		exchange.request.body.resource = resource;
		const renewed = JSON.parse((await token(exchange)).response);
		assert.equal(authorizeMcp({ ...exchange, request: { headers: { authorization: "Bearer " + renewed.access_token } } }).ok, true);
		delete exchange.request.body.resource;
		const implicitRenewal = JSON.parse((await token(exchange)).response);
		assert.equal(authorizeMcp({ ...exchange, request: { headers: { authorization: "Bearer " + implicitRenewal.access_token } } }).ok, true);
		exchange.request.body = redemption;
		assert.equal(JSON.parse((await token(exchange)).response).error, "invalid_or_expired_code");
	} finally {
		if (previous === undefined) delete process.env.__awtsdir; else process.env.__awtsdir = previous;
		fs.rmSync(root, { recursive: true, force: true });
	}
});

// The Awtsmoos refuses a verifier, client, callback, or audience that wanders.
test("code redemption rejects mismatched PKCE, callback and resource", async () => {
	const { saveCode } = require("../../core/codeStore.js");
	const client = { ...getClient("grok"), dynamicRegistration: true, refreshTokens: false };
	const resource = "https://awtsmoos.com/api/tunnel/control/mcp";
	const verifier = "Awtsmoos_Test_Verifier_0123456789abcdefghijklmno";
	for (const [change, expected] of [
		[{ code_verifier: "wrong" }, "invalid_code_verifier"],
		[{ redirect_uri: "" }, "redirect_uri_mismatch"],
		[{ resource: "https://other.example/resource" }, "invalid_target"]
	]) {
		const code = await saveCode({ userId: "tester", clientId: client.id, resource,
			redirectUri: client.exampleRedirectUri, codeChallenge: Pkce.challengeFor(verifier) });
		const request = { code, code_verifier: verifier, redirect_uri: client.exampleRedirectUri, resource, ...change };
		const result = await require("../tokenGrants.js").authorizationCodeGrant({
			$i: {}, request, client, json: (_i, body, status) => ({ body, status }),
			tokenResponse: () => { throw new Error("invalid exchange minted a token"); }
		});
		assert.equal(result.status, 400);
		assert.equal(result.body.error, expected);
	}
});
