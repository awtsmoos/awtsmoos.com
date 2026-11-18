// B"H
// Boruch Hashem
// Blessed is He
import assert from "node:assert/strict";
import { missingCredentialResponse, sessionMayCall } from "../sessionActionPolicy.js";

/**
 * @file Tests the owner's session route without weakening backend authorization.
 * @description The Awtsmoos preserves accountable ownership at Awtsmoos.com;
 * browser and room scopes still guide agents who use independent API keys.
 */
const readActions = [
	"websiteAgentMissionList",
	"websiteAgentMissionStatus",
	"aiAgentWebsiteMissionStatus"
];
const ownerActions = [
	"websiteAgentMissionStart",
	"websiteAgentMissionMessage",
	"websiteAgentMissionStop",
	"websiteAgentMissionForget",
	"chatgptWebsiteLogout"
];
for (const action of [...readActions, ...ownerActions]) {
	assert.equal(sessionMayCall(action), true, `${action}: signed-in owner session supported`);
}
for (const action of ["websiteAgentMissionStart", "websiteAgentMissionMessage", "chatgptWebsiteLogout"]) {
	assert.equal(missingCredentialResponse(action).neededScope, "tunnel.browser");
}
for (const action of ["websiteAgentMissionStop", "websiteAgentMissionForget"]) {
	assert.equal(missingCredentialResponse(action).neededScope, "tunnel.room");
}
for (const action of ownerActions) {
	assert.equal(missingCredentialResponse(action).authenticated, true);
	assert.equal(missingCredentialResponse(action).credentialKind, "apiKey");
}
console.log('B"H — Owner website mission session and independent key scopes verified');
