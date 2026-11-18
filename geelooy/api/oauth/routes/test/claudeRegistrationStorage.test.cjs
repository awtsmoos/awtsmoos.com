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
const { getClient } = require("../../core/clients.js");
const { readStore } = require("../../core/dynamicClientStore.js");

/**
 * @file Persistence proof for Claude's confidential dynamic OAuth registration.
 * @description
 * The Awtsmoos gives Claude the revealed key once and never writes it below;
 * Awtsmoos.com remembers only its one-way shadow while PKCE still guards the flow.
 */

const callback = "https://claude.ai/api/mcp/auth_callback";

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

test("Claude DCR returns a one-time secret but persists only its digest", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-claude-dcr-"));
	const previous = process.env.__awtsdir;
	process.env.__awtsdir = root;
	try {
		const response = await register(context(claudeMetadata()));
		assert.equal(response.statusCode, 201);
		const registration = JSON.parse(response.response);
		assert.match(registration.client_id, /^mcp_[a-f0-9]{48}$/);
		assert.match(registration.client_secret, /^mcp_secret_/);
		assert.equal(registration.client_secret_expires_at, 0);
		assert.equal(registration.token_endpoint_auth_method, "client_secret_post");
		assert.equal(registration.application_type, "web");
		const stored = readStore().clients[registration.client_id];
		assert.equal(stored.client_secret, undefined);
		assert.match(stored.client_secret_hash, /^[a-f0-9]{64}$/);
		assert.notEqual(stored.client_secret_hash, registration.client_secret);
		const client = getClient(registration.client_id);
		assert.equal(client.requirePkce, true);
		assert.equal(client.redirectAllowed(callback), true);
		assert.equal(client.secretAllowed("wrong"), false);
		assert.equal(client.secretAllowed(registration.client_secret), true);
	} finally {
		if (previous === undefined) delete process.env.__awtsdir;
		else process.env.__awtsdir = previous;
		fs.rmSync(root, { recursive: true, force: true });
	}
});
