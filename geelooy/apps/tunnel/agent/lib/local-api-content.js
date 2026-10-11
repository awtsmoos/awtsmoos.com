// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file The virtual-OS tunnel's single management surface (Yaakov 2026-10-11).
 * @description
 * One guarded doorway through which an authenticated user manages EVERYTHING:
 * geelooy/os files, the entire social layer (posts, heichelos, feeds), Awtsmoos
 * email, every Awtsmoos app, SSH, and every Awtsmoos API.
 *
 * Surfaces:
 *   social — posts/heichelos CRUD, search, corpora, translations (verified live)
 *   email  — send, inbox, read, unread count (Awtsmoos Mail API, verified live)
 *   os     — geelooy/os file operations (delegates to the tunnel fs handler)
 *   ssh    — Awtsmoos SSH API passthrough (raw)
 *   apps   — Awtsmoos app APIs passthrough (raw)
 *   api    — raw passthrough to ANY Awtsmoos API path
 *
 * AUTH: every call carries the user's Awtsmoos API key (X-Awtsmoos-Api-Key).
 * The server binds the key to its user and enforces ownership — this module
 * never invents permissions, it surfaces the server's verdicts cleanly.
 * Never log or persist the API key.
 */

const ORIGIN = process.env.AWTSMOOS_API_ORIGIN || "https://awtsmoos.com";
const API_BASE = `${ORIGIN.replace(/\/$/, "")}/api`;

/**
 * Registry: surface -> { description, base, operations }.
 * operation -> { method, path } with :param templates filled from params.
 */
const SURFACES = Object.freeze({
	social: {
		description: "Posts, heichelos, search, library, translations — as the key user.",
		base: "/social",
		operations: Object.freeze({
			"post.create":        { method: "POST", path: "/agent/posts/create" },
			"post.edit":          { method: "POST", path: "/agent/posts/edit" },
			"post.delete":        { method: "POST", path: "/agent/posts/delete" },
			"post.import":        { method: "POST", path: "/agent/posts/import" },
			"post.list":          { method: "GET",  path: "/agent/posts/list" },
			"post.get":           { method: "GET",  path: "/agent/post" },
			"heichel.create":     { method: "POST", path: "/agent/heichelos/create" },
			"heichel.edit":       { method: "POST", path: "/agent/heichelos/edit" },
			"heichel.delete":     { method: "POST", path: "/agent/heichelos/delete" },
			"heichel.list":       { method: "GET",  path: "/agent/heichelos/list" },
			"search":             { method: "GET",  path: "/agent/search" },
			"corpora":            { method: "GET",  path: "/agent/corpora" },
			"translation.status": { method: "GET",  path: "/agent/translation-status" },
			"glossary":           { method: "GET",  path: "/agent/glossary" },
			"translate.submit":   { method: "POST", path: "/agent/translate/submit" },
			"translate.job":      { method: "GET",  path: "/agent/translate/job" },
		}),
	},
	email: {
		description: "Awtsmoos Mail: send, inbox, read, unread count.",
		base: "/email",
		operations: Object.freeze({
			"send":        { method: "POST", path: "/sendTo/:to/from/:from" },
			"inbox":       { method: "GET",  path: "/get" },
			"read":        { method: "GET",  path: "/get/:mailId/" },
			"unreadCount": { method: "GET",  path: "/unread/count" },
		}),
	},
	os: {
		description: "geelooy/os file operations on this machine (list/read/write/tree/grep).",
		base: null, // delegated to the tunnel fs handler, not HTTP
		operations: Object.freeze({
			"list": { fs: "list" },
			"read": { fs: "read" },
			"write": { fs: "write" },
			"tree": { fs: "tree" },
			"grep": { fs: "grep" },
		}),
	},
	ssh: {
		description: "Awtsmoos SSH API passthrough (raw).",
		base: "/ssh",
		operations: Object.freeze({
			"raw": { method: "ANY", path: "/" },
		}),
	},
	apps: {
		description: "Awtsmoos app APIs passthrough (raw).",
		base: "/apps",
		operations: Object.freeze({
			"raw": { method: "ANY", path: "/" },
		}),
	},
	api: {
		description: "Raw passthrough to ANY Awtsmoos API path (method + path supplied).",
		base: "",
		operations: Object.freeze({
			"raw": { method: "ANY", path: "/" },
		}),
	},
});

function surfaceNames() {
	return Object.keys(SURFACES);
}

function operationNames(surface = "social") {
	const s = SURFACES[surface];
	return s ? Object.keys(s.operations) : [];
}

