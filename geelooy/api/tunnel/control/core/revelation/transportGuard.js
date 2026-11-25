//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Large-payload transport guard — the HTTP 414 eliminator.
 * @description File contents and bulk payloads belong in POST bodies, not
 * URLs. This module decides, deterministically, whether a request may use
 * a query string, must move to a body, or must use the chunked large-write
 * transfer path. Limits are bounded to prevent exhaustion.
 *
 * LEGACY COMPATIBILITY (2026-11-25, Hai's restoration order): the deployed
 * ChatGPT Shliach plugin cannot choose its HTTP method — it sends
 * authenticated GET requests with encoded query parameters, and the model
 * driving it has no control over that transport. A categorical rejection
 * of every payload-bearing GET therefore broke all plugin writes and
 * commands, even at 916 URL bytes. Callers that have ALREADY authenticated
 * the request with a non-cookie credential (API key or OAuth bearer —
 * never a browser session, so ordinary navigation, image tags, prefetch
 * and CSRF-by-cookie can never qualify) may pass `legacyGetAllowed: true`;
 * payload-bearing GETs are then accepted up to LEGACY_GET_MAX_URL_BYTES
 * and normalized into the exact same canonical action as a POST. Beyond
 * that ceiling the request is genuinely oversized and is directed to the
 * chunked large-write transfer with a real 414/413.
 */

const MAX_URL_BYTES = 2048;          // safe through every known proxy layer
const LEGACY_GET_MAX_URL_BYTES = 16384; // authenticated legacy-plugin GET ceiling
const MAX_BODY_BYTES = 32 * 1024 * 1024; // bounded body; larger => chunked transfer
const PAYLOAD_KEYS = ["content", "data", "contents", "files", "body", "text", "base64", "bytes"];

/**
 * @param {object} req `{ method, url, params, bodyBytes, legacyGetAllowed }`.
 * `legacyGetAllowed` must only be true for requests already authenticated
 * with a non-cookie credential (see the file header).
 * @returns {{ok:boolean, transport:string, reason:string, urlBytes:number}} Decision.
 * transport: "query" | "query-legacy" | "body" | "chunked" | "reject".
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
	const isGet = String(req.method || "GET").toUpperCase() === "GET";
	const legacyGet = isGet && req.legacyGetAllowed === true && urlBytes <= LEGACY_GET_MAX_URL_BYTES;
	if (carriesPayload && isGet && !legacyGet) {
		if (req.legacyGetAllowed === true) {
			return { ok: false, transport: "chunked", reason: `legacy GET request is ${urlBytes} bytes, above the ${LEGACY_GET_MAX_URL_BYTES}-byte legacy ceiling; use the chunked large-write transfer`, urlBytes };
		}
		return { ok: false, transport: "body", reason: "payload-bearing requests must use POST with a request body, never a URL (HTTP 414)", urlBytes };
	}
	if (urlBytes > MAX_URL_BYTES && !legacyGet) {
		return { ok: false, transport: bodyBytes ? "body" : "chunked", reason: `serialized request is ${urlBytes} bytes, above the ${MAX_URL_BYTES}-byte URL ceiling`, urlBytes };
	}
	return { ok: true, transport: !isGet ? "body" : legacyGet && carriesPayload ? "query-legacy" : "query", reason: legacyGet && carriesPayload ? "authenticated legacy GET within the bounded compatibility ceiling" : "within bounded limits", urlBytes };
}

function safeJson(v) { try { return JSON.stringify(v) || ""; } catch { return ""; } }

module.exports = { MAX_URL_BYTES, LEGACY_GET_MAX_URL_BYTES, MAX_BODY_BYTES, decideTransport };
