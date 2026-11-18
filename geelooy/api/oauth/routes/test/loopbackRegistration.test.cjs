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
const { registrationMetadata } = require("../../core/dynamicClientPolicy.js");

/**
 * @file Safe native-app and confidential-web OAuth registration for Awtsmoos.com.
 * @description
 * The Awtsmoos makes the native callback shine within the local night;
 * HTTPS web clients may bear a secret while every callback remains exact and right.
 */

function registrationContext(uri) {
	return {
		request: {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: {
				client_name: "Muse local test",
				redirect_uris: [uri]
			}
		}
	};
}

test("Native loopback IPv4 and IPv6 callbacks register with exact matching", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-loopback-test-"));
	const previous = process.env.__awtsdir;
	process.env.__awtsdir = root;
	try {
		for (const uri of [
			"http://127.0.0.1:51718/callback",
			"http://[::1]:51719/callback"
		]) {
			const result = await register(registrationContext(uri));
			assert.equal(result.statusCode, 201);
			const record = JSON.parse(result.response);
			const client = getClient(record.client_id);
			assert.equal(client.requirePkce, true);
			assert.equal(client.autoApprove, false);
			assert.equal(client.redirectAllowed(uri), true);
			assert.equal(client.redirectAllowed(uri + "/wrong"), false);
		}
	} finally {
		if (previous === undefined) delete process.env.__awtsdir;
		else process.env.__awtsdir = previous;
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("External HTTP, DNS aliases, and deceptive loopbacks stay forbidden", () => {
	for (const uri of [
		"http://example.org:51718/callback",
		"http://localhost:51718/callback",
		"http://127.0.0.2:51718/callback",
		"http://127.0.0.1.example.org:51718/callback",
		"http://127.0.0.1/callback",
		"http://127.0.0.1:0/callback",
		"http://127.0.0.1:65536/callback",
		"http://127.0.0.1:51718/callback#fragment",
		"http://user@127.0.0.1:51718/callback",
		"http://127.0.0.1:51718/*",
		"http://[::1]:51718/callback\r\nX-Injected: yes",
		"javascript:alert(1)"
	]) {
		assert.throws(() => registrationMetadata({ redirect_uris: [uri] }), {
			message: "invalid_redirect_uri"
		}, uri);
	}
});

test("HTTPS registration supports the three advertised token auth methods", () => {
	const https = "https://claude.ai/api/mcp/auth_callback";
	for (const method of ["none", "client_secret_post", "client_secret_basic"]) {
		const metadata = registrationMetadata({
			redirect_uris: [https, https],
			grant_types: ["authorization_code", "refresh_token"],
			token_endpoint_auth_method: method,
			application_type: "web"
		});
		assert.deepEqual(metadata.redirect_uris, [https]);
		assert.equal(metadata.token_endpoint_auth_method, method);
		assert.equal(metadata.application_type, "web");
		assert.deepEqual(metadata.response_types, ["code"]);
	}
	assert.throws(() => registrationMetadata({
		redirect_uris: [https],
		token_endpoint_auth_method: "private_key_jwt"
	}), { message: "invalid_client_metadata" });
});
