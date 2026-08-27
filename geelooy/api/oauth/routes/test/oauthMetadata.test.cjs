// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies callback and device OAuth discovery metadata for Awtsmoos.com.
 * @description
 * The Awtsmoos lets visible and headless AIs discover the covenant from the
 * living server; these tests prove real-origin endpoints, grants, S256, scopes,
 * and device verification arise from current policy rather than copied prose.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { DEVICE_GRANT_TYPE } = require("../../core/devicePolicy.js");
const {
	serverMetadata,
	supportedScopes
} = require("../../core/serverMetadata.js");
const { metadata } = require("../metadata.js");

function localContext() {
	return {
		request: {
			headers: {
				"x-forwarded-host": "127.0.0.1:18082",
				"x-forwarded-proto": "http"
			}
		}
	};
}

test("metadata follows current origin for callback device and token paths", () => {
	const document = serverMetadata(localContext());
	assert.equal(document.issuer, "http://127.0.0.1:18082");
	assert.equal(
		document.authorization_endpoint,
		"http://127.0.0.1:18082/api/oauth/authorize"
	);
	assert.equal(
		document.device_authorization_endpoint,
		"http://127.0.0.1:18082/api/oauth/device-authorization"
	);
	assert.equal(
		document.token_endpoint,
		"http://127.0.0.1:18082/api/oauth/token"
	);
	assert.equal(
		document.awtsmoos_device_verification_uri,
		"http://127.0.0.1:18082/api/oauth/device"
	);
});

test("metadata publishes callback refresh device and S256 capabilities", () => {
	const document = serverMetadata(localContext());
	assert.deepEqual(document.response_types_supported, ["code"]);
	assert.deepEqual(document.code_challenge_methods_supported, ["S256"]);
	assert.ok(document.grant_types_supported.includes("authorization_code"));
	assert.ok(document.grant_types_supported.includes("refresh_token"));
	assert.ok(document.grant_types_supported.includes(DEVICE_GRANT_TYPE));
	assert.ok(document.token_endpoint_auth_methods_supported.includes("none"));
	assert.equal(document.awtsmoos_recommended_client_id, "external-agent");
	assert.match(document.awtsmoos_agent_manifest, /agent-manifest$/);
});

test("metadata scopes are derived from registered client scope policy", () => {
	const document = serverMetadata(localContext());
	assert.deepEqual(document.scopes_supported, supportedScopes());
	assert.ok(document.scopes_supported.includes("tunnel.read"));
	assert.ok(document.scopes_supported.includes("tunnel.mission"));
	assert.ok(document.scopes_supported.includes("tunnel.room"));
});

test("explicit metadata route returns no-store JSON response", () => {
	const response = metadata(localContext());
	assert.equal(response.statusCode, 200);
	assert.equal(response.headers["Cache-Control"], "no-store");
	const body = JSON.parse(response.response);
	assert.equal(body.awtsmoos_recommended_client_id, "external-agent");
	assert.equal(
		body.device_authorization_endpoint,
		"http://127.0.0.1:18082/api/oauth/device-authorization"
	);
});
