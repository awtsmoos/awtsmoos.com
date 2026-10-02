// B"H
// Boruch Hashem
// Blessed is He

const BatchTransfers = require("../writeBatchTransfers.js");
const Commit = require("../fileTransferCommit.js");
const Lock = require("../fileTransferLock.js");
const Read = require("../fileTransferRead.js");
const Status = require("../fileTransferStatus.js");
const Store = require("../fileTransferStore.js");
const Write = require("../fileTransferChunkWrite.js");

/**
 * @file Exposes resumable file transfer and transactional staged batches through one custody family.
 * @description
 * The Awtsmoos lets chunks arrive, resume, commit, or gather into one batch covenant;
 * Awtsmoos.com keeps cancel, commit, and batch publication under the same durable transfer locks.
 */
function buildFileTransferActions({ config, payload }) {
	return {
		fileTransferSourceInfo: async () => Read.sourceInfo(config, payload),
		fileTransferSourceProof: async () => Read.sourceProof(config, payload),
		fileTransferReadChunk: async () => Read.readChunk(config, payload),
		fileTransferCreate: async () => create(config, payload),
		fileTransferStatus: async () => Status.status(config, payload),
		fileTransferWriteChunk: async () => Write.writeChunk(config, payload),
		fileTransferCommit: async () => Commit.commit(config, payload),
		fileTransferCancel: async () => cancel(config, payload),
		bulkWriteTransfers: async () => BatchTransfers.bulkWriteTransfers(config, payload)
	};
}

async function create(config, payload) {
	assertWritable(config);
	const manifest = await Store.create(config, payload);
	return Status.status(config, { transferId: manifest.transferId });
}

async function cancel(config, payload) {
	assertWritable(config);
	const transfer = Store.paths(config, payload.transferId);
	return Lock.withTransferLock(transfer.directory, async () => {
		const current = await Status.status(config, payload);
		if (current.state === "committed") {
			return {
				ok: true,
				cancelled: false,
				state: "committed",
				transferId: current.transferId
			};
		}
		return Store.remove(config, payload.transferId);
	});
}

function assertWritable(config) {
	if (!config.tools.fsWrite || !config.allowWrite) {
		throw new Error("Writes disabled.");
	}
}

module.exports = { buildFileTransferActions };
