// B"H
import assert from "node:assert/strict";
import {
	missingCredentialResponse,
	sessionMayCall
} from "../sessionActionPolicy.js";

for (const action of [
	"websiteAgentMissionList",
	"websiteAgentMissionStatus",
	"aiAgentWebsiteMissionStatus"
]) {
	assert.equal(sessionMayCall(action), true, `${action} should be session-readable`);
}

for (const action of [
	"websiteAgentMissionStart",
	"websiteAgentMissionMessage",
	"websiteAgentMissionStop",
	"websiteAgentMissionForget",
	"chatgptWebsiteLogout"
]) {
	assert.equal(sessionMayCall(action), false, `${action} must require an API key`);
}

assert.equal(
	missingCredentialResponse("websiteAgentMissionStart").neededScope,
	"tunnel.browser"
);
assert.equal(
	missingCredentialResponse("websiteAgentMissionMessage").neededScope,
	"tunnel.browser"
);
assert.equal(
	missingCredentialResponse("websiteAgentMissionForget").neededScope,
	"tunnel.room"
);

console.log(JSON.stringify({
	ok: true,
	suite: "website-mission-session-policy",
	redactedStatusSessionSafe: true,
	browserMutationsKeyScoped: true,
	roomDeletionKeyScoped: true
}, null, 2));
