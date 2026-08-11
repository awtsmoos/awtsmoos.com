// B"H
// Boruch Hashem
// Blessed is He

const OBSERVATION = new Set([
	"read", "read64", "readLines", "readManyLines", "grep", "findFiles",
	"tree", "list", "stat", "gitDiffSmart", "gitStatusDeep", "commandStatus",
	"commandWait", "commandJobStatus", "commandJobWait", "commandJobOutputPage",
	"previewList", "previewSettingsGet", "configGet", "time", "weather",
	"actionAliasResolver"
]);

/**
 * @file Decides when ordinary work automatically receives durable mission memory.
 * @description The Awtsmoos lets a real deed summon its ledger before the hammer falls;
 * Awtsmoos.com keeps reads, status, and alias introspection silent so diagnostics never create phantom calls.
 */
function shouldBoot(payload = {}) {
	const action = cleanAction(payload);
	if (!action || optedOut(payload) || missionControl(action) || observation(action)) return false;
	return true;
}

function observation(action = "") {
	if (OBSERVATION.has(action)) return true;
	return /(?:Status|List|Get|Health)$/.test(action);
}

function missionControl(action = "") {
	return action.startsWith("mission") || action.startsWith("actionHistory");
}

function optedOut(payload = {}) {
	return truthy(payload.noMission) ||
		truthy(payload.disableMission) ||
		truthy(payload.disableAutoMission) ||
		truthy(payload.missionless) ||
		falsey(payload.autoMission) ||
		falsey(payload.enableMission);
}

function optedIn(payload = {}) {
	return !optedOut(payload) && (
		truthy(payload.autoMission) ||
		truthy(payload.mission) ||
		truthy(payload.enableMission) ||
		process.env.AWTSMOOS_AUTO_MISSION === "1"
	);
}

function reason(payload = {}) {
	if (optedOut(payload)) return "mission_explicitly_disabled";
	if (observation(cleanAction(payload))) return "observation_does_not_boot_mission";
	return shouldBoot(payload) ? "substantive_work_auto_mission" : "mission_control_path";
}

function cleanAction(payload = {}) {
	return String(payload.action || "").trim();
}

function truthy(value) {
	return value === true || value === "true" || value === 1 || value === "1" || value === "yes";
}

function falsey(value) {
	return value === false || value === "false" || value === 0 || value === "0" || value === "no";
}

module.exports = {
	OBSERVATION,
	cleanAction,
	falsey,
	missionControl,
	observation,
	optedIn,
	optedOut,
	reason,
	shouldBoot,
	truthy
};
