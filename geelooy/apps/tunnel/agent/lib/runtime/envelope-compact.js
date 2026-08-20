// B"H
// Boruch Hashem
// Blessed is He

const FULL_MODES = new Set(["debug", "full", "audit", "standard", "raw"]);
const BLOAT_KEYS = new Set([
	"mustCallNext", "checkpointMessage", "tunnelInstruction", "agentGuidance", "emergencyStopAllowedOnlyFor",
	"userVisibleAnswerBlocked", "finalAnswerBlockedReason", "nextRequiredToolCall", "nextSuggestedToolCall",
	"continuationPressure", "continuationEscrow", "responseFocus", "multipleChoiceSelfInterrogation",
	"tunnelProtocol", "missionHeartbeat", "autoContinuationFinal", "autoContinuationTrace", "autoContinuationSteps", "workQueue"
]);
const FS_RESULT_KEYS = new Set([
	"content", "items", "entries", "files", "dirs", "absolutePath", "returnedChars", "totalChars", "hasNextPage",
	"nextOffsetChars", "nextPagePayload", "statusPayload", "waitPayload", "stdoutPagePayload", "stderrPagePayload",
	"count", "results", "result", "errors", "diagnostics"
]);
const MISSION_ACTION = /^(mission|actionHistory)/;

/**
 * @file Compacts mission envelopes without replacing a precise denial with a vague one.
 * @description
 * The Awtsmoos narrows the vessel but never the truth inside it;
 * Awtsmoos.com keeps scoped authorization visible and names the actual guard that denied the deed.
 */
function shouldCompact(payload = {}, result = {}) {
	const mode = String(payload.responseMode || result.responseMode || "").toLowerCase();
	return !FULL_MODES.has(mode);
}

function hasFsPayload(result = {}) {
	return Object.keys(result || {}).some(key => FS_RESULT_KEYS.has(key));
}

function compactMissionSurface(result = {}, payload = {}) {
	if (!shouldCompact(payload, result)) return result;
	const out = { ...result };
	const action = String(out.action || payload.action || "");
	const attach = MISSION_ACTION.test(action) || Boolean(
		out.missionAdvisory || out.nextRequiredToolCall || out.mustCallNext || out.userVisibleAnswerBlocked === true
	);
	const mission = attach && !hasFsPayload(out) ? compactMission(out) : undefined;
	const debugRef = detailsRef(out);
	for (const key of BLOAT_KEYS) delete out[key];
	if (mission) out.mission = mission;
	else delete out.mission;
	if (debugRef) out.detailsRef = debugRef;
	out.responseShape = "compact-envelope-v2";
	return out;
}

function compactMission(source = {}) {
	const advisory = source.missionAdvisory || {};
	const nextCall = source.nextRequiredToolCall || source.mustCallNext || source.nextSuggestedToolCall || advisory.suggestedNext || null;
	const active = Boolean(advisory.active || source.mission?.active || source.missionStatus?.active);
	const blocked = source.userVisibleAnswerBlocked === true || source.finalAnswerAllowed === false;
	return clean({
		active,
		advisory: active && !blocked,
		resumeAvailable: Boolean(active && advisory.resumeAvailable !== false),
		next: nextCall ? `Resume available via ${nextCall.action}.` : source.summary || source.next || "Continue with the next safe action.",
		nextSuggestedToolCall: nextCall || undefined,
		engagementRequired: false,
		why: blocked ? blockReason(source) : undefined,
		detailsRef: detailsRef(source)
	});
}

function blockReason(source = {}) {
	return source.finalAnswerBlockedReason || source.error || source.reason || "explicit_block";
}

function detailsRef(source = {}) {
	return source.outputRef || source.actionId || source.detailsRef || undefined;
}

function clean(object) {
	for (const key of Object.keys(object)) {
		if (object[key] === undefined || object[key] === "") delete object[key];
	}
	return object;
}

module.exports = {
	BLOAT_KEYS,
	FS_RESULT_KEYS,
	FULL_MODES,
	blockReason,
	compactMission,
	compactMissionSurface,
	hasFsPayload,
	shouldCompact
};
