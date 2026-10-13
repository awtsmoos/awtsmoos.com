// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file _awtsmoos.derech.js
 * @description
 * Merkava page-run API. POST /api/merkava/run with {html|url, css, js,
 * viewport|device, actions} and get back {screenshot_png (base64),
 * console_logs, js_errors, final_dom_state, assertions, timings}.
 *
 * The software renderer executes no page JS (wiring the JS engine in is a
 * separate future task), so console_logs/js_errors are always empty — they
 * exist so the interface is stable when JS execution lands.
 *
 * Safety: per-IP rate limit, hard caps on input sizes, and a bounded
 * renderer timeout so one request cannot hold the server.
 */

const path = require("path");

const MAX_HTML = 2 * 1024 * 1024;
const MAX_CSS = 512 * 1024;
const MAX_JS = 512 * 1024;
const MAX_ACTIONS = 200;
const MAX_TIMEOUT_MS = 60000;
const DEFAULT_TIMEOUT_MS = 30000;

// B"H — simple per-IP rate limit: rendering is CPU work.
const rateBuckets = new Map();
function rateLimited(ip) {
	const now = Date.now();
	let bucket = rateBuckets.get(ip);
	if (!bucket || now > bucket.resetAt) {
		bucket = { count: 0, resetAt: now + 60000 };
		rateBuckets.set(ip, bucket);
	}
	bucket.count += 1;
	if (rateBuckets.size > 5000) rateBuckets.clear();
	return bucket.count > 20;
}

function cleanStr(v, limit) {
	return String(v == null ? "" : v).slice(0, limit);
}

function parseBody(post) {
	if (!post) return {};
	if (post.__raw_body__) {
		try { return JSON.parse(String(post.__raw_body__)); } catch (e) { return {}; }
	}
	return post;
}

let corePromise = null;
function loadCore() {
	if (!corePromise) {
		const corePath = path.join(
			process.env.__awtsdir || process.cwd(),
			"geelooy", "scripts", "awtsmoos", "MerkavaExecutor",
			"merkava-service", "merkavaCore.mjs"
		);
		corePromise = import("file://" + corePath);
	}
	return corePromise;
}

let jsCorePromise = null;
function loadJsCore() {
	if (!jsCorePromise) {
		const jsPath = path.join(
			process.env.__awtsdir || process.cwd(),
			"geelooy", "scripts", "awtsmoos", "MerkavaExecutor",
			"merkava-service", "merkavaJsCore.mjs"
		);
		jsCorePromise = import("file://" + jsPath);
	}
	return jsCorePromise;
}

