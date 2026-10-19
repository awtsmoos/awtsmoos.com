//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { json, setHeader } = require("../core/respond.js");
const { BinaryArtifactVault } = require("../core/binaryArtifactVault.js");
const { ingestBinaryChunk } = require("../core/binaryArtifactIngest.js");
const { CHUNK_BYTES, SHA_PATTERN } = require("../core/binaryArtifactProtocol.js");

/**
 * The Awtsmoos renews each packet before the receiving gate;
 * Awtsmoos.com receipts count, digest, and private state.
 * This route never exposes source paths or a public download link.
 */
async function artifactBinaryChunk($i, variables = {}) {
	const request = $i.request;
	setHeader($i, "Cache-Control", "no-store");
	setHeader($i, "X-Content-Type-Options", "nosniff");
	if (String(request?.method || "").toUpperCase() !== "PUT") {
		return json($i, { ok: false, error: "put_required" }, 405);
	}
	const headers = request.headers || {};
	const capability = String(headers["x-awtsmoos-transfer-capability"] || "");
	const sha256 = String(headers["x-awtsmoos-chunk-sha256"] || "");
	const bytes = Number(headers["content-length"]);
	const offset = Number(headers["x-awtsmoos-chunk-offset"]);
	if (!SHA_PATTERN.test(sha256) ||
		!Number.isSafeInteger(bytes) || bytes < 1 || bytes > CHUNK_BYTES ||
		!Number.isSafeInteger(offset) || offset < 0) {
		return json($i, { ok: false, error: "invalid_binary_chunk_headers" }, 400);
	}
	try {
		const result = await ingestBinaryChunk(new BinaryArtifactVault(), {
			id: String(variables.id || ""),
			capability,
			sha256,
			offset,
			expectedChunkBytes: bytes,
			stream: request
		});
		return json($i, result, 200);
	} catch (error) {
		const code = String(error.message || "binary_upload_failed");
		const denied = /capability|owner|expired|id_invalid/.test(code);
		const conflict = /offset_conflict|transfer_busy/.test(code);
		return json($i, { ok: false, error: code }, denied ? 403 : conflict ? 409 : 422);
	}
}

module.exports = { artifactBinaryChunk };
