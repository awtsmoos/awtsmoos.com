// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const Hash = require("./fileTransferHash.js");
const Policy = require("./fileTransferPolicy.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * @file Reads bounded source chunks and streaming whole-file proof for WebSocket transfer.
 * @description The Awtsmoos reveals one measured fragment at a time and one final source witness;
 * Awtsmoos.com never loads an enormous file into memory merely to prove its size and SHA-256.
 */
async function readChunk(config, input = {}) {
	if (!config.tools.fsRead) throw Policy.fault("fs_read_disabled");
	const source = String(input.path || input.p || "");
	const full = guardedPath(config, source);
	const stat = await fsp.stat(full);
	if (!stat.isFile()) throw Policy.fault("transfer_source_not_file");
	const totalBytes = Policy.totalBytes(stat.size);
	const offset = Policy.offset(input.offset, totalBytes);
	const requested = Policy.chunkBytes(input.maxBytes || input.chunkBytes);
	const length = Math.min(requested, totalBytes - offset);
	const buffer = Buffer.alloc(length);
	const handle = await fsp.open(full, "r");
	let bytesRead = 0;
	try {
		if (length) ({ bytesRead } = await handle.read(buffer, 0, length, offset));
	} finally {
		await handle.close();
	}
	const bytes = buffer.subarray(0, bytesRead);
	return {
		path: source,
		offset,
		returnedBytes: bytes.length,
		totalBytes,
		sha256: digest(bytes),
		content64: bytes.toString("base64"),
		nextOffset: offset + bytes.length,
		eof: offset + bytes.length >= totalBytes,
		transport: "websocket"
	};
}

async function sourceInfo(config, input = {}) {
	if (!config.tools.fsRead) throw Policy.fault("fs_read_disabled");
	const source = String(input.path || input.p || "");
	const full = guardedPath(config, source);
	const stat = await fsp.stat(full);
	if (!stat.isFile()) throw Policy.fault("transfer_source_not_file");
	return { path: source, totalBytes: Policy.totalBytes(stat.size), mtimeMs: stat.mtimeMs };
}

async function sourceProof(config, input = {}) {
	const info = await sourceInfo(config, input);
	const full = guardedPath(config, info.path);
	const proof = await Hash.fileSha256(full);
	return { ...info, bytes: proof.bytes, sha256: proof.sha256, transport: "websocket" };
}

function guardedPath(config, source) {
	const full = safePath(config, source);
	assertNotSecret(config, full);
	return full;
}
function digest(buffer) { return crypto.createHash("sha256").update(buffer).digest("hex"); }

module.exports = { digest, readChunk, sourceInfo, sourceProof };
