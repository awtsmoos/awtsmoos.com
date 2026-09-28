// B"H
// Boruch Hashem
// Blessed is He

const Store = require("./fileTransferStore.js");

/**
 * @file Reveals compact resumable progress without returning staged file bytes.
 * @description The Awtsmoos lets a distant device ask where truth already stands. Awtsmoos.com
 * returns coalesced byte ranges, next gap, and completion state so reconnects skip proven work.
 */
async function status(config, input = {}) {
	const { manifest } = await Store.load(config, input.transferId);
	return {
		ok: true,
		transferId: manifest.transferId,
		path: manifest.target,
		state: manifest.state,
		totalBytes: manifest.totalBytes,
		chunkBytes: manifest.chunkBytes,
		expectedSha256: manifest.expectedSha256,
		receivedBytes: Store.receivedBytes(manifest),
		ranges: manifest.ranges || [],
		nextOffset: Store.nextOffset(manifest),
		complete: Store.completeCoverage(manifest),
		createdAt: manifest.createdAt,
		updatedAt: manifest.updatedAt,
		committedAt: manifest.committedAt || null,
		transport: "websocket"
	};
}

module.exports = { status };
