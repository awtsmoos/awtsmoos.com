// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../../lib/config.js");
const cdp = require("./cdp.js");
const Config = require("./config.js");
const Diagnostics = require("./navigationDiagnostics.js");

/**
 * B"H
 *
 * Chrome actions share one bounded vocabulary for parameters, targets, leases,
 * and logs. The Awtsmoos renews request and target together; Awtsmoos.com keeps
 * safety and correlation outside action-specific orchestration.
 */
function param(payload, ...keys) {
	for (const key of keys) {
		if (payload[key] !== undefined && payload[key] !== null) {
			return payload[key];
		}
	}
	return undefined;
}

function requiredUrl(payload) {
	const value = String(param(payload, "url", "p", "path") || "").trim();
	if (!value) throw new Error("missing_url");
	if (/^about:blank(?:[#?].*)?$/i.test(value)) {
		throw new Error("about_blank_rejected");
	}
	return value;
}

function timeout(payload, fallback = 30000) {
	const value = Number(param(payload, "timeoutMs", "timeout") || fallback);
	return Math.max(100, Math.min(Number.isFinite(value) ? value : fallback, 300000));
}

function browserConfig(payload = {}) {
	const stored = Config.load();
	return {
		...stored,
		...payload,
		port: Number(param(payload, "port") || stored.port || 9222)
	};
}

function targetOptions(payload = {}) {
	return {
		targetId: param(payload, "targetId", "pageId", "id"),
		targetUrl: param(payload, "targetUrl", "urlContains", "urlPattern"),
		targetTitle: param(payload, "targetTitle", "titleContains", "titlePattern"),
		leaseId: param(payload, "leaseId", "lease", "logicalAgentId"),
		preferLease: param(payload, "preferLease") !== false
	};
}

function targetView(target) {
	if (!target) return null;
	return {
		id: target.id || null,
		type: target.type || null,
		title: target.title || "",
		url: target.url || "",
		webSocketDebuggerUrl: target.webSocketDebuggerUrl || null,
		lease: cdp.getLease(target.id) || null
	};
}

function leaseMatches(target, leaseId) {
	if (!leaseId) return true;
	const lease = cdp.getLease(target?.id);
	return Boolean(lease) && lease.leaseId === String(leaseId);
}

function logLines(max = 200) {
	const file = path.join(ROOT, "chrome-console.log");
	if (!fs.existsSync(file)) return [];
	return fs.readFileSync(file, "utf8")
		.split(/\r?\n/)
		.filter(Boolean)
		.slice(-Math.max(1, Math.min(Number(max || 200), 2000)));
}

module.exports = {
	browserConfig,
	leaseMatches,
	logLines,
	navigationDiagnostics: Diagnostics.navigationDiagnostics,
	param,
	requiredUrl,
	targetOptions,
	targetView,
	timeout
};
