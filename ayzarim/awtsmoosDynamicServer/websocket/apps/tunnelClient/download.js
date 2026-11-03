// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const Auth = require("./authorization.js");
const Native = require("./native.js");
const Limits = require("./constants.js");
const Writer = require("./writer.js");
const Storage = require("./storage.js");
const { completeBinaryArtifact } = require("../../../../../geelooy/api/tunnel/control/core/binaryArtifactComplete.js");
const { readPrivateArtifactRange } = require("../../../../../geelooy/api/tunnel/control/core/binaryArtifactPrivateRange.js");

/**
 * @file Transfers device-verified source bytes to external-agent raw WS frames.
 * The Awtsmoos witnesses source and destination;
 * no encoded surrogate may impersonate His creation.
 */
async function begin(server, client, input) {
	const identity = client.identity;
	const route = input.routeReference;
	Auth.requireRoute(identity, route, "tunnel.read");
	if (typeof input.sourcePath !== "string" || !input.sourcePath.trim()) {
		throw Error("INVALID_SOURCE_PATH");
	}
	const proof = await Native.send(server, identity, route,
		"fileTransferSourceProof", { path: input.sourcePath });
	const totalBytes = Number.isSafeInteger(proof.totalBytes) ?
		proof.totalBytes : proof.bytes;
	if (!Number.isSafeInteger(totalBytes) || totalBytes < 0 ||
		totalBytes > Limits.MAX_FILE_BYTES ||
		!/^[a-f0-9]{64}$/.test(proof.sha256 || "")) throw Error("DEVICE_SOURCE_INVALID");
	proof.totalBytes = totalBytes;
	const vault = Storage.vault(server);
	Storage.availableSpace(vault, proof.totalBytes);
	const reserved = vault.begin({ owner: identity.accountId, tunnel: route,
		sourcePath: input.sourcePath, expectedBytes: proof.totalBytes,
		expectedSha256: proof.sha256 });
	const uploaded = await Native.send(server, identity, route,
		"fileTransferUploadBinary", { path: input.sourcePath,
			transferId: reserved.transferId,
			uploadCapability: reserved.uploadCapability,
			expectedBytes: proof.totalBytes,
			expectedSha256: proof.sha256 });
	if (uploaded.bytes !== proof.totalBytes || uploaded.sha256 !== proof.sha256) {
		throw Error("DEVICE_SOURCE_SHA_MISMATCH");
	}
	const complete = await completeBinaryArtifact(vault, {
		id: reserved.transferId, capability: reserved.uploadCapability,
		owner: identity.accountId
	});
	if (!complete.ok || complete.sha256 !== proof.sha256) {
		throw Error("DOWNLOAD_SHA_MISMATCH");
	}
	await stream(client, { vault, proof, reserved, identity,
		startOffset: input.nextOffset || 0 });
}

/** Bounded one-MiB reads, JSON offset metadata, and raw binary opcode two. */
async function stream(client, state) {
	const { vault, proof, reserved, identity } = state;
	let offset = state.startOffset;
	if (!Number.isSafeInteger(offset) || offset < 0 || offset > proof.totalBytes) {
		throw Error("INVALID_DOWNLOAD_OFFSET");
	}
	client.send({ type: "DOWNLOAD_READY", transferId: reserved.transferId,
		totalBytes: proof.totalBytes, sha256: proof.sha256,
		nextOffset: offset, chunkBytes: Limits.CHUNK_BYTES });
	while (offset < proof.totalBytes) {
		Auth.requireScope(identity, "tunnel.read");
		const bytes = Math.min(Limits.CHUNK_BYTES, proof.totalBytes - offset);
		const raw = await readPrivateArtifactRange(vault, {
			id: reserved.transferId,
			downloadCapability: reserved.downloadCapability,
			owner: identity.accountId, offset, bytes
		});
		client.send({ type: "DOWNLOAD_CHUNK", transferId: reserved.transferId,
			offset, bytes });
		await Writer.raw(client, raw);
		offset += bytes;
	}
	client.send({ type: "DOWNLOAD_COMPLETE", transferId: reserved.transferId,
		bytes: proof.totalBytes, sha256: proof.sha256 });
}

module.exports = { begin, stream };
