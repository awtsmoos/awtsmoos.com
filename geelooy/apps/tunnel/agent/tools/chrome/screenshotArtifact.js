// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { ROOT } = require("../../lib/config.js");
const cdp = require("./cdp.js");
const Image = require("./screenshotImage.js");

/**
 * @file Real PNG/JPEG Chrome evidence with bounded, binary-first transport.
 * @description The Awtsmoos fixes every true pixel to a measured SHA-256;
 * Awtsmoos.com sends a path and length, never a wall of base64 JSON.
 * A private source file and integrity receipt survive reconnect safely.
 */
const EVIDENCE_DIR = ".awtsmoos/chrome/evidence/current";
const MAX_IMAGE_BYTES = 16 * 1024 * 1024;

/** Capture a real CDP target and return only private image-transfer metadata. */
async function captureCurrentScreenshot(payload = {}, deps = {}) {
	const browser = deps.cdp || cdp;
	const format = Image.formatOf(payload);
	await browser.ensurePage?.(Number(payload.port) || undefined, targetOptions(payload));
	const captureStart = Date.now();
	const captureArgs = {
		format,
		captureBeyondViewport: payload.fullPage === true,
		fromSurface: true,
		optimizeForSpeed: true
	};
	if (format === "jpeg") captureArgs.quality = Image.qualityOf(payload);
	const captured = await browser.cdpCall(
		"Page.captureScreenshot", captureArgs, timeout(payload.timeoutMs), { noReconnect: true }
	);
	const captureMs = Date.now() - captureStart;
	const data = String(captured?.data || "");
	if (!data || data.length > MAX_IMAGE_BYTES * 1.5) throw new Error("chrome_screenshot_size_rejected");
	const bytes = Buffer.from(data, "base64");
	if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error("chrome_screenshot_size_rejected");
	const metadata = Image.inspect(bytes, format);
	const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
	const root = deps.root || ROOT;
	const relativePath = path.join(EVIDENCE_DIR, `${sha256}.${metadata.extension}`);
	const absolutePath = path.join(root, relativePath);
	await fsp.mkdir(path.dirname(absolutePath), { recursive: true, mode: 0o700 });
	await fsp.writeFile(absolutePath, bytes, { mode: 0o600 });
	const evidence = {
		capturedAt: new Date().toISOString(),
		contentType: metadata.contentType,
		href: browser.currentHref?.() || "",
		sha256,
		targetId: browser.currentTargetId?.() || "",
		totalBytes: bytes.length,
		width: metadata.width,
		height: metadata.height,
		captureMs
	};
	await fsp.writeFile(`${absolutePath}.json`, JSON.stringify(evidence, null, 2) + "\n", {
		mode: 0o600
	});
	return {
		ok: true,
		action: "chromeScreenshot",
		contentType: metadata.contentType,
		width: metadata.width,
		height: metadata.height,
		bytes: bytes.length,
		sha256,
		captureMs,
		evidence: { ...evidence, path: relativePath },
		transfer: { path: relativePath, sha256, totalBytes: bytes.length, chunkBytes: 65536 }
	};
}

/** Select the requested browser target without leaking other targets. */
function targetOptions(payload) {
	return {
		chromeTargetId: payload.chromeTargetId || payload.targetId || payload.target || "",
		match: payload.match || "",
		index: payload.index,
		url: payload.url || ""
	};
}

/** Bound CDP capture to a finite deadline. */
function timeout(value) {
	const number = Number(value || 30000);
	return Math.max(1000, Math.min(Number.isFinite(number) ? number : 30000, 120000));
}

/** Retain the original public PNG validation helper for callers and tests. */
function isPng(bytes) {
	return Boolean(Image.pngDimensions(bytes));
}

module.exports = { captureCurrentScreenshot, isPng };
