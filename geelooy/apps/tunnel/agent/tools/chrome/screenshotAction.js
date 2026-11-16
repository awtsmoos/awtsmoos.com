// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const { captureCurrentScreenshot } = require("./screenshotArtifact.js");
const { chromeConfig, readCompactLogs } = require("./actionContext.js");

/**
 * @file Honest browser screenshots without an unbound-target health deadlock.
 * @description The Awtsmoos first joins the exact living page to its witness;
 * no second reconnection may tear that page from the moment of creation.
 * Chrome's actual PNG becomes a hash-bound artifact, never inline JSON base64.
 */

/**
 * Capture first: captureCurrentScreenshot binds and validates a target itself.
 * A preliminary health probe could reconnect a different target, wasting 30s.
 * @param {object} payload - Authenticated Chrome tool request.
 * @param {object} deps - Test-only action dependencies.
 * @returns {Promise<object>} Bounded screenshot receipt or actionable failure.
 */
async function chromeScreenshot(payload = {}, deps = {}) {
	const config = deps.chromeConfig || chromeConfig;
	const capture = deps.capture || captureCurrentScreenshot;
	const readLogs = deps.readLogs || readCompactLogs;
	const { blocked, port } = config(payload, "chromeScreenshot");
	if (blocked) return blocked;
	const started = Date.now();
	try {
		const result = await capture({
			...payload,
			port,
			timeoutMs: Math.min(12000, Number(payload.timeoutMs) || 8000)
		});
		return {
			...result,
			captureMs: Date.now() - started,
			transport: "binary-transfer-descriptor",
			logs: payload.diagnostics === true ? readLogs(payload) : []
		};
	} catch (error) {
		return {
			ok: false,
			action: "chromeScreenshot",
			error: "chrome_screenshot_failed",
			stage: "target_or_capture",
			detail: String(error?.message || error).slice(0, 320),
			captureMs: Date.now() - started,
			logs: payload.diagnostics === true ? readLogs(payload) : []
		};
	}
}

module.exports = { chromeScreenshot };
