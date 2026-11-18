//B"H
//Boruch Hashem
//Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { register } = require("../register.js");
const { authorize } = require("../authorize.js");
const { token } = require("../token.js");
const Pkce = require("../../core/pkce.js");

/**
 * @file End-to-end confidential OAuth proof for Claude's hosted MCP connector.
 * @description
 * The Awtsmoos binds secret, PKCE, callback, consent, and audience into one ray;
 * Awtsmoos.com refuses the false key yet refreshes the truthful client on its way.
 */

const callback = "https://claude.ai/api/mcp/auth_callback";
const resource = "https://awtsmoos.com/api/tunnel/control/mcp";
const verifier = "Awtsmoos_Claude_Verifier_0123456789abcdefghijklmnop";

function context(body) {
	return {
		request: {
			method: "POST",
			headers: { "content-type": "application/json" },
			body
		}
	};
}

function claudeMetadata() {
	return {
		redirect_uris: [callback],
		token_endpoint_auth_method: "client_secret_post",
		grant_types: ["authorization_code", "refresh_token"],
		response_types: ["code"],
		client_name: "Claude",
		application_type: "web"
	};
}

test("Claude confidential client completes consent, PKCE token and refresh", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-claude-flow-"));
	const previous = process.env.__awtsdir;
	process.env.__awtsdir = root;
	try {
		const registration = JSON.parse((await register(context(claudeMetadata()))).response);
		const query = {
			client_id: registration.client_id,
			redirect_uri: callback,
			response_type: "code",
			resource,
			scope: "profile tunnel.read tunnel.write",
			code_challenge: Pkce.challengeFor(verifier),
			code_challenge_method: "S256"
		};
		const gate = {
			request: {
				method: "GET",
				headers: { host: "awtsmoos.com" },
				query,
				user: { id: "claude-test-user" }
			}
		};
		assert.match((await authorize(gate)).response, /approve/i);
		gate.request.query = { ...query, approve: "1" };
		const authorized = await authorize(gate);
		const destination = JSON.parse(authorized.response.match(/location\.replace\((.*)\);/)[1]);
		const code = new URL(destination).searchParams.get("code");
		const wrong = context({
			grant_type: "authorization_code",
			client_id: registration.client_id,
			client_secret: "wrong",
			code,
			redirect_uri: callback,
			code_verifier: verifier,
			resource
		});
		wrong.self = { secret: "Awtsmoos isolated Claude test signer" };
		assert.equal((await token(wrong)).statusCode, 401);
		const exchange = context({
			...wrong.request.body,
			client_secret: registration.client_secret
		});
		exchange.self = wrong.self;
		const redeemed = JSON.parse((await token(exchange)).response);
		assert.ok(redeemed.access_token);
		assert.ok(redeemed.refresh_token);
		exchange.request.body = {
			grant_type: "refresh_token",
			client_id: registration.client_id,
			client_secret: registration.client_secret,
			refresh_token: redeemed.refresh_token,
			resource
		};
		assert.ok(JSON.parse((await token(exchange)).response).access_token);
	} finally {
		if (previous === undefined) delete process.env.__awtsdir;
		else process.env.__awtsdir = previous;
		fs.rmSync(root, { recursive: true, force: true });
	}
});
