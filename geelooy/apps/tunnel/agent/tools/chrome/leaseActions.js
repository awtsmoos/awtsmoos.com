// B"H

const { loadConfig } = require("../../lib/config.js");
const cdp = require("./cdp.js");
const Scope = require("./scopePolicy.js");

function targetOptions(payload = {}) {
	const scope = Scope.normalizedScope(payload);
	const targetId = Scope.parameter(payload, "chromeTargetId", Scope.parameter(payload, "pageId", Scope.parameter(payload, "targetId", "")));
	return {
		...scope,
		pageId: targetId,
		chromeTargetId: targetId,
		shared: payload.shared === true,
		inspectShared: payload.inspectShared === true,
		force: payload.force === true
	};
}

function targetView(target = {}) {
	return {
		id: target.id,
		chromeTargetId: target.id,
		title: String(target.title || "").slice(0, 120),
		url: String(target.url || "").slice(0, 300),
		type: target.type,
		attached: Boolean(target.webSocketDebuggerUrl),
		lease: cdp.targetLease(target.id)
	};
}

/**
 * B"H — A browser target is acquired by stable mission identity. The returned
 * target ID is the receipt every later browser action must carry, making ownership
 * visible instead of depending on whichever tab happened to be current.
 */
async function chromeTargetAcquire(payload = {}) {
	if (!Scope.hasScope(payload) && payload.shared !== true) {
		return Scope.scopeRequiredEnvelope("chromeTargetAcquire", payload);
	}
	const config = loadConfig();
	if (!config.chrome.enabled || !config.tools.chrome) {
		return { ok: false, action: "chromeTargetAcquire", error: "chrome_disabled" };
	}
	const port = Number(Scope.parameter(payload, "port", config.chrome.port || 9222));
	const options = targetOptions(payload);
	const targets = (await cdp.pages(port)).filter(target => target.type === "page" && target.webSocketDebuggerUrl);
	let target = options.chromeTargetId
		? targets.find(candidate => candidate.id === options.chromeTargetId)
		: cdp.choosePage(targets, options);
	if (target && !cdp.canUseTarget(target.id, options)) {
		return { ok: false, action: "chromeTargetAcquire", error: "target_lease_mismatch", target: targetView(target) };
	}
	if (!target) target = await cdp.newPage(port, Scope.parameter(payload, "url", "about:blank"));
	const lease = cdp.leaseTarget(target.id, options);
	await cdp.ensurePage(port, { ...options, pageId: target.id, chromeTargetId: target.id, forceReconnect: true });
	return {
		ok: true,
		action: "chromeTargetAcquire",
		port,
		chromeTargetId: target.id,
		pageId: target.id,
		target: targetView(target),
		lease,
		nextRequiredFields: { chromeTargetId: target.id, ...Scope.normalizedScope(payload) }
	};
}

async function chromeTargetRelease(payload = {}) {
	const targetId = Scope.parameter(payload, "chromeTargetId", Scope.parameter(payload, "pageId", ""));
	if (!targetId) return { ok: false, action: "chromeTargetRelease", error: "missing_chromeTargetId" };
	const lease = cdp.targetLease(targetId);
	if (lease && !lease.shared && Scope.scopeKey(payload) !== lease.scopeKey && payload.force !== true) {
		return { ok: false, action: "chromeTargetRelease", error: "target_lease_mismatch", lease };
	}
	return { ok: true, action: "chromeTargetRelease", chromeTargetId: targetId, released: cdp.releaseTarget(targetId) };
}

module.exports = { chromeTargetAcquire, chromeTargetRelease, targetOptions, targetView };
