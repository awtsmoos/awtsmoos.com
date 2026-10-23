//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { BinaryArtifactVault } = require("../core/binaryArtifactVault.js");
const { completeBinaryArtifact } = require("../core/binaryArtifactComplete.js");

/**
 * The Awtsmoos moves each byte through a guarded binary river;
 * Awtsmoos.com verifies both banks, with no Base64 deliverer.
 * Controller authorizes both devices and provides a trusted owner.
 * Even an empty file completes with its real empty SHA-256 witness.
 * @param {object} input Both routes, source, destination and overwrite rule.
 * @param {function} send Scope-checked authenticated device executor.
 * @param {object} options Trusted owner and optional test vault.
 */
async function pumpBinary(input, send, options = {}) {
	const required = (value, code) => {
		const result = String(value || "").trim();
		if (!result) throw Error(code);
		return result;
	};
	const owner = required(options.owner, "binary_transfer_owner_required");
	const source = required(input.source, "source_route_required");
	const destination = required(input.destination, "destination_route_required");
	const sourcePath = required(input.sourcePath, "source_path_required");
	const destinationPath = required(input.destinationPath, "destination_path_required");
	if (input.transferId) {
		throw Error("legacy_transfer_resume_not_supported_by_raw_protocol");
	}
	const proof = await send(source, "fileTransferSourceProof", "tunnel.read", {
		path: sourcePath
	});
	if (!Number.isSafeInteger(proof?.totalBytes) || proof.totalBytes < 0 ||
		proof.totalBytes > 134217728 || !/^[a-f0-9]{64}$/i.test(proof.sha256 || "")) {
		throw Error("binary_source_proof_invalid");
	}
	const vault = options.vault || new BinaryArtifactVault();
	const session = vault.begin({ owner, tunnel: source, sourcePath,
		expectedBytes: proof.totalBytes, expectedSha256: proof.sha256 });
	const uploaded = await send(source, "fileTransferUploadBinary", "tunnel.read", {
		path: sourcePath, transferId: session.transferId,
		uploadCapability: session.uploadCapability,
		expectedBytes: proof.totalBytes, expectedSha256: proof.sha256
	});
	if (!uploaded?.ok || uploaded.bytes !== proof.totalBytes ||
		uploaded.sha256 !== proof.sha256.toLowerCase()) {
		throw Error("binary_upload_receipt_invalid");
	}
	const complete = await completeBinaryArtifact(vault, {
		id: session.transferId, capability: session.uploadCapability, owner
	});
	if (!complete?.ok) throw Error("binary_vault_commit_failed");
	const copied = await send(destination, "fileTransferDownloadBinary", "tunnel.write", {
		transferId: session.transferId,
		downloadCapability: session.downloadCapability,
		path: destinationPath,
		expectedBytes: proof.totalBytes,
		expectedSha256: proof.sha256,
		overwrite: input.overwrite === true
	});
	if (!copied?.ok || copied.bytes !== proof.totalBytes ||
		copied.sha256 !== proof.sha256.toLowerCase() || copied.performed !== true) {
		throw Error("binary_destination_commit_unproven");
	}
	return { ok: true, done: true, transport: "raw-https-chunks",
		transferId: session.transferId, totalBytes: proof.totalBytes,
		receivedBytes: copied.bytes, sha256: copied.sha256,
		committed: copied, continuation: null };
}

module.exports = { pumpBinary };
