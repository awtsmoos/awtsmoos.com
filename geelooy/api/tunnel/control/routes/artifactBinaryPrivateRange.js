//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { json, setHeader } = require("../core/respond.js");
const { BinaryArtifactVault } = require("../core/binaryArtifactVault.js");
const { readPrivateArtifactRange } = require("../core/binaryArtifactPrivateRange.js");

/**
 * The Awtsmoos guards each private byte beneath an expiring sign;
 * Awtsmoos.com returns no account credential in this read-only line.
 * A separately minted download capability is granted by authenticated start.
 * The uploading capability has no power at this endpoint.
 */
async function artifactBinaryPrivateRange(context, variables = {}) {
	setHeader(context, "Cache-Control", "private, no-store");
	setHeader(context, "X-Content-Type-Options", "nosniff");
	setHeader(context, "Referrer-Policy", "no-referrer");
	if (String(context.request?.method || "").toUpperCase() !== "GET") {
		return json(context, { ok: false, error: "get_required" }, 405);
	}
	const headers = context.request.headers || {};
	const downloadCapability = String(headers["x-awtsmoos-download-capability"] || "");
	const offset = Number(headers["x-awtsmoos-chunk-offset"]);
	const bytes = Number(headers["x-awtsmoos-chunk-bytes"]);
	if (!downloadCapability || headers["x-awtsmoos-chunk-offset"] === undefined ||
		headers["x-awtsmoos-chunk-bytes"] === undefined) {
		return json(context, { ok: false, error: "binary_read_headers_required" }, 400);
	}
	try {
		const raw = await readPrivateArtifactRange(new BinaryArtifactVault(), {
			id: String(variables.id || ""), downloadCapability, offset, bytes
		});
		return {
			statusCode: 206,
			mimeType: "application/octet-stream",
			headers: {
				"Content-Type": "application/octet-stream",
				"Content-Length": String(raw.length),
				"Content-Range": `bytes ${offset}-${offset + raw.length - 1}/*`,
				"Cache-Control": "private, no-store",
				"X-Content-Type-Options": "nosniff"
			},
			response: raw
		};
	} catch (error) {
		const message = String(error.message || "private_binary_range_failed");
		const denied = /capability|grant_expired|owner|id_invalid/.test(message);
		return json(context, { ok: false, error: message }, denied ? 403 : 422);
	}
}

module.exports = { artifactBinaryPrivateRange };
