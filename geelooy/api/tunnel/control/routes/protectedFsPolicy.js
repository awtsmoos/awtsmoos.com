// B"H
// Boruch Hashem
// Blessed is He

const { actionRequiredScope, buildFsPayload } = require("../core/tunnelPayload.js");
const Compatibility = require("./protectedFsCompatibility.js");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_SAFE_ACTIONS = new Set([
	"list", "tree", "read", "readLines", "readManyLines", "readBytes",
	"read64", "md", "stat", "roots", "rootBrowse", "configGet",
	"payloadEcho", "actionSchemaTrace", "actionHistoryList",
	"actionHistoryGet", "actionHistorySearch", "actionHistoryExplain",
	"actionHistoryDiff", "chromeStatus", "missionProjectDiscover",
	"missionProjectStatus", "missionTimeline", "missionTurnStatus",
	"missionResourceStatus", "websiteAgentMissionList",
	"websiteAgentMissionStatus", "aiAgentWebsiteMissionStatus"
]);

function sessionMayUse(action) {
	return SESSION_SAFE_ACTIONS.has(String(action || ""));
}

function buildPayload($i, tunnelName) {
	const original = Compatibility.normalize(buildFsPayload($i));
	return {
		...original,
		autoPreview: original.autoPreview === undefined ? false : original.autoPreview,
		tunnelName: tunnelName || original.tunnelName || "auto"
	};
}

function requiredPermission(action) {
	return actionRequiredScope(action) || "tunnel.read";
}

function boundedTunnelTimeout(value) {
	const parsed = Number(value || 30000);
	const timeout = Number.isFinite(parsed) ? parsed : 30000;
	if (timeout > ONE_DAY_MS) {
		const error = new Error("timeout_too_large");
		error.status = 400;
		throw error;
	}
	return Math.max(1000, Math.floor(timeout));
}

function wantsPreview(value) {
	return value === true || value === "true" || value === 1 || value === "1";
}

function responseBytes(value) {
	try {
		return Buffer.byteLength(JSON.stringify(value), "utf8");
	} catch {
		return 0;
	}
}

module.exports = {
	ONE_DAY_MS,
	SESSION_SAFE_ACTIONS,
	boundedTunnelTimeout,
	buildPayload,
	requiredPermission,
	responseBytes,
	sessionMayUse,
	wantsPreview
};
