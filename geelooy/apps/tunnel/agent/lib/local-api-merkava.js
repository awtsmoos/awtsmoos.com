// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file local-api-merkava.js
 * @description
 * Local Merkava page-run endpoint for installed tunnels: POST /merkava/run
 * with {html|url, css, js, viewport|device, actions} runs the page through
 * Merkava's software renderer LOCALLY (no network round-trip) and returns
 * {screenshot_png (base64), console_logs, js_errors, final_dom_state,
 * assertions, timings} — the same shape as the live POST /api/merkava/run.
 *
 * Uses the self-contained "merkava-shot" runtime bundle (no repo needed).
 * The renderer executes no page JS; console_logs/js_errors are always empty
 * until the JS engine is wired in.
 */

const path = require("node:path");
const { pathToFileURL } = require("node:url");
const SelfContained = require("./selfContained.js");
const Response = require("./local-api-response.js");

const BUNDLE_FILE = "geelooy/apps/tunnel/downloads/merkava-shot/merkava-shot.bundle.cjs";
const MAX_TIMEOUT_MS = 60000;

let corePromise = null;
async function loadCore() {
	if (!corePromise) {
		corePromise = (async () => {
			const dir = await SelfContained.ensureBundle("merkava-shot");
			const file = path.join(dir, BUNDLE_FILE);
			const mod = await import(pathToFileURL(file).href);
			if (typeof mod.runPage !== "function") {
				throw new Error("merkava_bundle_missing_runPage");
			}
			return mod;
		})();
	}
	return corePromise;
}

let jsCorePromise = null;
async function loadJsCore() {
	// The standalone bundle re-exports the core; runJs lives in the bundle too.
	const mod = await loadCore();
	if (typeof mod.runJs !== "function") {
		throw new Error("merkava_bundle_missing_runJs");
	}
	return mod;
}

function cleanStr(v, limit) {
	return String(v == null ? "" : v).slice(0, limit);
}

async function merkavaRun(response, deps, body) {
	const b = body && typeof body === "object" ? body : {};
	const html = cleanStr(b.html, 2 * 1024 * 1024);
	const url = cleanStr(b.url, 2000);
	if (!html && !url) {
		return Response.endJson(response, 400, { ok: false, error: "need html or url" });
	}
	let actions = b.actions;
	if (typeof actions === "string" && actions.length > 4000) {
		return Response.endJson(response, 400, { ok: false, error: "actions too long" });
	}
	if (Array.isArray(actions) && actions.length > 200) {
		return Response.endJson(response, 400, { ok: false, error: "too many actions" });
	}
	const timeoutMs = Math.min(Math.max(Number(b.timeoutMs) || 30000, 1000), MAX_TIMEOUT_MS);
	try {
		const { runPage } = await loadCore();
		const r = await runPage({
			html: html || undefined,
			url: url || undefined,
			css: cleanStr(b.css, 512 * 1024) || undefined,
			js: cleanStr(b.js, 512 * 1024) || undefined,
			device: cleanStr(b.device, 40) || undefined,
			viewport: cleanStr(b.viewport, 40) || undefined,
			actions,
			timeoutMs,
			pngLevel: 1,
		});
		return Response.endJson(response, 200, {
			ok: r.ok,
			local: true,
			screenshot_png: r.png.toString("base64"),
			width: r.width,
			height: r.height,
			dpr: r.dpr,
			console_logs: r.consoleLogs,
			js_errors: r.jsErrors,
			final_dom_state: r.finalDom,
			assertions: r.assertions,
			timings_ms: r.timingsMs,
			version: r.version,
		});
	} catch (e) {
		return Response.endJson(response, 500, {
			ok: false,
			error: String((e && e.message) || e).slice(0, 300),
		});
	}
}

async function merkavaDevices(response) {
	try {
		const { VIEWPORT_PRESETS } = await loadCore();
		return Response.endJson(response, 200, { ok: true, local: true, devices: VIEWPORT_PRESETS });
	} catch (e) {
		return Response.endJson(response, 500, { ok: false, error: String((e && e.message) || e).slice(0, 200) });
	}
}

module.exports = { merkavaRun, merkavaDevices, merkavaRunJs };

async function merkavaRunJs(response, deps, body) {
	const b = body && typeof body === "object" ? body : {};
	const js = cleanStr(b.js, 512 * 1024);
	const html = cleanStr(b.html, 2 * 1024 * 1024);
	const url = cleanStr(b.url, 2000);
	if (!js && !html && !url) {
		return Response.endJson(response, 400, { ok: false, error: "need js, html, or url" });
	}
	const timeoutMs = Math.min(Math.max(Number(b.timeoutMs) || 30000, 1000), 60000);
	try {
		const { runJs } = await loadJsCore();
		const r = await runJs({
			js: js || undefined,
			html: html || undefined,
			url: url || undefined,
			file: cleanStr(b.file, 200) || undefined,
			maxSteps: Math.min(Number(b.maxSteps) || 50000, 500000),
			timeoutMs,
		});
		return Response.endJson(response, 200, {
			ok: r.ok,
			local: true,
			status: r.status,
			console_logs: r.consoleLogs,
			js_errors: r.jsErrors,
			scripts_run: r.scriptsRun,
			steps: r.steps,
			timings_ms: { total: r.wallMs },
			version: r.version,
		});
	} catch (e) {
		return Response.endJson(response, 500, {
			ok: false,
			error: String((e && e.message) || e).slice(0, 300),
		});
	}
}
