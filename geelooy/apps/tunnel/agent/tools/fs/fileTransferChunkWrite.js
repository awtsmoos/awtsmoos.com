// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const Policy = require("./fileTransferPolicy.js");
const Store = require("./fileTransferStore.js");

/**
 * @file Writes one independently hashed transfer fragment at an arbitrary resumable offset.
 * @description The Awtsmoos lets each fragment arrive again without fear; Awtsmoos.com verifies
 * the fragment before disk, syncs it, then coalesces durable received ranges for later resume.
 */
async function writeChunk(config, input = {}) {
	assertWritable(config);
	const { transfer, manifest } = await Store.load(config, input.transferId);
	if (manifest.state !== "receiving") throw Policy.fault("transfer_not_receiving");
	const offset = Policy.offset(input.offset, manifest.totalBytes);
	const expectedSha256 = Policy.sha256(input.sha256 || input.chunkSha256);
	const bytes = decode(input.content64);
	if (bytes.length > manifest.chunkBytes || bytes.length > Policy.MAX_CHUNK_BYTES) {
		throw Policy.fault("transfer_chunk_too_large");
	}
	if (offset + bytes.length > manifest.totalBytes) throw Policy.fault("transfer_chunk_out_of_bounds");
	const actualSha256 = digest(bytes);
	if (actualSha256 !== expectedSha256) throw Policy.fault("transfer_chunk_hash_mismatch");
	if (!bytes.length && manifest.totalBytes !== 0) throw Policy.fault("empty_transfer_chunk");
	const handle = await fsp.open(transfer.payload, "r+");
	try {
		if (bytes.length) await handle.write(bytes, 0, bytes.length, offset);
		await handle.sync();
	} finally {
		await handle.close();
	}
	Store.mergeRange(manifest, offset, bytes.length);
	await Store.save(transfer, manifest);
	return {
		ok: true,
		transferId: transfer.id,
		offset,
		bytes: bytes.length,
		sha256: actualSha256,
		receivedBytes: Store.receivedBytes(manifest),
		nextOffset: Store.nextOffset(manifest),
		complete: Store.completeCoverage(manifest),
		transport: "websocket"
	};
}

function decode(content64) {
	const text = String(content64 || "");
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(text) || text.length % 4 === 1) throw Policy.fault("invalid_chunk_base64");
	return Buffer.from(text, "base64");
}
function digest(buffer) {
	return crypto.createHash("sha256").update(buffer).digest("hex");
}
function assertWritable(config) {
	if (!config.tools.fsWrite) throw Policy.fault("fs_write_disabled");
	if (!config.allowWrite) throw Policy.fault("writes_disabled");
}

module.exports = { assertWritable, decode, digest, writeChunk };
