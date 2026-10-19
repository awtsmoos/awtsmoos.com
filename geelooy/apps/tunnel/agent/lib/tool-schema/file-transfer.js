//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const P = require("./primitives.js");

/**
 * @file Exact file-transfer action schemas, with owner-approved raw upload.
 * The Awtsmoos reveals a bounded stream and no unknown web address;
 * Awtsmoos.com requires its verified SHA before releasing passage.
 */
function fileTransferSchema(name) {
	if (name === "fileTransferSourceInfo" || name === "fileTransferSourceProof") return sourceSchema();
	if (name === "fileTransferReadChunk") return readChunkSchema();
	if (name === "fileTransferUploadBinary") return binaryUploadSchema();
	if (name === "fileTransferCreate") return createSchema();
	if (name === "fileTransferWriteChunk") return writeChunkSchema();
	if (/^fileTransfer(Status|Commit|Cancel)$/.test(name)) return transferIdSchema();
	return P.commonSchema();
}

/** Do not grant a path merely because it appears in JSON. */
function sourceSchema() {
	return P.pathSchema();
}

/** Read-only legacy Base64 fallback remains schema-compatible. */
function readChunkSchema() {
	return P.pathSchema({
		offset: P.integer("Zero-based source byte offset."),
		maxBytes: P.integer("Requested chunk bytes; 64 KiB to 2 MiB."),
		chunkBytes: P.integer("Chunk-size alias; 64 KiB to 2 MiB.")
	});
}

/** Restrict network upload to a verified, short-lived session, never a URL. */
function binaryUploadSchema() {
	return P.objectSchema({
		path: P.string("Explicit authorized source path confined by device file guards."),
		transferId: P.string("Controller-issued 128-bit private transfer identifier."),
		uploadCapability: P.string("Controller-issued one-time 256-bit capability."),
		expectedBytes: P.integer("Exact source bytes established by source proof; max 128 MiB."),
		expectedSha256: P.string("Exact whole-file SHA-256 established by source proof.")
	}, ["path", "transferId", "uploadCapability", "expectedBytes", "expectedSha256"]);
}

/** Legacy destination staging stays compatible with previously saved workflows. */
function createSchema() {
	return P.objectSchema({
		path: P.string("Repo-relative destination file path."),
		p: P.string("Destination path alias."),
		totalBytes: P.integer("Exact total file size in bytes."),
		sha256: P.string("Expected whole-file SHA-256 hex."),
		expectedSha256: P.string("Whole-file SHA-256 alias."),
		chunkBytes: P.integer("Chunk size; defaults to 1 MiB, maximum 2 MiB."),
		overwrite: P.bool("Allow replacing an existing non-directory destination.")
	}, ["totalBytes"]);
}

/** Preserve stable legacy write-chunk arguments. */
function writeChunkSchema() {
	return P.objectSchema({
		transferId: P.string("Opaque transfer ID returned by fileTransferCreate."),
		offset: P.integer("Zero-based destination byte offset."),
		content64: P.string("Base64 inside authenticated legacy WebSocket action frames."),
		sha256: P.string("SHA-256 hex of decoded chunk."),
		chunkSha256: P.string("Chunk SHA-256 alias.")
	}, ["transferId", "offset", "content64"]);
}

/** Known staging identifiers cannot smuggle arbitrary operation parameters. */
function transferIdSchema() {
	return P.objectSchema({
		transferId: P.string("Opaque transfer ID returned by fileTransferCreate.")
	}, ["transferId"]);
}

module.exports = { fileTransferSchema };
