// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./continuation-identity.js");

const MISSION_SIDE_KEYS = Object.freeze([
	"missionId",
	"finalAnswerAllowed",
	"mustContinue",
	"mustCallNext",
	"workQueue",
	"liveActionToPerform",
	"fileWorkRequired"
]);

const PUBLIC_STATE_KEYS = Object.freeze([
	"finalAnswerAllowed",
	"userVisibleAnswerBlocked",
	"finalAnswerBlockedReason",
	"nextRequiredToolCall",
	"mustContinue",
	"mustCallNext",
	"workQueue",
	"liveActionToPerform",
	"fileWorkRequired"
]);

/**
 * @file Preserves outer identity while advancing continuation state truthfully.
 * @description
 * The Awtsmoos lets the inner mission change whether work is finished without
 * letting that mission steal the outer request's face. Awtsmoos.com therefore
 * restores sacred identity but surfaces the latest block/finish state, so a
 * completed continuation cannot remain imprisoned by its first stale blockade.
 */
function preserve(first = {}, final = {}, trace = [], stopped = "", sacred = {}) {
	const mission = {
		...(isObject(first.mission) ? first.mission : {}),
		continuation: compactMission(final),
		finalAction: String(final?.action || ""),
		active: final?.finalAnswerAllowed !== true,
		trace
	};
	const output = {
		...first,
		autoContinuationFinal: final,
		autoContinuationTrace: trace,
		autoContinuationSteps: trace.length,
		mission
	};
	applyPublicState(output, final);
	Identity.restoreIdentity(output, first, sacred);
	if (stopped) output.autoContinuationStopped = stopped;
	return output;
}

function applyPublicState(output, final = {}) {
	for (const key of PUBLIC_STATE_KEYS) {
		if (final[key] !== undefined) output[key] = final[key];
	}
	if (final.finalAnswerAllowed === true) {
		output.userVisibleAnswerBlocked = false;
		delete output.finalAnswerBlockedReason;
		delete output.nextRequiredToolCall;
		delete output.mustCallNext;
		delete output.mustContinue;
	}
	return output;
}

function compactMission(final = {}) {
	const result = {};
	for (const key of MISSION_SIDE_KEYS) {
		if (final[key] !== undefined) result[key] = final[key];
	}
	return result;
}

function mark(result, trace, reason) {
	return preserve(
		result,
		result,
		trace,
		reason,
		Identity.identity({}, {}, result)
	);
}

function isObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

module.exports = {
	MISSION_SIDE_KEYS,
	PUBLIC_STATE_KEYS,
	applyPublicState,
	compactMission,
	isObject,
	mark,
	preserve
};
