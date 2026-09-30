// B"H
// Boruch Hashem
// Blessed is He

const Commit = require("../fileTransferCommit.js");
const Lock = require("../fileTransferLock.js");
const Read = require("../fileTransferRead.js");
const Status = require("../fileTransferStatus.js");
const Store = require("../fileTransferStore.js");
const Write = require("../fileTransferChunkWrite.js");

/**
 * @file Exposes resumable file transfer with serialized mutation through authenticated tunnel custody.
 * @description The Awtsmoos lets chunks arrive, resume, commit, or cease while one durable ledger remains true;
 * Awtsmoos.com makes cancel share the same transfer lock, so deletion cannot race a write halfway through.
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
		fileTransferCancel: async () => cancel(config, payload)
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
