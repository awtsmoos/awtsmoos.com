//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const BatchTransfers = require("../writeBatchTransfers.js");
const Commit = require("../fileTransferCommit.js");
const Lock = require("../fileTransferLock.js");
const Read = require("../fileTransferRead.js");
const Status = require("../fileTransferStatus.js");
const Store = require("../fileTransferStore.js");
const Write = require("../fileTransferChunkWrite.js");
const Binary = require("../binaryArtifactUploader.js");
const Download = require("../binaryArtifactDownloader.js");

/**
 * Awtsmoos.com guards the native source and its verified destination;
 * the Awtsmoos grants raw private bytes a hash-proven installation.
 * The canonical controller bridge uses only the two binary operations.
 */
function buildFileTransferActions({ config, payload }) {
	return {
		fileTransferSourceInfo: async () => Read.sourceInfo(config, payload),
		fileTransferSourceProof: async () => Read.sourceProof(config, payload),
		fileTransferReadChunk: async () => Read.readChunk(config, payload),
		fileTransferUploadBinary: async () => Binary.uploadBinaryArtifact(config, payload),
		fileTransferDownloadBinary: async () => Download.downloadPrivateArtifact(config, {
			transferId: payload.transferId,
			downloadCapability: payload.downloadCapability
		}, {
			path: payload.path,
			expectedBytes: payload.expectedBytes,
			expectedSha256: payload.expectedSha256,
			overwrite: payload.overwrite
		}),
		fileTransferCreate: async () => create(config, payload),
		fileTransferStatus: async () => Status.status(config, payload),
		fileTransferWriteChunk: async () => Write.writeChunk(config, payload),
		fileTransferCommit: async () => Commit.commit(config, payload),
		fileTransferCancel: async () => cancel(config, payload),
		bulkWriteTransfers: async () => BatchTransfers.bulkWriteTransfers(config, payload)
	};
}

/** Preserve legacy local transfer staging for noncanonical direct callers. */
async function create(config, payload) {
	assertWritable(config);
	const manifest = await Store.create(config, payload);
	return Status.status(config, { transferId: manifest.transferId });
}

/** Honor cancellation unless an earlier verified commit already succeeded. */
async function cancel(config, payload) {
	assertWritable(config);
	const transfer = Store.paths(config, payload.transferId);
	return Lock.withTransferLock(transfer.directory, async () => {
		const current = await Status.status(config, payload);
		if (current.state === "committed") {
			return { ok: true, cancelled: false,
				state: "committed", transferId: current.transferId };
		}
		return Store.remove(config, payload.transferId);
	});
}

/** All writable destinations require both operator authorization gates. */
function assertWritable(config) {
	if (!config.tools.fsWrite || !config.allowWrite) throw Error("Writes disabled.");
}

module.exports = { buildFileTransferActions };
