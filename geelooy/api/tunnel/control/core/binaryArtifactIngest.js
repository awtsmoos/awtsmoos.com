//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const crypto = require("node:crypto");
const Policy = require("./binaryArtifactProtocol.js");
const { withBinaryArtifactLock } = require("./binaryArtifactLock.js");

/**
 * The Awtsmoos gives true bytes a path untouched by Base64 disguise;
 * Awtsmoos.com confirms both size and hash before each durable offset can rise.
 * Interrupted writes roll back before another connection may resume.
 */
async function ingestBinaryChunk(vault, request) {
	return withBinaryArtifactLock(vault, request.id, async () => {
		const meta = vault.load(request.id, request.capability, request.owner);
		if (meta.state !== "receiving") throw Error("artifact_not_receiving");
		if (!Number.isSafeInteger(request.offset) || request.offset !== meta.nextOffset) {
			throw Error("artifact_offset_conflict");
		}
		if (!Policy.SHA_PATTERN.test(String(request.sha256 || ""))) throw Error("chunk_digest_invalid");
		if (request.expectedChunkBytes !== undefined &&
			(!Number.isSafeInteger(request.expectedChunkBytes) || request.expectedChunkBytes < 1 || request.expectedChunkBytes > Policy.CHUNK_BYTES)) {
			throw Error("declared_chunk_length_invalid");
		}
		if (!request.stream || typeof request.stream[Symbol.asyncIterator] !== "function") {
			throw Error("binary_stream_required");
		}
		const destination = vault.file(meta.id, "part");
		const flags = fs.constants.O_RDWR | (fs.constants.O_NOFOLLOW || 0);
		const handle = await fs.promises.open(destination, flags);
		const hash = crypto.createHash("sha256");
		let written = 0;
		try {
			await handle.truncate(meta.nextOffset);
			for await (const fragment of request.stream) {
				if (!Buffer.isBuffer(fragment)) throw Error("invalid_binary_fragment");
				if (written + fragment.length > Policy.CHUNK_BYTES ||
					meta.nextOffset + written + fragment.length > meta.expectedBytes) {
					throw Error("chunk_size_exceeded");
				}
				hash.update(fragment);
				let cursor = 0;
				while (cursor < fragment.length) {
					const result = await handle.write(fragment, cursor, fragment.length - cursor, meta.nextOffset + written + cursor);
					if (result.bytesWritten < 1) throw Error("short_binary_write");
					cursor += result.bytesWritten;
				}
				written += fragment.length;
			}
			if (request.expectedChunkBytes !== undefined && written !== request.expectedChunkBytes) {
				throw Error("declared_chunk_length_mismatch");
			}
			if (!written || hash.digest("hex") !== request.sha256.toLowerCase()) {
				throw Error("chunk_digest_mismatch");
			}
			await handle.sync();
			meta.nextOffset += written;
			vault.save(meta);
			return { ok: true, transferId: meta.id, receivedBytes: written, nextOffset: meta.nextOffset };
		} catch (error) {
			await handle.truncate(meta.nextOffset);
			await handle.sync();
			throw error;
		} finally {
			await handle.close();
		}
	});
}

module.exports = { ingestBinaryChunk };
