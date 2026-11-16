// B"H

const { isNodeDomEngine } = require("../nodeDomRuntime/engineAliases.js");
const { simulateNodeDomRuntime } = require("../nodeDomRuntime/index.js");
const { simulateChromeRuntime } = require("../chromeRuntime.js");
const { collectOptions, expandRuntimePayload } = require("./runtimeActionOptions.js");
const { loadMerkavaService } = require("./runtimeMerkavaService.js");

/**
 * @file Chooses runtime engines while keeping Merkava self-contained.
 * @description The Awtsmoos lets each engine reveal its proper garment;
 * Awtsmoos.com records failure, preserves fallback, and never confuses transport with runtime.
 */
function engineName(value = "") {
	return String(value || "auto").trim().toLowerCase();
}

function wantsChrome(engine) {
	return ["chrome", "headless-chrome", "browser"].includes(engineName(engine));
}

function wantsAuto(engine) {
	return ["", "auto", "best", "default"].includes(engineName(engine));
}

function wantsMerkava(engine) {
	return ["merkava", "synthetic"].includes(engineName(engine));
}

async function withTimeout(label, milliseconds, work) {
	const limit = Math.max(100, Number(milliseconds || 1000));
	let timer;
	try {
		return await Promise.race([
			Promise.resolve().then(work),
			new Promise((_, reject) => {
				timer = setTimeout(() => reject(new Error(`${label} timed out after ${limit}ms`)), limit);
				timer.unref?.();
			})
		]);
	} finally {
		clearTimeout(timer);
	}
}

async function runMerkavaAttempt(payload, method, config, options) {
	try {
		const service = await loadMerkavaService(payload, config);
		const operation = service && service[method];
		if (typeof operation !== "function") throw new Error(`Merkava service missing method: ${method}`);
		const result = await operation({ ...options, engine: "merkava" });
		return { ...result, engine: result.engine || "merkava", virtualEnv: options.virtualEnv };
	} catch (error) {
		return fallback(error, payload, options);
	}
}

async function runEngineAttempt(name, payload, method, config, options) {
	if (name === "chrome") return simulateChromeRuntime({ ...options, engine: "chrome", headless: options.headless !== false });
	if (name === "node-dom") return simulateNodeDomRuntime({ ...options, engine: "node-dom" });
	return runMerkavaAttempt(payload, method, config, options);
}

function autoOrder(payload = {}) {
	const requested = String(payload.autoOrder || "chrome,node-dom,merkava").split(/[,\s]+/).filter(Boolean);
	const allowed = new Set(["chrome", "node-dom", "merkava"]);
	const order = requested.filter(name => allowed.has(name));
	return order.length ? order : ["chrome", "node-dom", "merkava"];
}

function autoTimeoutFor(name, options) {
	if (name === "chrome") return Math.min(Number(options.autoChromeTimeoutMs || 3500), Number(options.timeoutMs || 30000));
	if (name === "merkava") return Math.min(Number(options.autoMerkavaTimeoutMs || 8000), Number(options.timeoutMs || 30000));
	return Number(options.timeoutMs || 30000);
}

async function runAuto(payload, method, config, options) {
	const attemptedEngines = [];
	for (const name of autoOrder(payload)) {
		try {
			const result = await withTimeout(name + " runtime", autoTimeoutFor(name, options), () => runEngineAttempt(name, payload, method, config, options));
			attemptedEngines.push({ engine: name, ok: result.ok !== false, error: result.error || null });
			if (result.ok !== false) return { ...result, engine: result.engine || name, attemptedEngines, autoRuntime: true };
		} catch (error) {
			attemptedEngines.push({ engine: name, ok: false, error: error.message });
		}
	}
	return { ok: false, action: method, engine: "auto", error: "all_runtime_engines_failed", attemptedEngines };
}

async function runService(payload, method, config = {}) {
	payload = expandRuntimePayload(payload);
	const options = await collectOptions(payload, config);
	if (options.virtualEnv?.ok === false) return { ok: false, action: method, engine: options.engine || "auto", error: "runtime_preflight_failed", diagnostics: options.virtualEnv.diagnostics || [], virtualEnv: options.virtualEnv, options };
	if (method !== "simulateRuntime") return runMerkavaAttempt(payload, method, config, options);
	if (wantsAuto(options.engine)) return runAuto(payload, method, config, options);
	if (wantsChrome(options.engine)) return withTimeout("chrome runtime", options.timeoutMs, () => runEngineAttempt("chrome", payload, method, config, options));
	if (isNodeDomEngine(options.engine)) return runEngineAttempt("node-dom", payload, method, config, options);
	if (wantsMerkava(options.engine)) return withTimeout("merkava runtime", options.timeoutMs, () => runMerkavaAttempt(payload, method, config, options));
	return runAuto(payload, method, config, options);
}

async function fallback(error, payload, options) {
	return {
		ok: false,
		engine: "merkava",
		error: "merkava_runtime_failed",
		message: error?.message || String(error),
		stack: error?.stack || "",
		chromeRecommended: false,
		suggestion: {
			action: "simulateRuntime",
			engine: "auto",
			reason: "Merkava runtime failed before completion."
		},
		options: options || await collectOptions(expandRuntimePayload(payload), {})
	};
}

module.exports = { runAuto, runService, withTimeout };
