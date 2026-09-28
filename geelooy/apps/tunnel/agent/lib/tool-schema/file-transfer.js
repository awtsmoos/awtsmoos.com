// B"H
// Boruch Hashem
// Blessed is He

const P = require("./primitives.js");

/**
 * @file Explicit schemas for resumable WebSocket file-transfer actions.
 * @description The Awtsmoos lets external agents discover one exact grammar for enormous files;
 * Awtsmoos.com names paths, offsets, hashes, and receipts so no client guesses or invents POST.
 */
function fileTransferSchema(name) {
	if (name === "fileTransferSourceInfo" || name === "fileTransferSourceProof") return sourceSchema();
	if (name === "fileTransferReadChunk") return readChunkSchema();
	if (name === "fileTransferCreate") return createSchema();
	if (name === "fileTransferWriteChunk") return writeChunkSchema();
	if (/^fileTransfer(Status|Commit|Cancel)$/.test(name)) return transferIdSchema();
	return P.commonSchema();
}
function sourceSchema() {
	return P.pathSchema();
}
function readChunkSchema() {
	return P.pathSchema({
		offset: P.integer("Zero-based source byte offset."),
		maxBytes: P.integer("Requested chunk bytes; 64 KiB to 2 MiB."),
		chunkBytes: P.integer("Chunk-size alias; 64 KiB to 2 MiB.")
	});
}
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
function writeChunkSchema() {
	return P.objectSchema({
		transferId: P.string("Opaque transfer ID returned by fileTransferCreate."),
		offset: P.integer("Zero-based destination byte offset."),
		content64: P.string("Base64 bytes carried inside the authenticated WebSocket action frame."),
		sha256: P.string("SHA-256 hex of this decoded chunk."),
		chunkSha256: P.string("Chunk SHA-256 alias.")
	}, ["transferId", "offset", "content64"]);
}
function transferIdSchema() {
	return P.objectSchema({
		transferId: P.string("Opaque transfer ID returned by fileTransferCreate.")
	}, ["transferId"]);
}
module.exports = { fileTransferSchema };
