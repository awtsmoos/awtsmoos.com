// B"H
// Boruch Hashem
// Blessed is He

'use strict';

/**
 * merkavaScreenshotActions.js — tunnel action group for MERKAVA URL screenshots.
 *
 * Registers a simple "screenshot this URL" action backed by the MERKAVA SDK
 * (geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service):
 *
 *   merkavaScreenshotUrl   screenshot any http(s) URL -> real PNG
 *   screenshot_url         alias of merkavaScreenshotUrl (same payload)
 *
 * Payload: { url (REQUIRED), width, height, timeoutMs, backend, options }
 *   backend: "auto" (default) | "chrome" | "merkava"
 *     - "auto":    real Chrome headless renders the URL; falls back to
 *                   fetching the HTML and painting it with the MERKAVA
 *                   software renderer when Chrome is unavailable.
 *     - "chrome":  real Chrome headless only; fails closed without Chrome.
 *     - "merkava": fetch HTML + MERKAVA software renderer only.
 *
 * Returns: { ok, action, backend, url, width, height, bytes, sha256,
 *            mimeType, pngPath, dataUrl, proof, fallbackReason }
 *
 * Sibling modules are required DEFENSIVELY (house pattern): the MERKAVA
 * service is ESM, so it is loaded with dynamic import(). Every failure is a
 * fail-closed result object, never a thrown exception and never a fake image.
 *
 * Registration follows the build*Actions(ctx) convention used by the other
 * agent/tools/fs/actionGroups modules: the builder destructures
 * { config, payload } and returns a map of action names to zero-argument
 * async handlers closing over them.
 */

const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const { pathToFileURL } = require("url");

const MAX_HTML_BYTES = 5 * 1024 * 1024;
const MIN_TIMEOUT_MS = 5000;
const MAX_TIMEOUT_MS = 120000;

let chromeScreenshotPromise = null;
let virtualRendererPromise = null;

/** File URL of one MERKAVA service module, resolved from this file's home. */
function serviceModuleUrl(relativePath) {
	return pathToFileURL(
		path.resolve(
			__dirname,
			"../../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-service",
			relativePath
		)
	).href;
}

async function loadChromeScreenshot() {
	if (!chromeScreenshotPromise) {
		chromeScreenshotPromise = import(serviceModuleUrl("snapshots/chromeScreenshot.js"));
	}
	return await chromeScreenshotPromise;
}

async function loadVirtualRenderer() {
	if (!virtualRendererPromise) {
		virtualRendererPromise = import(serviceModuleUrl("snapshots/virtualPngRenderer.js"));
	}
	return await virtualRendererPromise;
}

function clampInt(value, min, max, fallback) {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, Math.floor(n)));
}

function optionsFromPayload(payload = {}) {
	const nested = (payload.options && typeof payload.options === "object") ? payload.options : {};
	const pick = (key, fallback) => {
		if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") return payload[key];
		if (nested[key] !== undefined && nested[key] !== null && nested[key] !== "") return nested[key];
		return fallback;
	};
	return {
		url: String(pick("url", "")).trim(),
		width: clampInt(pick("width", pick("viewportWidth", 1280)), 320, 3840, 1280),
		height: clampInt(pick("height", pick("viewportHeight", 800)), 240, 2160, 800),
		timeoutMs: clampInt(pick("timeoutMs", 30000), MIN_TIMEOUT_MS, MAX_TIMEOUT_MS, 30000),
		backend: String(pick("backend", "auto")).toLowerCase()
	};
}

function sha256Hex(buffer) {
	return crypto.createHash("sha256").update(buffer).digest("hex");
}

function writeEvidencePng(png, tag) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "merkava-url-shot-"));
	const pngPath = path.join(dir, `${tag || "shot"}.png`);
	fs.writeFileSync(pngPath, png);
	return pngPath;
}

/**
 * Real Chrome headless renders the URL directly. Best fidelity: the actual
 * page, actual layout, actual pixels.
 */
async function chromeHeadlessUrlShot(url, { width, height, timeoutMs }) {
	let chromeModule;
	try {
		chromeModule = await loadChromeScreenshot();
	} catch (error) {
		return { ok: false, backend: "chrome-headless", error: "merkava_chrome_module_unavailable", message: String((error && error.message) || error) };
	}
	const chrome = chromeModule.findChromeExecutable();
	if (!chrome) {
		return { ok: false, backend: "chrome-headless", error: "chrome_not_found" };
	}
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "merkava-url-shot-"));
	const pngPath = path.join(dir, "shot.png");
	const args = [
		"--headless=new",
		"--disable-gpu",
		"--no-sandbox",
		"--hide-scrollbars",
		`--window-size=${width},${height}`,
		`--screenshot=${pngPath}`,
		url
	];
	let run;
	try {
		run = spawnSync(chrome, args, { encoding: "utf8", timeout: timeoutMs });
	} catch (error) {
		return { ok: false, backend: "chrome-headless", error: "chrome_spawn_failed", message: String((error && error.message) || error) };
	}
	if (!run || run.status !== 0 || !fs.existsSync(pngPath)) {
		return {
			ok: false,
			backend: "chrome-headless",
			error: "chrome_url_screenshot_failed",
			status: run ? run.status : null,
			stderr: run && run.stderr ? String(run.stderr).slice(0, 500) : ""
		};
	}
	const png = fs.readFileSync(pngPath);
	return {
		ok: true,
		backend: "chrome-headless",
		chrome,
		width,
		height,
		bytes: png.length,
		sha256: sha256Hex(png),
		mimeType: "image/png",
		pngPath,
		dataUrl: "data:image/png;base64," + png.toString("base64"),
		proof: { renderer: "chrome-headless-new", target: url }
	};
}

