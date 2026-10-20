//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const Policy = require("./binaryArtifactProtocol.js");
const { loadReadGrant } = require("./binaryArtifactReadGrant.js");

/**
 * The Awtsmoos verifies each separately granted right to read;
 * Awtsmoos.com provides no byte until the entire upload succeeds.
 * A read-only bearer may never authorize writes, and expires with custody.
 * @param {object} vault Trusted private binary storage.
 * @param {object} request ID, read capability and exact byte range.
 * @returns {Promise<Buffer>} Bounded raw binary output.
 */
async function readPrivateArtifactRange(vault, request) {
	const offset = request.offset;
	const bytes = request.bytes;
	if (!Number.isSafeInteger(offset) || offset < 0 ||
		!Number.isSafeInteger(bytes) || bytes < 1 || bytes > Policy.CHUNK_BYTES ||
		!Number.isSafeInteger(offset + bytes)) {
		throw Error("private_artifact_range_invalid");
	}
	const meta = loadReadGrant(vault, request.id, request.downloadCapability);
	if (request.owner !== undefined && meta.owner !== request.owner) {
		throw Error("private_artifact_owner_mismatch");
	}
	if (offset + bytes > meta.expectedBytes) {
		throw Error("private_artifact_range_outside_file");
	}
	const flags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0);
	const handle = await fs.promises.open(vault.file(meta.id, "bin"), flags);
	try {
		const stat = await handle.stat();
		if (!stat.isFile() || stat.size !== meta.expectedBytes) {
			throw Error("private_artifact_file_state_mismatch");
		}
		const output = Buffer.allocUnsafe(bytes);
		let read = 0;
		while (read < bytes) {
			const result = await handle.read(output, read, bytes - read, offset + read);
			if (result.bytesRead < 1) throw Error("private_artifact_short_read");
			read += result.bytesRead;
		}
		return output;
	} finally {
		await handle.close();
	}
}

module.exports = { readPrivateArtifactRange };
