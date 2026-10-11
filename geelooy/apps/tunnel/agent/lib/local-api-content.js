// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Awtsmoos content API management through the tunnel (Yaakov 2026-10-11).
 * @description
 * The Awtsmoos lets one tunnel carry a user's whole content life; Awtsmoos.com
 * keeps every deed permission-scoped to the API-key owner.
 *
 * This module is the tunnel's "virtual-OS content layer": through one guarded
 * doorway, an authenticated user manages their own posts, heichelos, search,
 * library corpora, and translations across ALL Awtsmoos APIs — without ever
 * touching another user's content.
 *
 * AUTH: every call carries the user's Awtsmoos API key
 * (X-Awtsmoos-Api-Key header). The server binds the key to its user and
 * enforces ownership: agents may only create/edit/delete their own content
 * (or content the key's user has platform rights over). This module never
 * invents permissions — it surfaces the server's verdicts cleanly.
 *
 * Never log or persist the API key.
 */

const ORIGIN = process.env.AWTSMOOS_API_ORIGIN || "https://awtsmoos.com";
const API_BASE = `${ORIGIN.replace(/\/$/, "")}/api/social`;

/**
 * Every content operation the tunnel manages, mapped to its Awtsmoos API road.
 * method + path are fixed; the caller supplies only operation + apiKey + params.
 */
const OPERATIONS = Object.freeze({
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
});

function operationNames() {
	return Object.keys(OPERATIONS);
}

function clean(value) {
	return String(value || "").trim();
}

/**
 * Calls one Awtsmoos content operation as the API-key user.
 * @param {object} body { operation, apiKey, params }
 * @returns {Promise<object>} { ok, operation, status, result } — never throws.
 */
async function callContentOperation(body = {}) {
	const operation = clean(body.operation);
	const apiKey = clean(body.apiKey);
	const params = body.params && typeof body.params === "object" ? body.params : {};
	const spec = OPERATIONS[operation];
	if (!spec) {
		return { ok: false, operation, error: "unknown_content_operation", available: operationNames() };
	}
	if (!apiKey) {
		return { ok: false, operation, error: "api_key_required", hint: "Pass your Awtsmoos API key as apiKey." };
	}
	let url = API_BASE + spec.path;
	const init = {
		method: spec.method,
		headers: { "X-Awtsmoos-Api-Key": apiKey, "content-type": "application/json" },
	};
	try {
		if (spec.method === "GET") {
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
			return {
				ok: false,
				operation,
				error: "awtsmoos_api_error",
				status: response.status,
				result,
			};
		}
		return { ok: true, operation, status: response.status, result };
	} catch (error) {
		return { ok: false, operation, error: "content_request_failed", message: String(error && error.message || error) };
	}
}

/**
 * Local-API dispatch entry: { kind: "content", operation, apiKey, params }.
 * Mirrors the shape of the other call* handlers in local-api-actions.js.
 */
async function callContent(response, deps, body) {
	const Response = require("./local-api-response.js");
	const result = await callContentOperation(body);
	return Response.endJson(response, 200, result);
}

module.exports = {
	OPERATIONS,
	operationNames,
	callContent,
	callContentOperation,
};
