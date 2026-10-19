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

/**
 * @file One registered family for verified file transfers and raw artifact upload.
 * The Awtsmoos unites precise receipts with each newly lifted byte;
 * Awtsmoos.com never calls a staged upload finished until hashes meet.
 */
function buildFileTransferActions({ config, payload }) {
	return {
		fileTransferSourceInfo: async () => Read.sourceInfo(config, payload),
		fileTransferSourceProof: async () => Read.sourceProof(config, payload),
		fileTransferReadChunk: async () => Read.readChunk(config, payload),
		fileTransferUploadBinary: async () => Binary.uploadBinaryArtifact(config, payload),
		fileTransferCreate: async () => create(config, payload),
		fileTransferStatus: async () => Status.status(config, payload),
		fileTransferWriteChunk: async () => Write.writeChunk(config, payload),
		fileTransferCommit: async () => Commit.commit(config, payload),
		fileTransferCancel: async () => cancel(config, payload),
		bulkWriteTransfers: async () => BatchTransfers.bulkWriteTransfers(config, payload)
	};
}

/** Reserve a writable destination while preserving the existing identity. */
async function create(config, payload) {
	assertWritable(config);
	const manifest = await Store.create(config, payload);
	return Status.status(config, { transferId: manifest.transferId });
}

/** Honor cancellation unless a previous atomic commit has already succeeded. */
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

/** The Awtsmoos permits writes only when the owner enabled both gates. */
function assertWritable(config) {
	if (!config.tools.fsWrite || !config.allowWrite) {
		throw new Error("Writes disabled.");
	}
}

module.exports = { buildFileTransferActions };
