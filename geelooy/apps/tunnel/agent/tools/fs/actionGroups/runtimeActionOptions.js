// B"H

const { buildRuntimeVirtualEnv } = require("../runtimeVirtualEnv.js");
const { buildRuntimeUrlEnv } = require("../runtimeUrlEnv.js");

/**
 * @file Normalizes runtime action payloads without choosing an execution engine.
 * @description
 * The Awtsmoos gathers many wire dialects into one lucid vessel; Awtsmoos.com
 * lets engines receive the same fields whether callers spoke JSON, base64, or arrays.
 */
function json64(value, fallback) {
	if (!value) return fallback;
	try {
		return JSON.parse(Buffer.from(String(value), "base64").toString("utf8"));
	} catch {
		return fallback;
	}
}

function jsonMaybe(value, fallback) {
	if (value == null || value === "") return fallback;
	if (typeof value === "object") return value;
	try {
		return JSON.parse(String(value));
	} catch {
		return fallback;
	}
}

function firstJson(payload, names, fallback) {
	for (const name of names) {
		if (payload[name] != null && payload[name] !== "") return jsonMaybe(payload[name], fallback);
	}
	for (const name of names.map(name => `${name}64`)) {
		if (payload[name] != null && payload[name] !== "") return json64(payload[name], fallback);
	}
	return fallback;
}

function expandRuntimePayload(payload = {}) {
	const params = jsonMaybe(payload.params, json64(payload.params64, {}));
	if (!params || typeof params !== "object" || Array.isArray(params)) return payload;
	return { ...params, ...payload };
}

function runtimeOrigin(payload = {}) {
	if (payload.url) {
		try {
			return new URL(String(payload.url)).origin;
		} catch {}
	}
	return process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com";
}

function browserActionsFrom(payload = {}) {
	payload = expandRuntimePayload(payload);
	return firstJson(payload, ["browserActions", "pageActions", "actionsJson", "actions", "steps"], null);
}

async function collectRuntimeEnv(payload, config) {
	payload = expandRuntimePayload(payload);
	const urlEnv = await buildRuntimeUrlEnv(payload);
	if (urlEnv) return urlEnv;
	return buildRuntimeVirtualEnv(payload, config);
}

async function collectOptions(payload = {}, config = {}) {
	payload = expandRuntimePayload(payload);
	const env = await collectRuntimeEnv(payload, config);
	const actions = browserActionsFrom(payload);
	return {
		runtime: payload.runtime || "browser",
		engine: payload.engine || payload.runtimeEngine || "auto",
		entry: env.entry || payload.entry || payload.path || payload.p || payload.target || "index.html",
		files: Object.keys(env.files || {}).length ? env.files : jsonMaybe(payload.files, json64(payload.files64, {})),
		virtualEnv: env,
		workflow: jsonMaybe(payload.workflow, payload.steps?.length ? { steps: payload.steps } : json64(payload.workflow64, null)),
		probes: firstJson(payload, ["probes"], []),
		interactions: actions || firstJson(payload, ["interactions"], []),
		browserActions: actions,
		pageActions: actions,
		origin: payload.origin || runtimeOrigin(payload),
		url: payload.url || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com",
		headless: payload.headless !== false && payload.headless !== "false",
		waitMs: Number(payload.waitMs || 0),
		timeoutMs: Number(payload.timeoutMs || 30000),
		autoChromeTimeoutMs: Number(payload.autoChromeTimeoutMs || payload.chromeTimeoutMs || 3500),
		autoMerkavaTimeoutMs: Number(payload.autoMerkavaTimeoutMs || payload.merkavaTimeoutMs || 8000),
		returnValues: firstJson(payload, ["returnValues", "values"], []),
		values: firstJson(payload, ["values", "returnValues"], []),
		compactModules: payload.compactModules,
		networkRewrite: payload.networkRewrite || null,
		format: payload.format || payload.returnFormat || payload.outputFormat || null,
		port: payload.port || payload.chromePort || 9222
	};
}

module.exports = { browserActionsFrom, collectOptions, expandRuntimePayload, runtimeOrigin };
