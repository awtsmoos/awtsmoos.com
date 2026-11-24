//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Large-payload transport guard — the HTTP 414 eliminator.
 * @description File contents and bulk payloads must travel in POST bodies,
 * never in URLs. This module decides, deterministically, whether a request
 * may use a query string, must move to a body, or must use the chunked /
 * large-write transfer path. Limits are bounded to prevent exhaustion.
 */

const MAX_URL_BYTES = 2048;          // safe through every known proxy layer
const MAX_BODY_BYTES = 32 * 1024 * 1024; // bounded body; larger => chunked transfer
const PAYLOAD_KEYS = ["content", "data", "contents", "files", "body", "text", "base64", "bytes"];

/**
 * @param {object} req `{ method, url, params, bodyBytes }`.
 * @returns {{ok:boolean, transport:string, reason:string, urlBytes:number}} Decision.
 * transport: "query" | "body" | "chunked" | "reject".
 */
function decideTransport(req = {}) {
	const params = req.params || {};
	const urlBytes = Buffer.byteLength(String(req.url || ""), "utf8")
		+ Buffer.byteLength(safeJson(params), "utf8");
	const carriesPayload = PAYLOAD_KEYS.some(k => params[k] !== undefined)
		|| Object.values(params).some(v => typeof v === "string" && v.length > 512);
	const bodyBytes = Number(req.bodyBytes || 0);
	if (bodyBytes > MAX_BODY_BYTES) {
		return { ok: false, transport: "chunked", reason: "body exceeds bounded limit; use chunked/resumable transfer", urlBytes };
	}
	if (carriesPayload && String(req.method || "GET").toUpperCase() === "GET") {
		return { ok: false, transport: "body", reason: "payload-bearing requests must use POST with a request body, never a URL (HTTP 414)", urlBytes };
	}
	if (urlBytes > MAX_URL_BYTES) {
		return { ok: false, transport: bodyBytes ? "body" : "chunked", reason: `serialized request is ${urlBytes} bytes, above the ${MAX_URL_BYTES}-byte URL ceiling`, urlBytes };
	}
	return { ok: true, transport: String(req.method || "GET").toUpperCase() === "GET" ? "query" : "body", reason: "within bounded limits", urlBytes };
}

function safeJson(v) { try { return JSON.stringify(v) || ""; } catch { return ""; } }

module.exports = { MAX_URL_BYTES, MAX_BODY_BYTES, decideTransport };
