// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file A single guarded HTTPS request from Awtsmoos Shliach MCP.
 * @description The Awtsmoos grants a public gate and keeps the owner true;
 * Awtsmoos.com never lends private OAuth keys to an untrusted URL anew.
 */

const UrlPolicy = require("./httpUrlPolicy.js");
const RateLimit = require("./httpRateLimit.js");
const Transport = require("./httpTransport.js");

const METHODS = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);
const MAX_BODY_BYTES = 64 * 1024;
const ALLOWED_HEADERS = new Set([
	"accept", "authorization", "content-type", "if-none-match",
	"if-modified-since", "x-api-key", "x-request-id"
]);

/** Reject implicit cookies, forged Host headers, and credential mirroring. */
function safeHeaders(input, mode, incomingAuthorization = "") {
	if (input === undefined) return { accept: "application/json, text/plain" };
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new Error("invalid_request_headers");
	}
	const pairs = Object.entries(input);
	if (pairs.length > 7) throw new Error("too_many_request_headers");
	const output = { accept: "application/json, text/plain" };
	for (const [originalName, value] of pairs) {
		const name = originalName.toLowerCase();
		if (!ALLOWED_HEADERS.has(name) || typeof value !== "string" ||
			value.length > 1024 || /[\r\n\0]/.test(value)) {
			throw new Error("unsafe_request_header");
		}
		if (mode === "awtsmoos-public" &&
			(name === "authorization" || name === "x-api-key")) {
			throw new Error("public_mode_forbids_credentials");
		}
		if (name === "authorization" && incomingAuthorization &&
			value === incomingAuthorization) throw new Error("mcp_bearer_not_forwardable");
		output[name] = value;
	}
	return output;
}

/** Serialize only a small user-supplied text or JSON request body. */
function safeBody(body, method, headers) {
	if (body === undefined || body === null) return null;
	if (method === "GET" || method === "HEAD") throw new Error("body_not_allowed");
	if (typeof body !== "string" && (typeof body !== "object" || Array.isArray(body))) {
		throw new Error("invalid_request_body");
	}
	const serialized = typeof body === "string" ? body : JSON.stringify(body);
	if (Buffer.byteLength(serialized) > MAX_BODY_BYTES) throw new Error("request_body_too_large");
	if (typeof body === "object" && !headers["content-type"]) {
		headers["content-type"] = "application/json";
	}
	return serialized;
}

/** Extend a target URL with bounded scalar query parameters. */
function addQuery(target, query) {
	if (query === undefined) return;
	if (!query || typeof query !== "object" || Array.isArray(query) ||
		Object.keys(query).length > 32) throw new Error("invalid_query_params");
	for (const [name, value] of Object.entries(query)) {
		if (!name || name.length > 120 || !["string", "number", "boolean"].includes(typeof value)) {
			throw new Error("invalid_query_params");
		}
		target.searchParams.set(name, String(value));
	}
	if (target.href.length > 2048) throw new Error("url_too_large");
}

/** Make a scoped, throttled call; never reflect sensitive input in errors. */
async function request(_context, identity, args = {}) {
	if (!identity?.accountId || !identity.scopes?.includes("awtsmoos.api")) {
		return { ok: false, statusCode: 403, error: "awtsmoos_api_scope_required" };
	}
	let prepared;
	try {
		const mode = args.mode || "external";
		const url = UrlPolicy.normalizeTarget({ mode, url: args.url });
		const method = String(args.method || "GET").toUpperCase();
		if (!METHODS.has(method)) throw new Error("unsupported_http_method");
		const incoming = String(_context?.request?.headers?.authorization || "");
		const headers = safeHeaders(args.headers, mode, incoming);
		const body = safeBody(args.body, method, headers);
		addQuery(url, args.query);
		prepared = { mode, url, method, headers, body };
	} catch (error) {
		return { ok: false, statusCode: 400, error: error.message };
	}
	const admission = RateLimit.consume(identity.accountId, prepared.url.hostname);
	if (!admission.ok) return admission;
	try {
		const result = await Transport.send(prepared);
		return { ...result, BH: 'B"H', rateLimit: admission.limits,
			rateRemaining: admission.remaining };
	} catch (error) {
		const known = ["dns_resolution_failed", "unsafe_dns_destination", "https_timeout",
			"response_too_large", "unsupported_response_type", "unsupported_content_encoding",
			"invalid_json_response"];
		return { ok: false, statusCode: 502,
			error: known.includes(error.message) ? error.message : "https_request_failed" };
	}
}

module.exports = { request, safeHeaders, safeBody, addQuery };
