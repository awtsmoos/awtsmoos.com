//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RebbeApiResponse
 * @description
 * HTTP wrapping for the Rebbe sichos API, following the site's public API
 * conventions (see geelooy/api/zmanim/lib/response.js): public CORS, a BH
 * marker, stable error codes, and JSON bodies the dynamic server serializes.
 */

const API_VERSION = "1.0.0";

/** Applies the public read-only CORS contract to a request context. */
function applyPublicHeaders(info, cacheSeconds = 60) {
	info.setHeader("Access-Control-Allow-Origin", "*");
	info.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	info.setHeader("Access-Control-Allow-Headers", "Content-Type");
	if (cacheSeconds) info.setHeader("Cache-Control", `public, max-age=${cacheSeconds}`);
}

/**
 * Runs one JSON service with uniform method gating and error mapping.
 * @param {object} info Derech request context.
 * @param {Function} service Async fn receiving merged params, returning body.
 * @param {object} [options] {methods: string[], cacheSeconds: number}
 * @returns {Promise<object>} Dynamic-server response packet.
 */
async function runJson(info, service, options = {}) {
	applyPublicHeaders(info, options.cacheSeconds ?? 60);
	const method = String(info.request?.method || "GET").toUpperCase();
	if (method === "OPTIONS") return { response: { BH: "B\"H", ok: true, apiVersion: API_VERSION } };
	const methods = options.methods || ["GET"];
	if (!methods.includes(method)) {
		return errorResponse(405, "METHOD_NOT_ALLOWED", `Supported methods: ${methods.join(", ")}.`);
	}
	try {
		const params = method === "POST" ? { ...(info.$_GET || {}), ...readBodyParams(info) } : (info.$_GET || {});
		const body = await service(params);
		return { response: { BH: "B\"H", ok: true, apiVersion: API_VERSION, ...body } };
	} catch (error) {
		if (error && error.status) return errorResponse(error.status, error.code || "INVALID_REQUEST", error.message);
		console.error("Rebbe API error:", error);
		return errorResponse(500, "INTERNAL_ERROR", "The Rebbe sichos service could not complete this request.");
	}
}

/** Reads POST params: parsed form fields, or a raw JSON body when present. */
function readBodyParams(info) {
	const post = info.$_POST || {};
	if (post && post.__raw_body__) {
		try {
			return JSON.parse(Buffer.from(post.__raw_body__).toString("utf8")) || {};
		} catch (error) {
			return {};
		}
	}
	return post || {};
}

/** Builds a stable public failure body. */
function errorResponse(status, code, message) {
	return {
		status,
		response: {
			BH: "B\"H",
			ok: false,
			apiVersion: API_VERSION,
			error: { code, message }
		}
	};
}

module.exports = { API_VERSION, applyPublicHeaders, runJson, errorResponse, readBodyParams };
