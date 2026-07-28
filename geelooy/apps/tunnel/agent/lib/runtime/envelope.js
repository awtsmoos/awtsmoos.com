// B"H
// Boruch Hashem
// Blessed is He

const { loadConfig } = require("../config.js");
const Aliases = require("./aliases.js");
const Correlation = require("./correlation.js");
const Recovery = require("./recovery-envelope.js");
const Compact = require("./envelope-compact.js");
const Surface = require("./response-surface.js");

/**
	* @file Builds one truthful public response from caller and worker identity.
	* @description
	* The Awtsmoos preserves the requested doorway while Awtsmoos.com names the
	* execution vessel separately, so promotion can never masquerade as sameness.
	*/
function responseEnvelope(data = {}, payload = {}, result, enqueuedAt, stats) {
	const safe = normalizeResult(result);
	const configuredTunnelName = String(loadConfig().tunnelName || "");
	const identity = Recovery.normalizeActionIdentity({
		...payload,
		action: payload.action || safe.requestAction || safe.action
	});
	const requestAction = String(identity.requestAction || payload.action || "unknown");
	preventMissionHijack(safe, requestAction);
	const executionAction = executionOf(safe, requestAction);
	const promoted = requestAction !== executionAction;
	const compact = Compact.compactMissionSurface(stripTransportFields(safe), payload);
	const correlation = Correlation.fields({
		...payload,
		tunnelName: configuredTunnelName || payload.tunnelName,
		requestedTunnelName: payload.requestedTunnelName || configuredTunnelName
	});
	return Surface.publicEnvelope({
		...compact,
		type: "TUNNEL_RESPONSE",
		id: data.id,
		...correlation,
		action: requestAction,
		requestAction,
		executionAction,
		actualAction: executionAction,
		actionPromoted: promoted,
		actionMismatch: promoted && !Aliases.allowed(requestAction, executionAction),
		queuedMs: Math.max(0, Date.now() - enqueuedAt),
		queueStats: stats()
	}, payload, safe);
}

function executionOf(result = {}, fallback) {
	return String(
		result.executionAction ||
		result.servedByAction ||
		result.actualAction ||
		result.action ||
		fallback
	);
}

function normalizeResult(result) {
	return result && typeof result === "object"
		? { ...result }
		: { ok: true, value: result };
}

function stripTransportFields(safe) {
	const copy = { ...safe };
	for (const key of ["type", "id", "controlRequestId", "queueStats", "queuedMs"]) {
		delete copy[key];
	}
	return copy;
}

function preventMissionHijack(safe, requestAction) {
	const rawAction = String(safe.action || "");
	if (!missionHijack(requestAction, rawAction, safe)) return;
	safe.mission = {
		...(safe.mission || {}),
		identityGuard: { preventedTopLevelAction: rawAction, requestAction }
	};
	if (!safe.autoContinuationFinal) safe.autoContinuationFinal = { action: rawAction };
	safe.action = requestAction;
}

function missionHijack(requestAction, rawAction, result = {}) {
	if (!requestAction || !rawAction || requestAction === rawAction) return false;
	if (!rawAction.startsWith("mission") && !rawAction.startsWith("actionHistory")) return false;
	return result.requestAction === requestAction ||
		result.originalAction === requestAction ||
		Boolean(result.autoContinuationFinal || result.mission || result.mustCallNext || result.nextRequiredToolCall);
}

module.exports = {
	executionOf,
	missionHijack,
	responseEnvelope
};
