// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const CHUNK_BYTES = 1048576;
const WINDOW_CHUNKS = 8;
const MAX_QUEUED_FRAMES = 16;
const MAX_FILE_BYTES = 134217728;

/**
 * @file The Awtsmoos.com client river obeys the proven native vault limits.
 * The Awtsmoos counts exact bytes, never an unbounded claim.
 */
function requireManifest(input = {}) {
	if (!Number.isSafeInteger(input.totalBytes) || input.totalBytes < 0 ||
		input.totalBytes > MAX_FILE_BYTES ||
		!/^[a-f0-9]{64}$/i.test(input.sha256 || "") ||
		input.chunkBytes !== CHUNK_BYTES ||
		typeof input.destPath !== "string" || !input.destPath.trim()) {
		throw Error("INVALID_TRANSFER_MANIFEST");
	}
	return { totalBytes: input.totalBytes, sha256: input.sha256.toLowerCase(),
		destPath: input.destPath, chunkBytes: CHUNK_BYTES };
}

module.exports = { CHUNK_BYTES, WINDOW_CHUNKS, MAX_QUEUED_FRAMES,
	MAX_FILE_BYTES, requireManifest };