async function crownMerkavaRoutes($i) {
	await $i.use({
		"/": async () => ({ ok: true, service: "Merkava page-run API", BH: 'B"H', version: "1.0.0" }),
		"/devices": async () => {
			const { VIEWPORT_PRESETS } = await loadCore();
			return { ok: true, devices: VIEWPORT_PRESETS };
		},
		// B"H — FLAGSHIP: execute page JS with the real Merkava VM and
		// instantly return runtime errors (console, uncaught exceptions with
		// file/line, failed loads). No browser needed.
		"/run-js": async () => {
			if ($i.request.method !== "POST") {
				return { ok: false, error: "use POST", status: 405 };
			}
			const ip = String(
				($i.request.headers && $i.request.headers["x-forwarded-for"]) ||
				($i.request.socket && $i.request.socket.remoteAddress) ||
				"unknown"
			).split(",")[0].trim();
			if (rateLimited(ip)) {
				return { ok: false, error: "rate_limited", status: 429 };
			}
			const body = parseBody($i.$_POST);
			const js = cleanStr(body.js, MAX_JS);
			const html = cleanStr(body.html, MAX_HTML);
			const url = cleanStr(body.url, 2000);
			if (!js && !html && !url) {
				return { ok: false, error: "need js, html, or url", status: 400 };
			}
			const timeoutMs = Math.min(
				Math.max(Number(body.timeoutMs) || DEFAULT_TIMEOUT_MS, 1000),
				MAX_TIMEOUT_MS
			);
			try {
				const { runJs } = await loadJsCore();
				const r = await runJs({
					js: js || undefined,
					html: html || undefined,
					url: url || undefined,
					file: cleanStr(body.file, 200) || undefined,
					maxSteps: Math.min(Number(body.maxSteps) || 50000, 500000),
					timeoutMs,
				});
				return {
					ok: r.ok,
					status: r.status,
					console_logs: r.consoleLogs,
					js_errors: r.jsErrors,
					scripts_run: r.scriptsRun,
					steps: r.steps,
					timings_ms: { total: r.wallMs },
					version: r.version,
				};
			} catch (e) {
				return { ok: false, error: String((e && e.message) || e).slice(0, 300), status: 500 };
			}
		},
		"/run": async () => {
			if ($i.request.method !== "POST") {
				return { ok: false, error: "use POST", status: 405 };
			}
			const ip = String(
				($i.request.headers && $i.request.headers["x-forwarded-for"]) ||
				($i.request.socket && $i.request.socket.remoteAddress) ||
				"unknown"
			).split(",")[0].trim();
			if (rateLimited(ip)) {
				return { ok: false, error: "rate_limited", status: 429 };
			}
			const body = parseBody($i.$_POST);
			const html = cleanStr(body.html, MAX_HTML);
			const url = cleanStr(body.url, 2000);
			if (!html && !url) {
				return { ok: false, error: "need html or url", status: 400 };
			}
			let actions = body.actions;
			if (typeof actions === "string" && actions.length > 4000) {
				return { ok: false, error: "actions too long", status: 400 };
			}
			if (Array.isArray(actions) && actions.length > MAX_ACTIONS) {
				return { ok: false, error: "too many actions", status: 400 };
			}
			const timeoutMs = Math.min(
				Math.max(Number(body.timeoutMs) || DEFAULT_TIMEOUT_MS, 1000),
				MAX_TIMEOUT_MS
			);
			try {
				const { runPage } = await loadCore();
				const r = await runPage({
					html: html || undefined,
					url: url || undefined,
					css: cleanStr(body.css, MAX_CSS) || undefined,
					js: cleanStr(body.js, MAX_JS) || undefined,
					device: cleanStr(body.device, 40) || undefined,
					viewport: cleanStr(body.viewport, 40) || undefined,
					actions,
					timeoutMs,
					pngLevel: 1,
				});
				// If JS was supplied (or execution requested), run it through
				// the real VM and return console + runtime errors too.
				let jsResult = null;
				if ((cleanStr(body.js, MAX_JS) || body.executeJs) && (html || url)) {
					try {
						const { runJs } = await loadJsCore();
						jsResult = await runJs({
							js: cleanStr(body.js, MAX_JS) || undefined,
							html: html || undefined,
							url: url || undefined,
							timeoutMs: Math.min(timeoutMs, 30000),
						});
					} catch (je) {
						jsResult = { ok: false, error: String((je && je.message) || je).slice(0, 200) };
					}
				}
				return {
					ok: r.ok && (!jsResult || jsResult.ok !== false || !jsResult.jsErrors),
					screenshot_png: r.png.toString("base64"),
					width: r.width,
					height: r.height,
					dpr: r.dpr,
					console_logs: jsResult ? jsResult.consoleLogs || [] : [],
					js_errors: jsResult ? jsResult.jsErrors || [] : [],
					js_status: jsResult ? jsResult.status : undefined,
					final_dom_state: r.finalDom,
					assertions: r.assertions,
					timings_ms: r.timingsMs,
					version: r.version,
				};
			} catch (e) {
				return { ok: false, error: String((e && e.message) || e).slice(0, 300), status: 500 };
			}
		},
	});
}

module.exports = {
	dynamicRoutes: crownMerkavaRoutes
};
