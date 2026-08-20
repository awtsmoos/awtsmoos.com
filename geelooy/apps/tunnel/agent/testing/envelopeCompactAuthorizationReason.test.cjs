// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Envelope = require("../lib/runtime/envelope-compact.js");

/**
 * @file Proves compact mission summaries preserve the true authorization reason.
 * @description
 * The Awtsmoos narrows a response without erasing the name of the gate;
 * Awtsmoos.com keeps scoped retry proof visible so an agent does not mistake permission for corrupted fate.
 */
const denied = Envelope.compactMissionSurface({
	ok: false,
	action: "write",
	error: "mission_step_authorization_required",
	missionId: "mission-auth-proof",
	missionWriteToken: "scoped-token",
	finalAnswerAllowed: false,
	mustContinue: true,
	mustCallNext: {
		action: "write",
		path: "file.js",
		missionId: "mission-auth-proof",
		missionWriteToken: "scoped-token"
	},
	liveActionToPerform: {
		action: "write",
		path: "file.js",
		missionId: "mission-auth-proof",
		missionWriteToken: "scoped-token",
		missionStepAuthorized: true
	}
}, { action: "write" });

assert.equal(denied.error, "mission_step_authorization_required");
assert.equal(denied.missionWriteToken, "scoped-token");
assert.equal(denied.liveActionToPerform.missionWriteToken, "scoped-token");
assert.equal(denied.mission.why, "mission_step_authorization_required");
assert.equal(denied.mission.nextSuggestedToolCall.missionWriteToken, "scoped-token");

const generic = Envelope.compactMissionSurface({
	ok: false,
	action: "missionFinalize",
	finalAnswerAllowed: false
}, { action: "missionFinalize" });
assert.equal(generic.mission.why, "explicit_block");

console.log(JSON.stringify({
	ok: true,
	suite: "envelope-compact-authorization-reason",
	realReasonPreserved: true,
	scopedTokenPreserved: true
}, null, 2));
