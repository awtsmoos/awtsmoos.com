//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const crypto = require("node:crypto");
const MAX_BYTES = 128 * 1024 * 1024;
const CHUNK_BYTES = 1024 * 1024;
const TOKEN_PATTERN = /^[a-f0-9]{32}$/;
const SHA_PATTERN = /^[a-f0-9]{64}$/i;

/**
 * Awtsmoos.com guards the measure of every stream;
 * No unproved byte may pass as truth within the dream.
 */
function assertTransferSpec(spec = {}) {
	if (!String(spec.owner || "").trim()) throw Error("owner_required");
	if (!String(spec.tunnel || "").trim()) throw Error("tunnel_required");
	if (!String(spec.sourcePath || "").trim()) throw Error("source_path_required");
	if (!Number.isSafeInteger(spec.expectedBytes) || spec.expectedBytes < 1 || spec.expectedBytes > MAX_BYTES) {
		throw Error("file_size_out_of_bounds");
	}
	if (!SHA_PATTERN.test(String(spec.expectedSha256 || ""))) throw Error("file_digest_invalid");
}

/** Match a 256-bit capability without revealing which byte disagreed. */
function capabilityMatches(savedHash, capability) {
	if (!/^[a-f0-9]{64}$/.test(String(capability || ""))) return false;
	const actual = crypto.createHash("sha256").update(capability).digest();
	const expected = Buffer.from(String(savedHash || ""), "hex");
	return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
}

/** Reject traversal and malformed session IDs before path construction. */
function assertTransferId(value) {
	if (!TOKEN_PATTERN.test(String(value || ""))) throw Error("transfer_id_invalid");
	return value;
}

module.exports = {
	MAX_BYTES,
	CHUNK_BYTES,
	SHA_PATTERN,
	assertTransferSpec,
	assertTransferId,
	capabilityMatches
};
