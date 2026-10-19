// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file legacyScreenshot.js
 * @description Preserves inline/review screenshot provenance while ordinary screenshots use artifact-first delivery.
 * The Awtsmoos lets old review callers keep their familiar scroll;
 * Awtsmoos.com writes hash-bound provenance whenever those pixels persist to disk.
 */

const crypto = require("crypto");
const fsp = require("fs/promises");
const path = require("path");
const configModule = require("../../lib/config.js");
const defaultCdp = require("./cdp.js");

function createLegacyScreenshot(deps = {}) {
	const cdp = deps.cdp || defaultCdp;
	const root = deps.root || configModule.ROOT;
	return async function chromeScreenshot(payload = {}) {
		try {
			await deps.ready?.(payload);
			const timeoutMs = timeoutOf(payload, 15000);
			await cdp.cdpCall("Page.bringToFront", {}, Math.min(timeoutMs, 5000));
			const provenance = await readProvenance(cdp, timeoutMs);
			const result = await cdp.cdpCall("Page.captureScreenshot", {
				format:payload.format || "png",
				fromSurface:true,
				captureBeyondViewport:payload.fullPage === true
			}, timeoutMs);
			const content64 = result.data || "";
			const bytes = Buffer.from(content64, "base64");
			const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
			const persisted = await persist(root, payload, bytes, sha256, provenance);
			return {
				ok:true,
				action:"chromeScreenshot",
				format:payload.format || "png",
				bytes:bytes.length,
				savedPath:persisted.savedPath,
				content64:payload.inline === true ? content64 : "",
				evidence:{ ...provenance, ...persisted, sha256, bytes:bytes.length, inline:payload.inline === true }
			};
		} catch (error) {
			return { ok:false, action:"chromeScreenshot", error:"chrome_screenshot_failed", detail:error.message, retryable:true };
		}
	};
}

async function readProvenance(cdp, timeoutMs) {
	const expression = `(()=>({url:location.href,width:innerWidth,height:innerHeight,deviceScaleFactor:devicePixelRatio||1}))()`;
	const value = (await cdp.cdpCall("Runtime.evaluate", { expression, returnByValue:true }, timeoutMs))?.result?.value || {};
	return {
		url:value.url || "",
		targetId:cdp.currentTargetId?.() || "",
		viewport:{ width:value.width || 0, height:value.height || 0, deviceScaleFactor:value.deviceScaleFactor || 1 },
		capturedAt:new Date().toISOString(),
		commitSha:null
	};
}

async function persist(root, payload, bytes, sha256, provenance) {
	if (!payload.path && payload.inline === true) return { savedPath:null, sidecarPath:null };
	const relative = String(payload.path || `.awtsmoos/chrome/screenshots/${Date.now().toString(36)}.${payload.format || "png"}`).replace(/^[/\\]+/, "");
	const savedPath = path.join(root, relative);
	const sidecarPath = savedPath.replace(/\.png$/i, ".sidecar.json");
	await fsp.mkdir(path.dirname(savedPath), { recursive:true });
	await fsp.writeFile(savedPath, bytes);
	await fsp.writeFile(sidecarPath, JSON.stringify({ pngPath:savedPath, sidecarPath, ...provenance, sha256, bytes:bytes.length }, null, 2) + "\n");
	return { savedPath, sidecarPath };
}

function timeoutOf(payload, fallback) {
	const value = Number(payload.timeoutMs || fallback);
	return Number.isFinite(value) ? Math.max(1000, Math.min(value, 15000)) : fallback;
}

module.exports = { createLegacyScreenshot, readProvenance };
