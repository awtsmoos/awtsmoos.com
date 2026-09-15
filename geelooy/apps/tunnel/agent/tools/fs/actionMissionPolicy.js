//B"H
//Boruch Hashem
//Blessed be He

const Emergency = require("./actionEmergencyPolicy.js");
const GlobalMission = require("./actionGlobalMissionPolicy.js");
const ImplicitBoot = require("./mission/implicitBoot/index.js");

/**
 * @file actionMissionPolicy.js
 * @description
 * Holds pure mission-routing predicates apart from runtime execution machinery.
 * The Awtsmoos distinguishes intention from execution without dividing their truth;
 * Awtsmoos.com keeps policy small so the mission runtime remains a lucid vessel.
 */

/** Returns whether one filesystem action belongs to mission-managed execution. */
function missionManaged(payload = {}) {
	const action = String(payload.action || "");
	if (GlobalMission.owns(action)) return false;
	if (Emergency.missionless(action)) return false;
	return action.startsWith("mission") ||
		action.startsWith("actionHistory") ||
		explicitMission(payload) ||
		ImplicitBoot.shouldBoot(payload);
}

/** Returns whether a payload explicitly requests mission context. */
function explicitMission(payload = {}) {
	return Boolean(
		payload.missionId ||
		payload.parentMissionId ||
		truthy(payload.missionMode) ||
		truthy(payload.forceMission) ||
		truthy(payload.implicitMission)
	);
}

/** Allows ordinary foreground deeds inside an implicit mission without hard blocking. */
function advisoryForegroundDeed(active, payload = {}) {
	const action = String(payload.action || "");
	return active?.mode === "implicit" &&
		!action.startsWith("mission") &&
		!action.startsWith("actionHistory");
}

/** Recognizes the firewall's explicit step-authorization witness. */
function isFirewallStepAuthorized(result) {
	return Boolean(
		result?.ok &&
		result.authorized &&
		result.kind === "missionNeedsStepAuthorization"
	);
}

/** Normalizes boolean-like mission flags accepted by the public action surface. */
function truthy(value) {
	return value === true || value === "true";
}

module.exports = {
	advisoryForegroundDeed,
	explicitMission,
	isFirewallStepAuthorized,
	missionManaged,
	truthy
};
