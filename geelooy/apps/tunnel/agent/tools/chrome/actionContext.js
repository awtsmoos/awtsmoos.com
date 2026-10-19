// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actionContext.js
 * @description Shares Chrome action aliases, target identity, timeouts, logs, and compact values without sharing side-effect policy.
 * The Awtsmoos gives every deed one language while preserving the boundary between seeing and changing.
 */

const { loadConfig } = require("../../lib/config.js");
const { findChrome, chromeFindDetails } = require("./finder.js");
const cdp = require("./cdp.js");
const { compactLogs, compactExpression } = require("./compact.js");
const { readChromeLogs } = require("./logs.js");

function param(payload = {}, key, fallback = "") {
	return payload[key] ?? payload.params?.[key] ?? fallback;
}

function urlOf(payload = {}, fallback = "about:blank") {
	for (const key of ["url", "href", "targetUrl", "p", "path"]) {
		for (const value of [payload[key], payload.params?.[key]]) {
			const text = String(value ?? "").trim();
			if (text) return text;
		}
	}
	return String(fallback || "");
}

function expressionOf(payload = {}, fallback = "document.title") {
	return String(param(payload, "expression", param(payload, "script",
		param(payload, "source", param(payload, "code",
			param(payload, "command", param(payload, "text", fallback)))))) || fallback);
}

function timeoutOf(payload = {}, fallback = 30000) {
	const value = Number(param(payload, "timeoutMs", fallback));
	const maximum = Number(process.env.AWTSMOOS_CHROME_MAX_TIMEOUT_MS || 86400000);
	return Number.isFinite(value) ? Math.max(1000, Math.min(value, maximum)) : fallback;
}

function targetOptions(payload = {}) {
	const id = param(payload, "chromeTargetId", param(payload, "pageId", param(payload, "targetId", "")));
	return {
		pageId:id,
		chromeTargetId:id,
		browserSessionId:param(payload, "browserSessionId", ""),
		roomId:param(payload, "roomId", ""),
		missionId:param(payload, "missionId", ""),
		agentSessionId:param(payload, "agentSessionId", ""),
		logicalAgentId:param(payload, "logicalAgentId", ""),
		shared:payload.shared === true,
		inspectShared:payload.inspectShared === true,
		force:payload.force === true
	};
}

function chromeConfig(payload, action) {
	const config = loadConfig();
	const blocked = (!config.chrome.enabled || !config.tools.chrome)
		? { ok:false, action, error:"chrome_disabled", message:"Enable Chrome tool in dashboard and Save Config." }
		: null;
	return { config, blocked, port:Number(param(payload, "port", config.chrome.port || 9222)) };
}

function targetView(target = {}) {
	return {
		id:target.id,
		chromeTargetId:target.id,
		title:String(target.title || "").slice(0, 120),
		url:String(target.url || "").slice(0, 300),
		type:target.type,
		attached:Boolean(target.webSocketDebuggerUrl),
		lease:cdp.targetLease(target.id)
	};
}

function readCompactLogs(payload = {}) {
	return compactLogs(readChromeLogs({
		maxLogs:Number(param(payload, "maxLogs", 20)),
		clear:!!param(payload, "clearLogs", false)
	}), param(payload, "maxLogs", 20));
}

function remoteValue(result) {
	return result?.result?.value;
}

function expressionSummary(expression) {
	return compactExpression(expression);
}

function leaseMatches(lease = {}, payload = {}) {
	const options = targetOptions(payload);
	const expected = [options.browserSessionId, options.roomId, options.missionId, options.agentSessionId, options.logicalAgentId];
	return [lease.browserSessionId, lease.roomId, lease.missionId, lease.agentSessionId, lease.logicalAgentId]
		.every((value, index) => !value || value === expected[index]);
}

module.exports = {
	cdp,
	chromeConfig,
	chromeFindDetails,
	expressionOf,
	expressionSummary,
	findChrome,
	leaseMatches,
	param,
	readCompactLogs,
	remoteValue,
	targetOptions,
	targetView,
	timeoutOf,
	urlOf
};
