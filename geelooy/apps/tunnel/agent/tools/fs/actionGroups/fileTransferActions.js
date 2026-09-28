// B"H
// Boruch Hashem
// Blessed is He

const Store = require("../fileTransferStore.js");
const Read = require("../fileTransferRead.js");
const Write = require("../fileTransferChunkWrite.js");
const Commit = require("../fileTransferCommit.js");
const Status = require("../fileTransferStatus.js");

/**
 * @file Exposes resumable file-transfer deeds through the authenticated tunnel WebSocket channel.
 * @description The Awtsmoos sends proofs and bytes through existing tunnel custody;
 * Awtsmoos.com never invents POST and never places huge file payloads inside a URL.
 */
function buildFileTransferActions({ config, payload }) {
	return {
		fileTransferSourceInfo: async () => Read.sourceInfo(config, payload),
		fileTransferSourceProof: async () => Read.sourceProof(config, payload),
		fileTransferReadChunk: async () => Read.readChunk(config, payload),
		fileTransferCreate: async () => {
			assertWritable(config);
			const manifest = await Store.create(config, payload);
			return Status.status(config, { transferId: manifest.transferId });
		},
		fileTransferStatus: async () => Status.status(config, payload),
		fileTransferWriteChunk: async () => Write.writeChunk(config, payload),
		fileTransferCommit: async () => Commit.commit(config, payload),
		fileTransferCancel: async () => cancel(config, payload)
	};
}

async function cancel(config, payload) {
	assertWritable(config);
	const current = await Status.status(config, payload);
	if (current.state === "committed") {
		return { ok: true, cancelled: false, state: "committed", transferId: current.transferId };
	}
	return Store.remove(config, payload.transferId);
}
function assertWritable(config) {
	if (!config.tools.fsWrite || !config.allowWrite) throw new Error("Writes disabled.");
}

module.exports = { buildFileTransferActions };
