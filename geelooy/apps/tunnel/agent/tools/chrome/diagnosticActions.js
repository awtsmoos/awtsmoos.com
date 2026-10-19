// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file diagnosticActions.js
 * @description Keeps network, accessibility, URL-test and doctor diagnostics separate from core browser reliability actions.
 * The Awtsmoos lets diagnosis observe the living browser without owning its covenant;
 * Awtsmoos.com gathers logs, structure, and evidence after the browser path itself is proven.
 */

const { cdpCall, navigateAndWait } = require("./cdp.js");
const chromeActions = require("./actions.js");
const { readChromeLogs } = require("./logs.js");
const { pageSnapshot } = require("./snapshot.js");
const { compactLogs, valueSummary } = require("./compact.js");
const { legacyReady, timeoutOf } = require("./legacyReady.js");

async function chromeNetwork(payload = {}) {
	const logRead = readChromeLogs({ maxLogs:payload.maxLogs || 300, clear:!!payload.clearLogs });
	const network = logRead.logs.filter(entry => entry.source.startsWith("network") || entry.details?.url || entry.details?.requestId);
	const filtered = payload.failedOnly === false ? network : network.filter(isChromeError);
	return { ok:true, action:"chromeNetwork", failedOnly:payload.failedOnly !== false, count:filtered.length, logs:compactLogs({ ...logRead, logs:filtered }, payload.maxLogs || 80) };
}

async function chromeAccessibilitySnapshot(payload = {}) {
	await legacyReady(payload);
	const limit = Math.max(1, Math.min(Number(payload.limit || 100), 300));
	const expression = `(()=>Array.from(document.querySelectorAll("a,button,input,textarea,select,[role],h1,h2,h3,h4,label")).slice(0,${limit}).map(el=>({tag:el.tagName,id:el.id||"",role:el.getAttribute("role")||"",ariaLabel:(el.getAttribute("aria-label")||"").slice(0,220),text:(el.innerText||el.value||"").trim().slice(0,220)})))()`;
	const items = (await cdpCall("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutOf(payload)))?.result?.value || [];
	return { ok:true, action:"chromeAccessibilitySnapshot", count:items.length, items };
}

async function chromeTestUrl(payload = {}) {
	const readiness = await legacyReady(payload);
	if (payload.clearLogs !== false) readChromeLogs({ clear:true });
	const startedAt = Date.now();
	const navigation = await navigateAndWait(payload.url || "about:blank", timeoutOf(payload), readiness.port, chromeActions.targetOptions(payload));
	const selectorFound = await waitForSelector(payload);
	if (payload.waitMs) await new Promise(resolve => setTimeout(resolve, Math.min(Number(payload.waitMs), 30000)));
	const snapshot = payload.snapshot === false ? null : await pageSnapshot({ ...payload, maxText:Math.min(Number(payload.maxText || 2500), 8000) });
	const logRead = readChromeLogs({ maxLogs:payload.maxLogs || 120 });
	const fresh = logRead.logs.filter(entry => eventTimestamp(entry) >= startedAt);
	const errors = fresh.filter(isChromeError);
	return {
		ok:navigation.ok !== false && selectorFound && (!payload.assertNoConsoleErrors || errors.length === 0),
		action:"chromeTestUrl",
		url:payload.url || "about:blank",
		navigation,
		selector:payload.selector || "",
		selectorFound,
		errorCount:errors.length,
		errors:compactLogs({ ...logRead, logs:errors }, 40),
		snapshot:snapshot ? valueSummary(snapshot, Number(payload.maxSnapshotChars || 12000)) : null,
		logs:compactLogs({ ...logRead, logs:fresh }, payload.maxLogs || 80)
	};
}

async function chromeDoctor(payload = {}) {
	const report = { ok:true, action:payload.action || "chromeDoctor", checks:{} };
	if (payload.url) report.checks.navigation = await chromeTestUrl({ ...payload, snapshot:payload.snapshot !== false });
	report.checks.network = await chromeNetwork({ ...payload, failedOnly:payload.failedOnly !== false });
	report.checks.accessibility = payload.accessibility === false ? null : await safe(() => chromeAccessibilitySnapshot(payload));
	report.checks.screenshot = payload.screenshot === false ? null : await safe(() => chromeActions.chromeScreenshot(payload));
	const logRead = readChromeLogs({ maxLogs:payload.maxLogs || 200 });
	const errors = logRead.logs.filter(isChromeError);
	report.logs = compactLogs(logRead, payload.maxLogs || 100);
	report.errors = compactLogs({ ...logRead, logs:errors }, 50);
	report.errorCount = errors.length;
	report.ok = Object.values(report.checks).every(check => !check || check.ok !== false) && (!payload.assertNoConsoleErrors || errors.length === 0);
	return report;
}

async function waitForSelector(payload) {
	if (!payload.selector) return true;
	const deadline = Date.now() + timeoutOf({ timeoutMs:payload.selectorTimeoutMs || payload.timeoutMs }, 10000);
	while (Date.now() < deadline) {
		const seen = await cdpCall("Runtime.evaluate", { expression:`!!document.querySelector(${JSON.stringify(payload.selector)})`, returnByValue:true }, 5000);
		if (seen.result?.value) return true;
		await new Promise(resolve => setTimeout(resolve, 250));
	}
	return false;
}

function eventTimestamp(entry = {}) { const value = Number(entry.details?.timestamp); if (Number.isFinite(value) && value > 0) return value > 1e12 ? value : value > 1e9 ? value * 1000 : Number(entry.ts || 0); return Number(entry.ts || 0); }
function isChromeError(entry = {}) { return String(entry.level || "").toLowerCase() === "error" || /exception/i.test(String(entry.source || "")); }
async function safe(fn) { try { return await fn(); } catch (error) { return { ok:false, error:error.message }; } }

module.exports = { chromeNetwork, chromeAccessibilitySnapshot, chromeTestUrl, chromeDoctor, eventTimestamp, isChromeError };
