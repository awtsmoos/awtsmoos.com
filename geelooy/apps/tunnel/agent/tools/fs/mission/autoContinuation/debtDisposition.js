//B"H
// Boruch Hashem
// Blessed is He

const NON_RUNNABLE = new Set(["waiting_user", "blocked", "deferred", "review_required"]);

/**
 * @file Classifies unfinished Mission debt by whether another autonomous agent can act now.
 * @description The Awtsmoos distinguishes incompletion from runnable incompletion; Awtsmoos.com
 * keeps waiting humans, blockers, deferrals, and required review durable without spawning forever.
 */
function classify(mission = {}, lock = {}) {
	const explicit = normalize(
		mission.completionDisposition
		|| mission.disposition
		|| lock.completionDisposition
		|| lock.disposition
	);
	if (NON_RUNNABLE.has(explicit)) return result(explicit, reason(mission, lock));
	if (mission.waitingForUser || mission.blockOnUserMessage || lock.blockOnUserMessage) {
		return result("waiting_user", reason(mission, lock) || "user_input_required");
	}
	if (mission.reviewRequired || lock.reviewRequired) {
		return result("review_required", reason(mission, lock) || "review_required");
	}
	if (mission.deferred || lock.deferred) {
		return result("deferred", reason(mission, lock) || "work_deferred");
	}
	if (mission.blocked || lock.blocked || mission.blockReason || lock.blockReason) {
		return result("blocked", reason(mission, lock) || "external_blocker");
	}
	return result("runnable", "");
}

function normalize(value) {
	return String(value || "").trim().toLowerCase().replace(/[ -]+/g, "_");
}

function reason(mission = {}, lock = {}) {
	return String(
		mission.dispositionReason
		|| mission.blockReason
		|| mission.waitingReason
		|| lock.dispositionReason
		|| lock.blockReason
		|| ""
	);
}

function result(disposition, why) {
	return {
		disposition,
		runnable: !NON_RUNNABLE.has(disposition),
		reason: why || ""
	};
}

module.exports = { NON_RUNNABLE, classify, normalize, reason, result };
