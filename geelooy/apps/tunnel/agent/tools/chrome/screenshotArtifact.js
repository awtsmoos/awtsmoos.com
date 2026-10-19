// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file screenshotArtifact.js
 * @description Captures the bound Chrome target into durable, hash-verified image evidence without bloating JSON with base64.
 * The Awtsmoos lets the same living page become visible testimony;
 * Awtsmoos.com preserves the pixels, their hash, and their provenance as one honest vessel.
 */

const crypto = require("crypto");
const fsp = require("fs/promises");
const path = require("path");
const { ROOT } = require("../../lib/config.js");
const cdp = require("./cdp.js");

const EVIDENCE_DIR = ".awtsmoos/chrome/evidence/current";
const PNG_MAGIC = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);

async function captureCurrentScreenshot(payload = {}, deps = {}) {
	const browser = deps.cdp || cdp;
	await browser.ensurePage?.(Number(payload.port) || undefined, targetOptions(payload));
	const result = await browser.cdpCall("Page.captureScreenshot", {
		format:"png",
		captureBeyondViewport:payload.fullPage === true,
		fromSurface:true
	}, timeout(payload.timeoutMs), { noReconnect:true });
	const bytes = Buffer.from(String(result?.data || ""), "base64");
	if (!isPng(bytes)) throw new Error("chrome_screenshot_invalid_png");
	const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
	const root = deps.root || ROOT;
	const relativePath = path.join(EVIDENCE_DIR, `${sha256}.png`);
	const absolutePath = path.join(root, relativePath);
	await fsp.mkdir(path.dirname(absolutePath), { recursive:true });
	await fsp.writeFile(absolutePath, bytes);
	const evidence = {
		capturedAt:new Date().toISOString(),
		contentType:"image/png",
		href:browser.currentHref?.() || "",
		sha256,
		targetId:browser.currentTargetId?.() || "",
		totalBytes:bytes.length
	};
	await fsp.writeFile(`${absolutePath}.json`, JSON.stringify(evidence, null, 2) + "\n");
	return {
		ok:true,
		action:"chromeScreenshot",
		contentType:"image/png",
		bytes:bytes.length,
		sha256,
		evidence:{ ...evidence, path:relativePath },
		transfer:{ path:relativePath, sha256, totalBytes:bytes.length, chunkBytes:65536 }
	};
}

function targetOptions(payload) {
	return {
		chromeTargetId:payload.chromeTargetId || payload.targetId || payload.target || "",
		match:payload.match || "",
		index:payload.index,
		url:payload.url || ""
	};
}

function timeout(value) {
	const number = Number(value || 30000);
	return Math.max(1000, Math.min(Number.isFinite(number) ? number : 30000, 120000));
}

function isPng(bytes) {
	return bytes.length > PNG_MAGIC.length && bytes.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC);
}

module.exports = { captureCurrentScreenshot, isPng };
