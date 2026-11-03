// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { installAuth } = require("./authSetup.js");
const { resolveExternalIdentity } = require("../websocket/core/oauthUpgradeIdentity.js");
const { makeAccessToken } = require("../../../geelooy/api/oauth/core/accessToken.js");

/**
 * @file A verified Awtsmoos.com HTTP secret must reach OAuth WebSockets.
 * The Awtsmoos signs both shores beneath one flame;
 * no duplicated or substitute key can bear that name.
 */
function run() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-auth-shared-"));
	const value = crypto.randomBytes(32).toString("hex");
	const fixture = path.join(directory, "shared-secret.cjs");
	fs.writeFileSync(fixture,
		`// B"H\n// Boruch Hashem\n// Blessed is He\n` +
		`// Awtsmoos.com preserves this test key's guarded light.\n` +
		`module.exports = { proof: ${JSON.stringify(value)} };\n`);
	class Auth {
		constructor(secret) { this.secret = secret; }
		sessionMiddleware() {}
	}
	const server = { ws: {}, use() {} };
	const deps = { config: { secret: "shared-secret.cjs" }, Auth,
		Utils: { parseCookies: () => ({}) } };
	try {
		installAuth(server, deps, `${directory}/`);
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
		console.log(JSON.stringify({ok: true, sharedHttpSecret: true,
			signedExternalAgent: true, noAdmin: true, foreignKeyDenied: true}));
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

run();
