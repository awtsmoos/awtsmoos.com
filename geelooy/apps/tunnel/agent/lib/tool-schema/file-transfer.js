//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const P = require("./primitives.js");

/**
 * The Awtsmoos gives the source and destination independent secret signs;
 * Awtsmoos.com lets raw bytes cross only at their appointed times.
 */
function fileTransferSchema(name) {
	if (name === "fileTransferSourceInfo" || name === "fileTransferSourceProof") return P.pathSchema();
	if (name === "fileTransferReadChunk") return readChunkSchema();
	if (name === "fileTransferUploadBinary") return binaryUploadSchema();
	if (name === "fileTransferDownloadBinary") return binaryDownloadSchema();
	if (name === "fileTransferCreate") return createSchema();
	if (name === "fileTransferWriteChunk") return writeChunkSchema();
	if (/^fileTransfer(Status|Commit|Cancel)$/.test(name)) return transferIdSchema();
	return P.commonSchema();
}

/** Historical read action is not used by the canonical device bridge. */
function readChunkSchema() {
	return P.pathSchema({
		offset: P.integer("Zero-based source byte offset."),
		maxBytes: P.integer("Legacy maximum chunk bytes."),
		chunkBytes: P.integer("Legacy chunk-size alias.")
	});
}

/** Only a verified private session may initiate network upload. */
function binaryUploadSchema() {
	return P.objectSchema({
		path: P.string("Authorized source path confined by device guards."),
		transferId: P.string("Controller-minted private transfer identifier."),
		uploadCapability: P.string("Owner-authorized write-only 256-bit capability."),
		expectedBytes: P.integer("Exact proved bytes; max 128 MiB."),
		expectedSha256: P.string("Proved complete SHA-256 digest.")
	}, ["path", "transferId", "uploadCapability", "expectedBytes", "expectedSha256"]);
}

/** Read-only grant belongs exclusively to the verified target-device write. */
function binaryDownloadSchema() {
	return P.objectSchema({
		path: P.string("Guarded destination path on authorized target."),
		transferId: P.string("Controller-minted private transfer identifier."),
		downloadCapability: P.string("Separate expiring read-only 256-bit grant."),
		expectedBytes: P.integer("Exact SHA-proved destination bytes."),
		expectedSha256: P.string("SHA-256 of complete verified source file."),
		overwrite: P.bool("Explicitly permit replacing an existing safe file.")
	}, ["path", "transferId", "downloadCapability", "expectedBytes", "expectedSha256"]);
}

/** Legacy local staging remains available only to explicit direct callers. */
function createSchema() {
	return P.objectSchema({
		path: P.string("Guarded destination file path."),
		p: P.string("Destination path alias."),
		totalBytes: P.integer("Exact total file size."),
		sha256: P.string("Expected complete file SHA-256."),
		expectedSha256: P.string("Whole-file SHA-256 alias."),
		chunkBytes: P.integer("Bounded legacy chunk size."),
		overwrite: P.bool("Explicit overwrite authorization.")
	}, ["totalBytes"]);
}

/** Legacy Base64 staging is never called by canonical binary transfer. */
function writeChunkSchema() {
	return P.objectSchema({
		transferId: P.string("Opaque legacy staging transfer ID."),
		offset: P.integer("Zero-based destination offset."),
		content64: P.string("Legacy direct WebSocket staging payload."),
		sha256: P.string("Decoded chunk digest."),
		chunkSha256: P.string("Chunk SHA-256 alias.")
	}, ["transferId", "offset", "content64"]);
}

/** Explicit legacy status/commit/cancel calls require a staging ID. */
function transferIdSchema() {
	return P.objectSchema({
		transferId: P.string("Opaque legacy transfer ID.")
	}, ["transferId"]);
}

module.exports = { fileTransferSchema };
