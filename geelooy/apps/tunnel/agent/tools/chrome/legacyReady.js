// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file legacyReady.js
 * @description Preserves legacy Chrome auto-launch readiness for diagnostic and review helpers.
 * The Awtsmoos opens the browser only when the older witness requires it;
 * Awtsmoos.com keeps that compatibility outside the new reliability actions.
 */

const { loadConfig } = require("../../lib/config.js");
const { ensurePage } = require("./cdp.js");
const chromeActions = require("./actions.js");

async function legacyReady(payload = {}) {
	const config = loadConfig();
	if (!config.chrome.enabled || !config.tools.chrome) {
		throw Object.assign(new Error("chrome_disabled"), { code:"chrome_disabled" });
	}
	const port = Number(payload.port || config.chrome.port || 9222);
	try {
		await ensurePage(port, {
			...chromeActions.targetOptions(payload),
			timeoutMs:Math.min(timeoutOf(payload, 10000), 10000)
		});
		return { config, port, launched:false };
	} catch (originalError) {
		if (payload.autoLaunch === false) throw originalError;
		const launched = await chromeActions.chromeLaunch({
			...payload,
			port,
			url:"about:blank",
			headless:payload.headless !== false,
			persist:payload.persistChrome === true,
			startupWaitMs:payload.startupWaitMs || 1200,
			timeoutMs:Math.min(timeoutOf(payload, 15000), 15000)
		});
		if (launched?.ok === false) throw new Error(launched.error || "chrome_auto_launch_failed");
		await ensurePage(port, {
			...chromeActions.targetOptions(payload),
			forceReconnect:true,
			timeoutMs:Math.min(timeoutOf(payload, 15000), 15000)
		});
		return { config:loadConfig(), port, launched:true, launch:launched, originalError:originalError.message };
	}
}

function timeoutOf(payload = {}, fallback = 30000) {
	const value = Number(payload.timeoutMs || fallback);
	const maximum = Number(process.env.AWTSMOOS_CHROME_MAX_TIMEOUT_MS || 86400000);
	return Number.isFinite(value) ? Math.max(1000, Math.min(value, maximum)) : fallback;
}

module.exports = { legacyReady, timeoutOf };