/** Full registry for discovery: surfaces, descriptions, operations. */
function registry() {
	const out = {};
	for (const [name, surface] of Object.entries(SURFACES)) {
		out[name] = {
			description: surface.description,
			operations: Object.keys(surface.operations),
		};
	}
	return Object.freeze(out);
}

function clean(value) {
	return String(value || "").trim();
}

function fillPathTemplate(template, params) {
	return template.replace(/:([A-Za-z0-9_]+)/g, (match, key) => {
		const value = params[key];
		if (value === undefined || value === null || value === "") {
			throw new Error(`missing_path_param:${key}`);
		}
		delete params[key];
		return encodeURIComponent(String(value));
	});
}

/**
 * Calls one unified operation.
 * @param {object} body { surface='social', operation, apiKey, params, method?, path? }
 * @param {object} deps local-API deps (for the os surface fs delegation)
 * @returns {Promise<object>} { ok, surface, operation, ... } — never throws.
 */
async function callUnifiedOperation(body = {}, deps = {}) {
	const surface = clean(body.surface) || "social";
	const operation = clean(body.operation);
	const apiKey = clean(body.apiKey);
	const params = body.params && typeof body.params === "object" ? { ...body.params } : {};
	const spec = SURFACES[surface];
	if (!spec) {
		return { ok: false, surface, operation, error: "unknown_surface", available: surfaceNames() };
	}
	const op = spec.operations[operation];
	if (!op) {
		return { ok: false, surface, operation, error: "unknown_operation", available: operationNames(surface) };
	}
	if (!apiKey) {
		return { ok: false, surface, operation, error: "api_key_required", hint: "Pass your Awtsmoos API key as apiKey." };
	}

	// os surface: delegate to the tunnel's own fs handler (this machine's files).
	if (surface === "os") {
		try {
			if (typeof deps.fsHandler !== "function") {
				return { ok: false, surface, operation, error: "fs_handler_unavailable" };
			}
			const result = await deps.fsHandler({ kind: "fs", action: op.fs, ...params }, null);
			return { ok: true, surface, operation, result };
		} catch (error) {
			return { ok: false, surface, operation, error: "os_operation_failed", message: String((error && error.message) || error) };
		}
	}

	// HTTP surfaces (social/email/ssh/apps/api).
	let method = op.method;
	let pathTemplate = op.path;
	if (operation === "raw") {
		method = clean(body.method).toUpperCase() || "GET";
		pathTemplate = clean(body.path) || "/";
		if (!/^[A-Z]+$/.test(method) || !pathTemplate.startsWith("/")) {
			return { ok: false, surface, operation, error: "raw_needs_method_and_path" };
		}
	}
	let url;
	try {
		url = API_BASE + spec.base + fillPathTemplate(pathTemplate, params);
	} catch (error) {
		return { ok: false, surface, operation, error: String(error.message || error) };
	}
	const init = {
		method,
		headers: { "X-Awtsmoos-Api-Key": apiKey, "content-type": "application/json" },
	};
	try {
		if (method === "GET" || method === "HEAD") {
			const query = new URLSearchParams();
			for (const [key, value] of Object.entries(params)) {
				if (value === undefined || value === null) continue;
				query.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
			}
			const qs = query.toString();
			if (qs) url += `?${qs}`;
		} else {
			init.body = JSON.stringify({ BH: "B\"H", ...params });
		}
		const response = await fetch(url, init);
		const text = await response.text();
		let result;
		try { result = JSON.parse(text); } catch { result = { raw: text.slice(0, 4000) }; }
		if (!response.ok) {
			return { ok: false, surface, operation, error: "awtsmoos_api_error", status: response.status, result };
		}
		return { ok: true, surface, operation, status: response.status, result };
	} catch (error) {
		return { ok: false, surface, operation, error: "unified_request_failed", message: String((error && error.message) || error) };
	}
}

// Backward-compatible alias: { operation, apiKey, params } == { surface:'social', ... }.
async function callContentOperation(body = {}, deps = {}) {
	return callUnifiedOperation({ surface: "social", ...body }, deps);
}

function operationNamesSocial() {
	return operationNames("social");
}

/**
 * Local-API dispatch entry: { kind: "content", surface?, operation, apiKey, params }.
 */
async function callContent(response, deps, body) {
	const Response = require("./local-api-response.js");
	const result = await callUnifiedOperation(body, deps);
	return Response.endJson(response, 200, result);
}

module.exports = {
	SURFACES,
	surfaceNames,
	operationNames,
	registry,
	callUnifiedOperation,
	callContentOperation,
	operationNames: operationNamesSocial,
	callContent,
};
