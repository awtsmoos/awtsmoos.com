// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const crypto = require("node:crypto");
const Auth = require("./authorization.js");
const Limits = require("./constants.js");
const Transfers = require("./transfers.js");
const Native = require("./native.js");
const { ingestBinaryChunk } = require("../../../../../geelooy/api/tunnel/control/core/binaryArtifactIngest.js");
const { completeBinaryArtifact } = require("../../../../../geelooy/api/tunnel/control/core/binaryArtifactComplete.js");

/**
 * @file Carries native raw upload bytes through the Awtsmoos.com vault.
 * The Awtsmoos gives each chunk its SHA and irreversible place;
 * no destination claims a file before whole-byte grace.
 */
function begin(server, client, input) {
	const identity = client.identity;
	Auth.requireRoute(identity, input.routeReference, "tunnel.write");
	const spec = Limits.requireManifest(input);
	const prior = input.transferId
		? Transfers.reopen(server, identity, input.routeReference, spec, input.transferId)
		: null;
	const entry = prior?.entry || Transfers.begin(server, identity, input.routeReference, spec);
	const nextOffset = prior?.nextOffset || 0;
	client.binaryUpload = { entry, offset: nextOffset, unacked: 0 };
	client.send({ type: "UPLOAD_READY", transferId: entry.transferId,
		nextOffset, chunkBytes: Limits.CHUNK_BYTES, windowChunks: Limits.WINDOW_CHUNKS });
}

/** Accept only an unmasked-on-the-wire Buffer after WebSocket frame decoding. */
async function append(client, bytes) {
	const state = client.binaryUpload;
	if (!state) throw Error("UPLOAD_NOT_STARTED");
	const entry = state.entry;
	Auth.requireRoute(client.identity, entry.route, "tunnel.write");
	if (!Buffer.isBuffer(bytes) || !bytes.length ||
		bytes.length > Limits.CHUNK_BYTES ||
		state.offset + bytes.length > entry.totalBytes) throw Error("INVALID_BINARY_CHUNK");
	const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
	const result = await ingestBinaryChunk(entry.vault, {
		id: entry.transferId,
		owner: entry.owner,
		capability: entry.uploadCapability,
		offset: state.offset,
		sha256,
		expectedChunkBytes: bytes.length,
		stream: (async function* () { yield bytes; })()
	});
	state.offset = result.nextOffset;
	state.unacked += 1;
	if (state.unacked >= Limits.WINDOW_CHUNKS || state.offset === entry.totalBytes) {
		client.send({ type: "UPLOAD_ACK", transferId: entry.transferId,
			receivedBytes: state.offset });
		state.unacked = 0;
	}
}

/** Publish to device only after full vault SHA and trusted device receipt. */
async function commit(server, client, input) {
	const state = client.binaryUpload;
	if (!state || input.transferId !== state.entry.transferId) {
		throw Error("TRANSFER_NOT_FOUND");
	}
	const entry = state.entry;
	Auth.requireRoute(client.identity, entry.route, "tunnel.write");
	if (entry.committed) {
		client.send({ type: "UPLOAD_COMMITTED", ...entry.committed });
		return;
	}
	const complete = await completeBinaryArtifact(entry.vault, {
		id: entry.transferId, owner: entry.owner, capability: entry.uploadCapability
	});
	if (!complete.ok || complete.bytes !== entry.totalBytes ||
		complete.sha256 !== entry.sha256) throw Error("UPLOAD_SHA_MISMATCH");
	const device = await Native.send(server, client.identity, entry.route,
		"fileTransferDownloadBinary", {
			transferId: entry.transferId,
			downloadCapability: entry.downloadCapability,
			path: entry.path,
			expectedBytes: entry.totalBytes,
			expectedSha256: entry.sha256,
			overwrite: input.overwrite === true
		});
	if (!device.performed || device.bytes !== entry.totalBytes ||
		device.sha256 !== entry.sha256) throw Error("DEVICE_SHA_MISMATCH");
	entry.committed = { transferId: entry.transferId, path: entry.path,
		bytes: entry.totalBytes, sha256: entry.sha256 };
	client.send({ type: "UPLOAD_COMMITTED", ...entry.committed });
	client.binaryUpload = null;
}

module.exports = { append, begin, commit };
