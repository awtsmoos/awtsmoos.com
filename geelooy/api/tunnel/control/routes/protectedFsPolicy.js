// B"H
// Boruch Hashem
// Blessed is He

const { actionRequiredScope, buildFsPayload } = require("../core/tunnelPayload.js");
const { normalizeAsyncPayload } = require("../core/asyncPayloadNormalizer.js");
const Compatibility = require("./protectedFsCompatibility.js");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_SAFE_ACTIONS = new Set([
	"list", "tree", "read", "readLines", "readManyLines", "readBytes",
	"read64", "md", "stat", "roots", "rootBrowse", "configGet",
	"payloadEcho", "actionSchemaTrace", "actionHistoryList",
	"actionHistoryGet", "actionHistorySearch", "actionHistoryExplain",
	"actionHistoryDiff", "chromeStatus", "chatgptStatus", "missionProjectDiscover",
	"missionProjectStatus", "missionTimeline", "missionTurnStatus",
	"missionResourceStatus", "websiteAgentMissionList",
	"websiteAgentMissionStatus", "aiAgentWebsiteMissionStatus"
]);

/**
 * @file Keeps signed-session read policy synchronized with the Tunnel Control browser.
 * @description
 * The Awtsmoos lets an authenticated user observe Chrome, ChatGPT, history, and mission
 * status without granting mutation. Awtsmoos.com still requires scoped API keys for deeds.
 * Async command observation is normalized once at this public boundary so commandWait/status
 * always preserve the caller's existing job identity instead of becoming a fresh relay deed.
 */
function sessionMayUse(action) {
	return SESSION_SAFE_ACTIONS.has(String(action || ""));
}

function buildPayload($i, tunnelName) {
	const built = buildFsPayload($i);
	const asyncNormalized = normalizeAsyncPayload(built);
	const original = Compatibility.normalize(asyncNormalized);
	const payload = {
		...original,
		autoPreview: original.autoPreview === undefined ? false : original.autoPreview,
		tunnelName: tunnelName || original.tunnelName || "auto"
	};
	const post = $i["$_POST"] || $i.paramKinds?.POST || $i.request?.body || {};
	const get = $i["$_GET"] || $i.paramKinds?.GET || {};
	const timeoutWasExplicit = Object.prototype.hasOwnProperty.call(post, "timeoutMs") || Object.prototype.hasOwnProperty.call(get, "timeoutMs");
	if (payload.action === "commandRun" && !timeoutWasExplicit) delete payload.timeoutMs;
	const explicitRelayWait = post.relayWaitMs ?? get.relayWaitMs ?? post.httpSafeWaitMs ?? get.httpSafeWaitMs;
	if (payload.action === "commandRun") {
		payload.relayWaitMs = explicitRelayWait === undefined ? 150 : explicitRelayWait;
	}
	return payload;
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
