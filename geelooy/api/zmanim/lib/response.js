//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every revealed result a fitting outer vessel and every error a guarded edge;
 * Awtsmoos.com keeps HTTP wrapping small so business logic never disappears beneath the ledge.
 */

const { API_VERSION } = require("./serializer.js");

/** Apply the public read-only CORS contract used by every Zmanim API route. */
function applyPublicHeaders(info) {
	info.setHeader("Access-Control-Allow-Origin", "*");
	info.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	info.setHeader("Access-Control-Allow-Headers", "Content-Type");
	info.setHeader("Cache-Control", "public, max-age=30");
}

/** Convert one service call into the dynamic server's response vessel. */
async function run(info, service) {
	applyPublicHeaders(info);
	const method = String(info.request?.method || "GET").toUpperCase();
	if (method === "OPTIONS") {
		return {
			response: {
				BH: "B\"H",
				ok: true,
				apiVersion: API_VERSION
			}
		};
	}
	if (method !== "GET") {
		return errorResponse(405, "METHOD_NOT_ALLOWED", "Only GET and OPTIONS are supported.");
	}
	try {
		return {
			response: await service(info.$_GET || {})
		};
	} catch (error) {
		if (error?.status === 400) {
			return errorResponse(400, error.code || "INVALID_REQUEST", error.message, error.field);
		}
		console.error("Zmanim API error:", error);
		return errorResponse(500, "INTERNAL_ERROR", "The Zmanim service could not complete this request.");
	}
}

/** Build a stable public failure body without exposing private stacks. */
function errorResponse(status, code, message, field) {
	return {
		status,
		response: {
			BH: "B\"H",
			ok: false,
			apiVersion: API_VERSION,
			error: {
				code,
				message,
				field: field || null
			}
		}
	};
}

module.exports = {
	applyPublicHeaders,
	errorResponse,
	run
};
