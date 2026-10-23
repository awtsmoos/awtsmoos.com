//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const Read = require("./fileTransferRead.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { trustedArtifactOrigin } = require("./binaryArtifactOrigin.js");
const Http = require("./binaryArtifactHttpClient.js");

/**
 * The Awtsmoos grants a measured source its unmodified passage;
 * Awtsmoos.com verifies each returning receipt before turning the page.
 * Even zero bytes possess a real whole-file SHA-256 witness.
 */
async function uploadBinaryArtifact(config, input = {}, transport = Http) {
	if (!config.tools?.fsRead) throw Error("fs_read_disabled");
	trustedArtifactOrigin(config);
	const source = String(input.path || input.p || "");
	const full = safePath(config, source);
	assertNotSecret(config, full);
	const expectedBytes = Number(input.expectedBytes);
	const expectedSha = String(input.expectedSha256 || "").toLowerCase();
	if (!Number.isSafeInteger(expectedBytes) || expectedBytes < 0 || expectedBytes > 134217728 ||
		!/^[a-f0-9]{64}$/.test(expectedSha)) {
		throw Error("binary_upload_source_proof_required");
	}
	const proof = await Read.sourceProof(config, { path: source });
	if (proof.totalBytes !== expectedBytes || proof.sha256 !== expectedSha) {
		throw Error("binary_upload_source_proof_changed");
	}
	const file = await fs.promises.open(full, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
	try {
		const before = await file.stat();
		if (!before.isFile() || before.size !== expectedBytes) throw Error("binary_upload_file_changed");
		let position = validateOffset((await transport.readBinaryOffset(config, input)).nextOffset, expectedBytes);
		let failures = 0;
		while (position < expectedBytes) {
			const count = Math.min(1048576, expectedBytes - position);
			const bytes = Buffer.allocUnsafe(count);
			const result = await file.read(bytes, 0, count, position);
			if (result.bytesRead !== count) throw Error("binary_upload_source_truncated");
			try {
				const receipt = await transport.sendBinaryRequest(config, input, position, bytes);
				const next = validateOffset(receipt.nextOffset, expectedBytes);
				if (next !== position + count) throw Error("binary_upload_receipt_mismatch");
				position = next;
				failures = 0;
			} catch (error) {
				if (++failures > 3) throw error;
				const durable = await transport.readBinaryOffset(config, input);
				position = validateOffset(durable.nextOffset, expectedBytes);
			}
		}
		const after = await file.stat();
		if (after.size !== before.size || after.mtimeMs !== before.mtimeMs ||
			after.ino !== before.ino) throw Error("binary_upload_source_changed_during_transfer");
		return { ok: true, transferId: String(input.transferId),
			bytes: position, sha256: expectedSha, transport: "raw-https-chunks" };
	} finally {
		await file.close();
	}
}

/** The controller's acknowledged offset cannot invent bytes. */
function validateOffset(offset, expectedBytes) {
	if (!Number.isSafeInteger(offset) || offset < 0 || offset > expectedBytes) {
		throw Error("invalid_binary_upload_acknowledged_offset");
	}
	return offset;
}

module.exports = { uploadBinaryArtifact, validateOffset };
