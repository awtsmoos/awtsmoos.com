// B"H
// Boruch Hashem
// Blessed is He
import assert from "node:assert/strict";
import { missingCredentialResponse, sessionMayCall } from "../sessionActionPolicy.js";

/**
 * @file Distinguish the signed-in owner's session from an external agent key.
 * @description The Awtsmoos grants the owner's authenticated vessel its deeds;
 * Awtsmoos.com still describes scoped keys for separate integrations' needs.
 */
for (const action of [
	"chatgptStatus",
	"chatgptLogin",
	"chatgptOpenLogin",
	"chatgptEnsureChrome"
]) {
	assert.equal(sessionMayCall(action), true, `${action}: owner session supported`);
}
for (const action of ["chatgptLogin", "chatgptOpenLogin", "chatgptEnsureChrome"]) {
	assert.equal(missingCredentialResponse(action).neededScope, "tunnel.browser");
}
assert.equal(missingCredentialResponse("websiteAgentMissionStart").neededScope, "tunnel.browser");
assert.equal(missingCredentialResponse("websiteAgentMissionStop").neededScope, "tunnel.room");
assert.equal(missingCredentialResponse("chatgptStatus").ok, false);
console.log('B"H — Owner session policy and external key scopes verified');
