// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const Lock = require("./fileTransferLock.js");
const Policy = require("./fileTransferPolicy.js");
const Store = require("./fileTransferStore.js");

/**
 * @file Writes one hashed transfer fragment while serializing durable range mutation.
 * @description The Awtsmoos may send many fragments together, yet the manifest remains one truthful song;
 * Awtsmoos.com locks load-write-save as one deed so concurrent chunks cannot erase ranges that belong.
 */
async function writeChunk(config, input = {}) {
	assertWritable(config);
	const transfer = Store.paths(config, input.transferId);
	return Lock.withTransferLock(transfer.directory, async () => writeLocked(config, input));
}

async function writeLocked(config, input) {
	const { transfer, manifest } = await Store.load(config, input.transferId);
	if (manifest.state !== "receiving") {
		throw Policy.fault("transfer_not_receiving");
	}
	const chunkOffset = Policy.offset(input.offset, manifest.totalBytes);
	const expectedSha256 = Policy.sha256(input.sha256 || input.chunkSha256);
	const bytes = decode(input.content64);
	assertChunkBounds(bytes, chunkOffset, manifest);
	const actualSha256 = digest(bytes);
	if (actualSha256 !== expectedSha256) {
		throw Policy.fault("transfer_chunk_hash_mismatch");
	}
	await writePayload(transfer.payload, bytes, chunkOffset);
	Store.mergeRange(manifest, chunkOffset, bytes.length);
	await Store.save(transfer, manifest);
	return result(transfer.id, manifest, chunkOffset, bytes.length, actualSha256);
}

function assertChunkBounds(bytes, chunkOffset, manifest) {
	if (bytes.length > manifest.chunkBytes || bytes.length > Policy.MAX_CHUNK_BYTES) {
		throw Policy.fault("transfer_chunk_too_large");
	}
	if (chunkOffset + bytes.length > manifest.totalBytes) {
		throw Policy.fault("transfer_chunk_out_of_bounds");
	}
	if (!bytes.length && manifest.totalBytes !== 0) {
		throw Policy.fault("empty_transfer_chunk");
	}
}

async function writePayload(file, bytes, chunkOffset) {
	const handle = await fsp.open(file, "r+");
	try {
		if (bytes.length) {
			await handle.write(bytes, 0, bytes.length, chunkOffset);
		}
		await handle.sync();
	} finally {
		await handle.close();
	}
}

function result(transferId, manifest, chunkOffset, byteLength, sha256) {
	return {
		ok: true,
		transferId,
		offset: chunkOffset,
		bytes: byteLength,
		sha256,
		receivedBytes: Store.receivedBytes(manifest),
		nextOffset: Store.nextOffset(manifest),
		complete: Store.completeCoverage(manifest),
		transport: "websocket"
	};
}

function decode(content64) {
	const text = String(content64 || "");
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(text) || text.length % 4 === 1) {
		throw Policy.fault("invalid_chunk_base64");
	}
	return Buffer.from(text, "base64");
}

function digest(buffer) {
	return crypto.createHash("sha256").update(buffer).digest("hex");
}

function assertWritable(config) {
	if (!config.tools.fsWrite) {
		throw Policy.fault("fs_write_disabled");
	}
	if (!config.allowWrite) {
		throw Policy.fault("writes_disabled");
	}
}

module.exports = { assertWritable, decode, digest, writeChunk };
