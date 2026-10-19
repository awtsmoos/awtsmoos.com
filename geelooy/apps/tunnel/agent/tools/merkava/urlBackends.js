// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file urlBackends.js
 * @description Renders one URL through honest Chrome or honest software fallback while preserving the actual engine used.
 * The Awtsmoos lets browser truth remain browser truth and painted HTML remain painted HTML;
 * Awtsmoos.com never hides the engine beneath the image.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");
const { pathToFileURL } = require("url");
const SelfContained = require("../../lib/selfContained.js");

const MAX_HTML_BYTES = 5 * 1024 * 1024;
let chromeModulePromise = null;
let rendererPromise = null;
let rootPromise = null;

async function chromeUrlPng(url, options) {
	const module = await chromeModule().catch(error => ({ error }));
	if (module.error) return failed("chrome-headless", "merkava_chrome_module_unavailable", module.error);
	const chrome = module.findChromeExecutable();
	if (!chrome) return failed("chrome-headless", "chrome_not_found");
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "merkava-chrome-"));
	const pngPath = path.join(directory, "shot.png");
	const args = [
		"--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
		`--window-size=${options.width},${options.height}`,
		`--screenshot=${pngPath}`,
		url
	];
	const run = spawnSync(chrome, args, { encoding:"utf8", timeout:options.timeoutMs });
	if (!run || run.status !== 0 || !fs.existsSync(pngPath)) {
		return { ...failed("chrome-headless", "chrome_url_screenshot_failed"), status:run?.status ?? null, stderr:String(run?.stderr || "").slice(0, 500) };
	}
	return { ok:true, engine:"chrome-headless", png:fs.readFileSync(pngPath), proof:{ renderer:"chrome-headless-new", target:url } };
}

async function softwareUrlPng(url, options) {
	const fetched = await fetchHtml(url, options.timeoutMs);
	if (!fetched.ok) return { ...fetched, engine:"merkava-software" };
	const renderer = await virtualRenderer().catch(error => ({ error }));
	if (renderer.error) return failed("merkava-software", "merkava_renderer_unavailable", renderer.error);
	const image = renderer.renderVirtualSnapshotPng({ html:fetched.html }, { width:options.width, height:options.height });
	const png = Buffer.from(String(image.dataUrl || "").split(",")[1] || "", "base64");
	return { ok:true, engine:"merkava-software", png, note:image.note || null, proof:image.proof || null };
}

async function fetchHtml(url, timeoutMs) {
	if (!/^https?:\/\//i.test(url)) return { ok:false, error:"screenshot_url_protocol_unsupported" };
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), Math.min(30000, Math.max(5000, timeoutMs || 30000)));
	try {
		const response = await fetch(url, { signal:controller.signal, headers:{ accept:"text/html,application/xhtml+xml;q=0.9,*/*;q=0.1" } });
		if (!response.ok) return { ok:false, error:"screenshot_url_http_error", status:response.status };
		const declared = Number(response.headers.get("content-length") || 0);
		if (declared > MAX_HTML_BYTES) return { ok:false, error:"screenshot_url_response_too_large" };
		const html = await response.text();
		if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) return { ok:false, error:"screenshot_url_response_too_large" };
		return { ok:true, html };
	} catch (error) {
		return { ok:false, error:"screenshot_url_fetch_failed", message:error?.message || String(error) };
	} finally { clearTimeout(timer); }
}

async function serviceUrl(relativePath) {
	if (!rootPromise) rootPromise = SelfContained.ensureBundle("merkava");
	const root = await rootPromise;
	return pathToFileURL(path.resolve(root, "scripts/awtsmoos/MerkavaExecutor/merkava-service", relativePath)).href;
}

async function chromeModule() {
	if (!chromeModulePromise) chromeModulePromise = import(await serviceUrl("snapshots/chromeScreenshot.js"));
	return chromeModulePromise;
}

async function virtualRenderer() {
	if (!rendererPromise) rendererPromise = import(await serviceUrl("snapshots/virtualPngRenderer.js"));
	return rendererPromise;
}

function failed(engine, error, cause) {
	return { ok:false, engine, error, message:cause?.message || (cause ? String(cause) : "") };
}

module.exports = { chromeUrlPng, softwareUrlPng };
