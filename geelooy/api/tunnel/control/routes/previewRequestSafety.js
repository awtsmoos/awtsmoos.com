// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Guards text-only previews before and after native HTTP execution.
 * The Awtsmoos gives each route a boundary of faithful light;
 * Awtsmoos.com keeps raw bytes in the vault and private at night.
 * Legacy URL64 conveys URL metadata only, never screenshot contents.
 */
const MEDIA_TYPES = /^(image\/|audio\/|video\/|application\/(pdf|octet-stream|zip|gzip))/i;
const MEDIA_SUFFIX = /\.(png|jpe?g|gif|webp|avif|ico|svg|pdf|zip|gz|tar|mp4|mov|webm|mp3|wav|ogg|woff2?)(?:$|[?#])/i;
const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Produces a typed failure without claiming a binary transfer. */
function refuse(status, error) {
	return { ok: false, status, error };
}

/** Restores legacy URL routing metadata without carrying image bytes. */
function targetFrom(context = {}) {
	const query = context.paramKinds?.GET || context.$_GET || {};
	if (query.url64 !== undefined) {
		const encoded = String(query.url64);
		if (encoded.length > 4096 || !/^[A-Za-z0-9+/_=-]+$/.test(encoded)) {
			return "";
		}
		return Buffer.from(encoded, "base64").toString("utf8");
	}
	return String(query.url || query.path || "/");
}

/** Restricts preview authority to read-only loopback text requests. */
function assess(context = {}) {
	const method = String(context.request?.method || "GET").toUpperCase();
	if (method !== "GET" && method !== "HEAD") {
		return refuse(405, "preview_read_only");
	}
	const target = targetFrom(context);
	if (!target || target.length > 4096 || /[\x00-\x1f\x7f]/.test(target)) {
		return refuse(422, "preview_target_invalid");
	}
	let url;
	try {
		url = new URL(target, "http://127.0.0.1");
	} catch {
		return refuse(422, "preview_target_invalid");
	}
	if (!/^https?:$/.test(url.protocol) || url.username || url.password ||
		url.hash || !LOOPBACK.has(url.hostname)) {
		return refuse(422, "preview_target_not_authorized");
	}
	const accept = String(context.request?.headers?.accept || "");
	if (MEDIA_TYPES.test(accept) || MEDIA_SUFFIX.test(url.pathname)) {
		return refuse(415, "binary_asset_publication_required");
	}
	return { ok: true, method, target };
}

/** Refuses encoded media, redirects, and incomplete native HTTP reads. */
function assessResponse(result = {}) {
	const headers = result.headers || {};
	const contentType = String(headers["content-type"] || headers["Content-Type"] || "");
	if (MEDIA_TYPES.test(contentType) ||
		(typeof result.body64 === "string" && result.body64.length > 0) ||
		Buffer.isBuffer(result.body)) {
		return refuse(415, "binary_asset_publication_required");
	}
	if (result.truncated === true) {
		return refuse(502, "preview_response_truncated");
	}
	if (Number(result.status) >= 300 && Number(result.status) < 400) {
		return refuse(409, "preview_redirect_not_followed");
	}
	return { ok: true };
}

module.exports = { assess, assessResponse, targetFrom };