async function fetchPageHtml(url, timeoutMs) {
	if (!/^https?:\/\//i.test(url)) {
		return { ok: false, error: "screenshot_url_protocol_unsupported", url };
	}
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), Math.min(30000, Math.max(5000, Number(timeoutMs || 30000))));
	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: { accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1" }
		});
		if (!response.ok) {
			return { ok: false, error: "screenshot_url_http_error", status: response.status, url };
		}
		const declared = Number(response.headers.get("content-length") || 0);
		if (declared > MAX_HTML_BYTES) {
			return { ok: false, error: "screenshot_url_response_too_large", url };
		}
		const html = await response.text();
		if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
			return { ok: false, error: "screenshot_url_response_too_large", url };
		}
		return { ok: true, html };
	} catch (error) {
		return { ok: false, error: "screenshot_url_fetch_failed", message: String((error && error.message) || error), url };
	} finally {
		clearTimeout(timer);
	}
}

/**
 * MERKAVA software renderer paints the fetched HTML into a PNG without any
 * browser. Honest fallback: proof metadata says exactly what rendered it.
 */
async function merkavaSoftwareShot(url, { width, height, timeoutMs }) {
	const fetched = await fetchPageHtml(url, timeoutMs);
	if (!fetched.ok) return { ...fetched, backend: "merkava-software" };
	let renderer;
	try {
		renderer = await loadVirtualRenderer();
	} catch (error) {
		return { ok: false, backend: "merkava-software", error: "merkava_renderer_unavailable", message: String((error && error.message) || error) };
	}
	const image = renderer.renderVirtualSnapshotPng({ html: fetched.html }, { width, height });
	const png = Buffer.from(String(image.dataUrl || "").split(",")[1] || "", "base64");
	const pngPath = writeEvidencePng(png, "merkava");
	return {
		ok: true,
		backend: "merkava-software",
		width: image.width || width,
		height: image.height || height,
		bytes: png.length,
		sha256: sha256Hex(png),
		mimeType: "image/png",
		pngPath,
		dataUrl: image.dataUrl,
		note: image.note || null,
		proof: image.proof || null,
		fallbackReason: "chrome_unavailable_or_failed"
	};
}

async function merkavaScreenshotUrl(payload, actionName) {
	const options = optionsFromPayload(payload);
	if (!options.url) {
		return { ok: false, action: actionName, error: "screenshot_url_required" };
	}
	const backend = options.backend;
	const shotOptions = { width: options.width, height: options.height, timeoutMs: options.timeoutMs };

	if (backend === "chrome") {
		const shot = await chromeHeadlessUrlShot(options.url, shotOptions);
		return { ...shot, action: actionName, url: options.url };
	}
	if (backend === "merkava") {
		const shot = await merkavaSoftwareShot(options.url, shotOptions);
		return { ...shot, action: actionName, url: options.url };
	}
	// "auto": real Chrome first, MERKAVA software fallback.
	const chromeShot = await chromeHeadlessUrlShot(options.url, shotOptions);
	if (chromeShot.ok) {
		return { ...chromeShot, action: actionName, url: options.url };
	}
	const fallback = await merkavaSoftwareShot(options.url, shotOptions);
	return {
		...fallback,
		action: actionName,
		url: options.url,
		fallbackReason: chromeShot.error || "chrome_failed"
	};
}

/**
 * Build the tunnel action surface for MERKAVA URL screenshots.
 * @param {object} ctx - Action context; destructured as { config, payload }.
 * @returns {{merkavaScreenshotUrl:function,screenshot_url:function}}
 */
function buildMerkavaScreenshotActions(ctx) {
	const payload = (ctx && ctx.payload) || {};
	const run = async (actionName) => {
		try {
			return await merkavaScreenshotUrl(payload, actionName);
		} catch (error) {
			return {
				ok: false,
				action: actionName,
				error: "merkava_screenshot_failed",
				message: String((error && error.message) || error)
			};
		}
	};
	const handler = async () => run("merkavaScreenshotUrl");
	const aliasHandler = async () => run("screenshot_url");
	return {
		merkavaScreenshotUrl: handler,
		screenshot_url: aliasHandler
	};
}

module.exports = {
	buildMerkavaScreenshotActions
};
