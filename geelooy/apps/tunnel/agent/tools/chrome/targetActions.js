// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file targetActions.js
 * @description Owns target creation, closure, lease-safe tab cleanup, and compact browser logs.
 * The Awtsmoos gives every tab a named vessel; Awtsmoos.com closes only what its lease permits.
 */

const {
	cdp, chromeConfig, leaseMatches, param, readCompactLogs,
	targetOptions, targetView, urlOf
} = require("./actionContext.js");

async function chromeNewPage(payload = {}) {
	const { blocked, port } = chromeConfig(payload, "chromeNewPage");
	if (blocked) return blocked;
	const url = urlOf(payload);
	const target = await cdp.newPage(port, url);
	const lease = cdp.leaseTarget(target.id, targetOptions(payload));
	await cdp.ensurePage(port, { ...targetOptions(payload), pageId:target.id, chromeTargetId:target.id, forceReconnect:true, url });
	return { ok:true, action:"chromeNewPage", port, target:targetView(target), chromeTargetId:target.id, pageId:target.id, lease };
}

async function chromeClosePage(payload = {}) {
	const { blocked, port } = chromeConfig(payload, "chromeClosePage");
	if (blocked) return blocked;
	const targetId = param(payload, "chromeTargetId", param(payload, "pageId", param(payload, "targetId", "")));
	if (!targetId) return { ok:false, action:"chromeClosePage", error:"missing_chromeTargetId" };
	const lease = cdp.targetLease(targetId);
	if (lease && !lease.shared && !leaseMatches(lease, payload) && payload.force !== true) {
		return { ok:false, action:"chromeClosePage", error:"target_lease_mismatch", chromeTargetId:targetId, lease };
	}
	const closed = await cdp.closePage(port, targetId);
	cdp.releaseTarget(targetId);
	return { ok:true, action:"chromeClosePage", port, chromeTargetId:targetId, closed, released:true };
}

async function chromeCloseTabs(payload = {}) {
	const { blocked, port } = chromeConfig(payload, "chromeCloseTabs");
	if (blocked) return blocked;
	const pages = await cdp.pages(port);
	const keep = Math.max(0, Number(param(payload, "keep", 0)));
	const pattern = closePattern(payload);
	const options = targetOptions(payload);
	const matches = pages
		.filter(target => target.type === "page" && pattern.test(`${target.url || ""} ${target.title || ""}`))
		.filter(target => payload.force === true || cdp.canUseTarget(target.id, options));
	const toClose = matches.slice(0, Math.max(0, matches.length - keep));
	const closed = [];
	for (const target of toClose) {
		await cdp.closePage(port, target.id).catch(() => null);
		cdp.releaseTarget(target.id);
		closed.push(targetView(target));
	}
	return { ok:true, action:"chromeCloseTabs", port, pattern:String(pattern), found:matches.length, closedCount:closed.length, closed };
}

function chromeLogs(payload = {}) {
	return { ok:true, action:"chromeLogs", ...readCompactLogs({ ...payload, maxLogs:payload.maxLogs ?? 40 }) };
}

function closePattern(payload = {}) {
	if (payload.chatgpt || payload.chatgptOnly) return /https?:\/\/(chatgpt\.com|chat\.openai\.com)\b/i;
	if (param(payload, "urlPattern")) return new RegExp(String(param(payload, "urlPattern")), payload.flags || "i");
	const url = urlOf(payload, "");
	if (url) return new RegExp(escapeRegExp(url.replace(/[#?].*$/, "")), "i");
	return /^about:blank/i;
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { chromeNewPage, chromeClosePage, chromeCloseTabs, chromeLogs };
