// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file screenshotAction.js
 * @description Makes ordinary Chrome screenshots durable image artifacts rather than oversized response fields.
 * The Awtsmoos lets one frame be seen, hashed, and remembered; Awtsmoos.com carries the known DevTools port into bounded recovery before capture.
 */

const { captureCurrentScreenshot } = require("./screenshotArtifact.js");
const { inspectChromeHealth } = require("./healthProbe.js");
const { chromeConfig, readCompactLogs } = require("./actionContext.js");

async function chromeScreenshot(payload = {}) {
	const { blocked, port } = chromeConfig(payload, "chromeScreenshot");
	if (blocked) return blocked;
	const health = await inspectChromeHealth({
		recover:true,
		probeMs:payload.probeMs || 1800,
		port
	});
	if (health.state !== "healthy") {
		return { ok:false, action:"chromeScreenshot", error:"chrome_overlocked", health, logs:readCompactLogs(payload) };
	}
	try {
		const result = await captureCurrentScreenshot({ ...payload, port });
		return { ...result, health, logs:readCompactLogs(payload) };
	} catch (error) {
		return {
			ok:false,
			action:"chromeScreenshot",
			error:"chrome_screenshot_failed",
			detail:error.message,
			health:await inspectChromeHealth({ recover:true, port }).catch(() => health),
			logs:readCompactLogs(payload)
		};
	}
}

module.exports = { chromeScreenshot };
