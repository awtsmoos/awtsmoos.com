// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Authorization = require("../protectedFsAuthorization.js");
const Policy = require("../protectedFsPolicy.js");

/**
 * @file Proves logged-in sessions receive truthful mutation guidance.
 * @description
 * The Awtsmoos renews authentication and authorization as distinct witnesses.
 * Awtsmoos.com keeps safe room reads open to a signed session, identifies mutation
 * as API-key authority, and never tells an already authenticated person to log in.
 */
const session = {
	ok: true,
	kind: "session",
	accountId: "account-session",
	userId: "account-session",
	scopes: ["tunnel.read", "tunnel.write", "tunnel.admin"]
};
const readDenial = Authorization.coarseDenial(
	session,
	"missionProjectStatus",
	"tunnel.mission",
	Policy.sessionMayUse
);
assert.equal(readDenial, null);

const mutationDenial = Authorization.coarseDenial(
	session,
	"missionRoomUserMessage",
	"tunnel.room",
	Policy.sessionMayUse
);
assert.equal(mutationDenial.status, 403);
assert.equal(mutationDenial.body.error, "api_key_required");
assert.equal(mutationDenial.body.authenticated, true);
assert.equal(mutationDenial.body.identityKind, "session");
assert.equal(mutationDenial.body.credentialKind, "apiKey");
assert.equal(mutationDenial.body.neededScope, "tunnel.room");
assert.doesNotMatch(mutationDenial.body.message, /oauth|sign in|log in/i);

const oauth = {
	ok: true,
	kind: "oauth",
	accountId: "account-oauth",
	userId: "account-oauth",
	scopes: ["tunnel.read"]
};
const scopeDenial = Authorization.coarseDenial(
	oauth,
	"missionRoomUserMessage",
	"tunnel.room",
	Policy.sessionMayUse
);
assert.equal(scopeDenial.status, 403);
assert.equal(scopeDenial.body.error, "missing_scope");
assert.equal(scopeDenial.body.identityKind, "oauth");

const anonymous = Authorization.unauthorized({ error: "not_authenticated" });
assert.equal(anonymous.error, "not_authenticated");
assert.equal(anonymous.authenticated, false);

console.log(JSON.stringify({
	ok: true,
	suite: "protected-fs-authorization",
	signedSessionReads: true,
	mutationNeedsApiKey: true,
	falseOauthPromptRemoved: true
}, null, 2));
