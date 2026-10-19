// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lifecycleActions.js
 * @description Owns Chrome discovery, launch readiness, reuse, persistence, and agent-owned shutdown.
 * The Awtsmoos opens one browser vessel without stealing another process;
 * Awtsmoos.com binds only the Chrome it owns and preserves every lease boundary.
 */

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const { ROOT, loadConfig, saveConfigPatch } = require("../../lib/config.js");
const { findChrome, chromeFindDetails } = require("./finder.js");
const { boolish, chromeLaunchArgs, safeLaunchUrl } = require("./launchArgs.js");
const { addChromeLog } = require("./logs.js");
const ChromeProcesses = require("./processes.js");
const {
	cdp, param, readCompactLogs, targetOptions, timeoutOf, urlOf
} = require("./actionContext.js");

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function chromeFind() {
	return { ok:true, action:"chromeFind", ...chromeFindDetails() };
}

async function waitForChromePage(port, options = {}) {
	const timeoutMs = timeoutOf(options, 15000);
	const startedAt = Date.now();
	const url = safeLaunchUrl(options.url);
	let lastError = null;
	while (Date.now() - startedAt < timeoutMs) {
		try {
			await cdp.ensurePage(port, {
				...targetOptions(options), forceReconnect:true,
				createNewIfUnbound:true, url, preferUrl:url,
				timeoutMs:Math.min(3000, timeoutMs)
			});
			const targetId = cdp.currentTargetId();
			cdp.markManagedTarget(targetId);
			const navigation = await cdp.navigateAndWait(url, Math.max(1000, timeoutMs - (Date.now() - startedAt)), port, {
				...targetOptions(options), chromeTargetId:targetId, force:true
			});
			if (navigation.ok) return navigation;
			lastError = new Error(navigation.error || navigation.readyState || "launch_navigation_not_ready");
		} catch (error) { lastError = error; }
		await wait(100);
	}
	const error = new Error(`chrome_startup_timeout:${port}:${lastError?.message || "devtools_not_ready"}`);
	error.code = "CHROME_STARTUP_TIMEOUT";
	throw error;
}

async function chromeLaunch(payload = {}) {
	const config = loadConfig();
	if (!config.chrome.enabled || !config.tools.chrome) return { ok:false, action:"chromeLaunch", error:"chrome_disabled" };
	const port = Number(param(payload, "port", config.chrome.port || 9222));
	const chromePath = param(payload, "chromePath", config.chrome.path || findChrome());
	if (!chromePath) return { ok:false, action:"chromeLaunch", error:"chrome_not_found", ...chromeFindDetails() };
	const userDataDir = param(payload, "userDataDir", config.chrome.userDataDir || path.join(ROOT, "chrome-profile"));
	const headless = boolish(param(payload, "headless", undefined), boolish(config.chrome.headless, false));
	const url = urlOf(payload, "about:blank");
	const effectiveUrl = safeLaunchUrl(url);
	const persist = param(payload, "persist", true) !== false;
	fs.mkdirSync(userDataDir, { recursive:true, mode:0o700 });
	try { fs.chmodSync(userDataDir, 0o700); } catch {}
	const existing = await cdp.version(port).then(() => true, () => false);
	if (existing) return reuseExisting({ payload, config, port, chromePath, userDataDir, headless, url, effectiveUrl, persist });
	const attempts = Math.max(1, Math.min(3, Number(param(payload, "launchAttempts", 2)) || 2));
	let lastError = null;
	for (let attempt = 1; attempt <= attempts; attempt++) {
		const proc = childProcess.spawn(chromePath, chromeLaunchArgs({ port, userDataDir, headless, url }), { detached:true, stdio:"ignore" });
		proc.on("error", error => addChromeLog("process", "error", error.message, { stack:error.stack, attempt, attempts }));
		proc.unref();
		ChromeProcesses.register({ pid:proc.pid, port, userDataDir });
		await wait(Math.min(Number(param(payload, "startupWaitMs", 250)), 1000));
		try {
			const navigation = await waitForChromePage(port, { ...payload, url:effectiveUrl, timeoutMs:timeoutOf(payload, 15000) });
			if (persist) saveChrome(config, chromePath, port, userDataDir, headless);
			return { ok:true, action:"chromeLaunch", port, pid:proc.pid, chromePath, userDataDir, headless, url, effectiveUrl, chromeTargetId:navigation.chromeTargetId, navigation, launchAttempt:attempt, logs:readCompactLogs(payload) };
		} catch (error) {
			lastError = error;
			if (param(payload, "cleanupOnFailure", true) !== false) await ChromeProcesses.stopOwned({ port, pid:proc.pid, force:true }).catch(() => {});
			if (attempt < attempts) await wait(250);
		}
	}
	throw lastError;
}

async function reuseExisting({ payload, config, port, chromePath, userDataDir, headless, url, effectiveUrl, persist }) {
	const owned = ChromeProcesses.snapshot().find(record => record.port === port && path.resolve(record.userDataDir) === path.resolve(userDataDir));
	if (!owned) return { ok:false, action:"chromeLaunch", error:"chrome_port_in_use_unowned", port, userDataDir };
	if (!boolish(param(payload, "reuseExisting", true), true)) return { ok:false, action:"chromeLaunch", error:"chrome_port_already_in_use", port, pid:owned.pid };
	const target = await cdp.newPage(port, effectiveUrl);
	cdp.leaseTarget(target.id, targetOptions(payload));
	const navigation = await cdp.navigateAndWait(effectiveUrl, timeoutOf(payload, 15000), port, { ...targetOptions(payload), chromeTargetId:target.id, force:true });
	if (persist && navigation.ok) saveChrome(config, chromePath, port, userDataDir, headless);
	return { ok:navigation.ok === true, action:"chromeLaunch", port, pid:owned.pid, chromePath, userDataDir, headless, reusedExisting:true, url, effectiveUrl, chromeTargetId:target.id, navigation, logs:readCompactLogs(payload) };
}

function saveChrome(config, chromePath, port, userDataDir, headless) {
	saveConfigPatch({ chrome:{ ...config.chrome, enabled:true, path:chromePath, chromePath, port, userDataDir, headless }, tools:{ chrome:true } });
}

async function chromeStop(payload = {}) {
	cdp.closeCurrent("Chrome stop requested.");
	return ChromeProcesses.stopOwned(payload);
}

module.exports = { chromeFind, chromeLaunch, chromeStop, waitForChromePage };
