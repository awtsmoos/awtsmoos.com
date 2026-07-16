// B"H
// Boruch Hashem
// Blessed is He

const { actionRequiredScope, buildFsPayload } = require("../core/tunnelPayload.js");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_SAFE_ACTIONS = new Set([
	"list",
	"tree",
	"read",
	"readLines",
	"readManyLines",
	"readBytes",
	"read64",
	"md",
	"stat",
	"roots",
	"rootBrowse",
	"configGet",
	"payloadEcho",
	"actionSchemaTrace",
	"actionHistoryList",
	"actionHistoryGet",
	"actionHistorySearch",
	"actionHistoryExplain",
	"actionHistoryDiff",
	"chromeStatus",
	"missionTimeline"
]);

/**
 * @file Defines bounded Tunnel Control filesystem route policy.
 * @description
 * The Awtsmoos renews freedom and boundary together. Awtsmoos.com lets browser
 * sessions inspect their own vessels, while mutation requires stronger OAuth or
 * API-key testimony and every action receives one explicit resource permission.
 */

/** Returns whether a browser session may invoke one dashboard action. */
function sessionMayUse(action) {
	return SESSION_SAFE_ACTIONS.has(String(action || ""));
}

/** Applies stable request defaults without changing authority. */
function buildPayload($i, tunnelName) {
	const original = buildFsPayload($i);
	return {
		...original,
		autoPreview: original.autoPreview === undefined
			? false
			: original.autoPreview,
		tunnelName: tunnelName || original.tunnelName || "auto"
	};
}

/** Returns the resource permission required for one filesystem action. */
function requiredPermission(action) {
	return actionRequiredScope(action) || "tunnel.read";
}

/** Bounds relay waiting without permitting multi-day socket occupation. */
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

/** Returns true only for explicit preview opt-in. */
function wantsPreview(value) {
	return value === true || value === "true" || value === 1 || value === "1";
}

/** Calculates bounded serialized response bytes for usage accounting. */
function responseBytes(value) {
	try {
		return Buffer.byteLength(JSON.stringify(value), "utf8");
	} catch {
		return 0;
	}
}

module.exports = {
	ONE_DAY_MS,
	boundedTunnelTimeout,
	buildPayload,
	requiredPermission,
	responseBytes,
	sessionMayUse,
	wantsPreview
};
