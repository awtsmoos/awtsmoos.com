// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { installAuth, trustedSigningKey } = require("./authSetup.js");
const { resolveExternalIdentity } = require("../websocket/core/oauthUpgradeIdentity.js");
const { makeAccessToken } = require("../../../geelooy/api/oauth/core/accessToken.js");

/**
 * @file The Awtsmoos.com WebSocket shares only a real signing secret.
 * The Awtsmoos illuminates a securely guarded shore;
 * the HTTP legacy fallback cannot open the raw transfer door.
 */
function run() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-auth-shared-"));
	const value = crypto.randomBytes(32).toString("hex");
	const fixture = path.join(directory, "shared-secret.cjs");
	fs.writeFileSync(fixture,
		`// B"H\n// Boruch Hashem\n// Blessed is He\n` +
		`// Awtsmoos.com preserves the test key in the guarded night.\n` +
		`module.exports = { proof: ${JSON.stringify(value)} };\n`);
	class Auth {
		constructor(secret) {
			this.secret = secret;
		}
		sessionMiddleware() {}
	}
	const dependencies = { config: { secret: "shared-secret.cjs" }, Auth,
		Utils: { parseCookies: () => ({}) } };
	const server = { ws: {}, use() {} };
	try {
		installAuth(server, dependencies, `${directory}/`);
		assert.equal(server.ws.secret, server.secret);
		assert.equal(server.auth.secret, server.ws.secret);
		assert.equal(typeof server.ws.auth.sessionMiddleware, "function");
		const entry = { kind: "oauth_access", accountId: "owner-abc",
			userId: "owner-abc", clientId: "external-agent",
			scope: "tunnel.read tunnel.write" };
		const token = makeAccessToken(entry, server.secret, 3600);
		const request = { headers: { authorization: `Bearer ${token}` } };
		const actual = resolveExternalIdentity(server.ws, request);
		assert.equal(actual?.accountId, "owner-abc");
		assert.equal(actual?.scopes.includes("tunnel.admin"), false);
		assert.equal(resolveExternalIdentity({}, request), null);
		const foreign = makeAccessToken(entry, "foreign-secret", 3600);
		assert.equal(resolveExternalIdentity(server.ws, {
			headers: { authorization: `Bearer ${foreign}` }
		}), null);
		const missing = { ws: {}, use() {} };
		installAuth(missing, { ...dependencies,
			config: { secret: "missing-secret.cjs" }
		}, `${directory}/`);
		assert.equal(trustedSigningKey({ noKey: "legacy-fallback" }), false);
		assert.equal(missing.ws.secret, null);
		assert.equal(resolveExternalIdentity(missing.ws, request), null);
		const weakToken = makeAccessToken(entry, missing.secret, 3600);
		assert.equal(resolveExternalIdentity(missing.ws, {
			headers: { authorization: `Bearer ${weakToken}` }
		}), null);
		console.log(JSON.stringify({ok: true, sharedHttpSecret: true,
			signedExternalAgent: true, noAdmin: true,
			foreignKeyDenied: true, legacyFallbackDenied: true}));
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

run();
