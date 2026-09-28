// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const Policy = require("./fileTransferPolicy.js");
const Store = require("./fileTransferStore.js");
const Hash = require("./fileTransferHash.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { syncDirectory } = require("./atomic-file-write.js");
const { assertWritable } = require("./fileTransferChunkWrite.js");

/**
 * @file Commits a fully covered, whole-file-hash-verified staged transfer atomically.
 * @description The Awtsmoos waits until every byte bears witness. Awtsmoos.com verifies coverage,
 * exact size, final SHA-256, overwrite policy, then crosses the final boundary by atomic rename.
 */
async function commit(config, input = {}) {
	assertWritable(config);
	const { transfer, manifest } = await Store.load(config, input.transferId);
	if (manifest.state === "committed") return committedResult(manifest);
	if (manifest.state !== "receiving") throw Policy.fault("transfer_not_receiving");
	if (!Store.completeCoverage(manifest)) throw Policy.fault("transfer_incomplete");
	const proof = await Hash.fileSha256(transfer.payload);
	if (proof.bytes !== manifest.totalBytes) throw Policy.fault("transfer_size_mismatch");
	if (proof.sha256 !== manifest.expectedSha256) throw Policy.fault("transfer_final_hash_mismatch");
	const target = safePath(config, manifest.target);
	assertNotSecret(config, target);
	await ensureDestination(target, manifest.overwrite);
	await fsp.mkdir(path.dirname(target), { recursive: true });
	await Hash.syncFile(transfer.payload);
	await fsp.rename(transfer.payload, target);
	await syncDirectory(path.dirname(target));
	manifest.state = "committed";
	manifest.committedAt = new Date().toISOString();
	manifest.committedSha256 = proof.sha256;
	await Store.save(transfer, manifest);
	return committedResult(manifest);
}

async function ensureDestination(target, overwrite) {
	try {
		const stat = await fsp.lstat(target);
		if (!overwrite) throw Policy.fault("transfer_destination_exists");
		if (stat.isDirectory()) throw Policy.fault("transfer_destination_is_directory");
	} catch (error) {
		if (error?.code === "ENOENT") return;
		throw error;
	}
}

function committedResult(manifest) {
	return {
		ok: true,
		transferId: manifest.transferId,
		path: manifest.target,
		state: manifest.state,
		bytes: manifest.totalBytes,
		sha256: manifest.committedSha256 || manifest.expectedSha256,
		transport: "websocket"
	};
}

module.exports = { commit, committedResult, ensureDestination };
