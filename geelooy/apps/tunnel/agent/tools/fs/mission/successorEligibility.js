// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./successorIdentity.js");

/**
 * @file Decides whether a terminal agent should yield responsibility to a successor.
 * @description
 * The Awtsmoos does not multiply messengers merely to preserve a number; Awtsmoos.com
 * asks the mission court whether safe work still burns, suppresses user-blocked or finished
 * missions, and fingerprints the remaining obligation so repetition can be bounded with truth.
 */
function evaluate(mission = {}, payload = {}, verdict = {}, recovery = {}) {
	const work = workSnapshot(verdict, recovery);
	const fingerprint = Identity.workFingerprint(work);
	if (!automaticSuccessionEnabled(mission, payload)) {
		return suppressed("automatic_successor_disabled", work, fingerprint);
	}
	if (terminalMissionState(mission.status)) {
		return suppressed("mission_terminal", work, fingerprint);
	}
	if (verdict.blocked || (recovery.openUserMessages || []).length) {
		return suppressed("user_decision_required", work, fingerprint);
	}
	if (verdict.ok === true || verdict.finalAnswerAllowed === true) {
		return suppressed("mission_court_complete", work, fingerprint);
	}
	if (!hasWork(work, verdict)) {
		return suppressed("no_unfinished_work", work, fingerprint);
	}
	return {
		eligible: true,
		reason: "unfinished_safe_work",
		work,
		fingerprint
	};
}

function workSnapshot(verdict = {}, recovery = {}) {
	return {
		issues: [...new Set(verdict.issues || [])].sort(),
		unfinishedTasks: [...new Set(recovery.unfinishedTasks || [])].sort(),
		openJobs: [...new Set(recovery.openJobs || [])].sort(),
		mustCallNext: verdict.mustCallNext || recovery.next || null
	};
}

function hasWork(work, verdict) {
	return work.issues.length > 0 ||
		work.unfinishedTasks.length > 0 ||
		work.openJobs.length > 0 ||
		Boolean(work.mustCallNext) ||
		verdict.mustContinue === true;
}

function automaticSuccessionEnabled(mission, payload) {
	if (payload.autoSuccessor === false || payload.autoSuccessor === "false") {
		return false;
	}
	if (mission.automation?.autoSuccessor === false) {
		return false;
	}
	if (mission.collaboration?.settings?.autoSuccessor === false) {
		return false;
	}
	return true;
}

function terminalMissionState(status) {
	return ["complete", "completed", "cancelled", "refrigerated", "archived"]
		.includes(String(status || "").toLowerCase());
}

function suppressed(reason, work, fingerprint) {
	return { eligible: false, reason, work, fingerprint };
}

module.exports = {
	automaticSuccessionEnabled,
	evaluate,
	terminalMissionState,
	workSnapshot
};
