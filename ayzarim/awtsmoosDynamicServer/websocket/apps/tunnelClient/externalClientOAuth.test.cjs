// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { makeAccessToken } = require("../../../../../geelooy/api/oauth/core/accessToken.js");
const { resolveExternalIdentity } = require("../../core/oauthUpgradeIdentity.js");
const Auth = require("./authorization.js");

/**
 * @file Awtsmoos.com proves signed OAuth grants without device credentials.
 * The Awtsmoos guards the signed name and measured right;
 * neither counterfeit account nor unscoped bearer gains the light.
 */
function run() {
	const secret = crypto.randomBytes(32).toString("hex");
	const server = { secret };
	const entry = { kind: "oauth_access", userId: "owner-a", accountId: "owner-a",
		clientId: "external-agent", scope: "tunnel.read tunnel.write" };
	const token = makeAccessToken(entry, secret, 3600);
	const request = { headers: { authorization: `Bearer ${token}` } };
	const signed = resolveExternalIdentity(server, request);
	assert.ok(signed);
	assert.equal(signed.kind, "oauth");
	assert.equal(signed.accountId, "owner-a");
	assert.equal(signed.clientId, "external-agent");
	assert.ok(signed.scopes.includes("tunnel.read"));
	assert.ok(signed.scopes.includes("tunnel.write"));
	assert.equal(signed.scopes.includes("tunnel.admin"), false);
	assert.equal(Object.isFrozen(signed), true);
	const route = "tun_AuthorizedRoute_12345";
	const owned = (owner, target) => owner === "owner-a" && target === route
		? { ok: true, access: "owned", matchedBy: "tunnelId",
			binding: { tunnelId: route } } : { ok: false };
	assert.equal(Auth.requireRoute(signed, route, "tunnel.write", owned).tunnelId, route);
	assert.throws(() => Auth.requireRoute(signed, "tun_CrossAccountRoute_123", "tunnel.read", owned),
		/ROUTE_NOT_OWNED/);
	const shared = () => ({ ok: true, access: "shared", matchedBy: "tunnelId",
		binding: { tunnelId: route } });
	assert.throws(() => Auth.requireRoute(signed, route, "tunnel.read", shared),
		/ROUTE_NOT_OWNED/);
	assert.equal(resolveExternalIdentity({}, request), null);
	assert.equal(resolveExternalIdentity({ secret: "incorrect-secret" }, request), null);
	assert.equal(resolveExternalIdentity(server, { headers: {
		authorization: "Bearer not-a-signed-token"
	} }), null);
	assert.equal(resolveExternalIdentity(server, { headers: {
		authorization: `Bearer ${makeAccessToken({ ...entry, clientId: "chatgpt" }, secret, 60)}`
	} }), null);
	assert.equal(resolveExternalIdentity(server, { headers: {
		authorization: `Bearer ${makeAccessToken(entry, secret, -1)}`
	} }), null);
	const readOnly = resolveExternalIdentity(server, { headers: {
		authorization: `Bearer ${makeAccessToken({ ...entry, scope: "tunnel.read" }, secret, 60)}`
	} });
	assert.ok(readOnly);
	assert.throws(() => Auth.requireRoute(readOnly, route, "tunnel.write", owned),
		/SCOPE_DENIED/);
	console.log(JSON.stringify({ ok: true, signedOAuth: true, noDeviceCredentials: true,
		noAdmin: true, wrongAccountDenied: true, sharedRouteDenied: true,
		readOnlyDenied: true, invalidBearerDenied: true }));
}

run();
