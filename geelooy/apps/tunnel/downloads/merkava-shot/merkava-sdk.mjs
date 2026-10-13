// B"H
/**
 * @file merkava-sdk.mjs
 * @description Agent-friendly Node SDK for Merkava page runs.
 *
 * Resolution order (first available wins):
 *   1. Local core — the standalone bundle next to this file (no network).
 *   2. Live API  — POST https://awtsmoos.com/api/merkava/run (nothing installed).
 *   3. CLI       — `merkava-shot` on PATH (spawns the standalone bundle).
 *
 * Usage:
 *   import { screenshot, runPage } from './merkava-sdk.mjs';
 *   const { png } = await screenshot('https://awtsmoos.com', { device: 'iphone14' });
 *   const r = await runPage({ html: '<h1>hi</h1>', actions: 'assert:visible:h1' });
 *   console.log(r.assertions); // [{op:'assert', ok:true, ...}]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const __dir = path.dirname(fileURLToPath(import.meta.url));

export const LIVE_API = process.env.MERKAVA_API || "https://awtsmoos.com/api/merkava";

let corePromise = null;
async function localCore() {
	if (!corePromise) {
		corePromise = (async () => {
			const candidates = [
				path.join(__dir, "merkava-shot.bundle.mjs"),
				path.join(process.env.HOME || "~", ".local", "bin", "merkava-shot.bundle.mjs"),
			];
			for (const f of candidates) {
				try {
					const mod = await import(pathToFileURL(f).href);
					if (typeof mod.runPage === "function") return mod;
				} catch { /* try next */ }
			}
			return null;
		})();
	}
	return corePromise;
}

async function viaLiveApi(opts, timeoutMs) {
	const res = await fetch(`${LIVE_API}/run`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...opts, timeoutMs }),
	});
	if (!res.ok) throw new Error(`live api HTTP ${res.status}`);
	const j = await res.json();
	if (!j.ok) throw new Error(`live api: ${j.error || "unknown"}`);
	return { ...j, png: Buffer.from(j.screenshot_png, "base64"), via: "live-api" };
}

async function viaCli(opts) {
	const args = [];
	if (opts.url) args.push("--url", opts.url);
	if (opts.html) args.push("--html", opts.html);
	if (opts.device) args.push("--device", opts.device);
	if (opts.viewport) args.push("--viewport", opts.viewport);
	if (opts.actions) args.push("--interact", typeof opts.actions === "string" ? opts.actions : opts.actions.join(";"));
	args.push("--fast", "--out", opts.out || "/tmp/merkava-sdk-shot.png");
	const { stdout } = await execFileAsync("merkava-shot", args, { timeout: opts.timeoutMs || 60000 });
	const png = readFileSync(opts.out || "/tmp/merkava-sdk-shot.png");
	return { ok: true, png, via: "cli", stdout };
}

/**
 * Run a page. Returns {ok, png:Buffer, width, height, consoleLogs, jsErrors,
 * finalDom, assertions, timingsMs, via}.
 */
export async function runPage(opts = {}) {
	const timeoutMs = opts.timeoutMs || 30000;
	const core = await localCore();
	if (core) {
		const r = await core.runPage({ ...opts, timeoutMs });
		return { ...r, via: "local-core" };
	}
	try {
		return await viaLiveApi(opts, timeoutMs);
	} catch (e) {
		return viaCli({ ...opts, timeoutMs });
	}
}

/** Screenshot a URL. Returns {ok, png:Buffer, width, height, via}. */
export async function screenshot(url, opts = {}) {
	return runPage({ ...opts, url });
}

/**
 * Execute JS with the real Merkava VM. Returns {ok, status, consoleLogs[],
 * jsErrors[{kind,name,message,file,line,estimated,ip,stack}], scriptsRun,
 * steps, wallMs, via}. The flagship: every JS runtime error, no browser.
 */
export async function runJs(opts = {}) {
	const timeoutMs = opts.timeoutMs || 30000;
	const core = await localCore();
	if (core && typeof core.runJs === "function") {
		const r = await core.runJs({ ...opts, timeoutMs });
		return { ...r, via: "local-core" };
	}
	// Live API fallback.
	const res = await fetch(`${LIVE_API}/run-js`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...opts, timeoutMs }),
	});
	if (!res.ok) throw new Error(`live api HTTP ${res.status}`);
	const j = await res.json();
	if (j.error && !j.js_errors) throw new Error(`live api: ${j.error}`);
	return {
		ok: j.ok, status: j.status,
		consoleLogs: j.console_logs || [], jsErrors: j.js_errors || [],
		scriptsRun: j.scripts_run || 0, steps: j.steps || 0,
		wallMs: (j.timings_ms || {}).total || 0, via: "live-api",
	};
}

/** List viewport presets. */
export async function devices() {
	const core = await localCore();
	if (core && core.VIEWPORT_PRESETS) return core.VIEWPORT_PRESETS;
	const res = await fetch(`${LIVE_API}/devices`);
	const j = await res.json();
	return j.devices;
}

// CLI passthrough: `node merkava-sdk.mjs --url <u> --out <f> [--device d]`
const isMain = (() => {
	try {
		return !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
	} catch { return false; }
})();
if (isMain) {
	const get = (n, d = null) => {
		const i = process.argv.indexOf(n);
		return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : d;
	};
	const url = get("--url");
	const html = get("--html");
	if (!url && !html) { console.error("need --url or --html"); process.exit(1); }
	runPage({ url, html, device: get("--device"), actions: get("--interact") })
		.then((r) => {
			const out = get("--out", "/tmp/merkava-sdk-shot.png");
			writeFileSync(out, r.png);
			console.log(`OK ${out} ${r.png.length}B via ${r.via}`);
		})
		.catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
}
