// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const Destination = require("./fileTransferDestination.js");
const Hash = require("./fileTransferHash.js");
const Lock = require("./fileTransferLock.js");
const Policy = require("./fileTransferPolicy.js");
const Store = require("./fileTransferStore.js");
const { syncDirectory } = require("./atomic-file-write.js");
const { assertWritable } = require("./fileTransferChunkWrite.js");

/**
 * @file Commits complete transfers under the same lock as chunk mutation and recovers interrupted commits.
 * @description The Awtsmoos joins every proven byte before the final crossing is made;
 * Awtsmoos.com records committing intent, then can prove the destination after a crash instead of leaving truth frayed.
 */
async function commit(config, input = {}) {
	assertWritable(config);
	const transfer = Store.paths(config, input.transferId);
	return Lock.withTransferLock(transfer.directory, async () => commitLocked(config, input));
}

async function commitLocked(config, input) {
	const { transfer, manifest } = await Store.load(config, input.transferId);
	if (manifest.state === "committed") {
		return committedResult(manifest);
	}
	const target = Destination.guardedTarget(config, manifest.target);
	if (manifest.state === "committing") {
		return recoverCommit(transfer, manifest, target);
	}
	if (manifest.state !== "receiving") {
		throw Policy.fault("transfer_not_receiving");
	}
	if (!Store.completeCoverage(manifest)) {
		throw Policy.fault("transfer_incomplete");
	}
	const proof = await Hash.fileSha256(transfer.payload);
	assertFinalProof(proof, manifest);
	await Destination.ensureDestination(target, manifest.overwrite);
	await fsp.mkdir(path.dirname(target), { recursive: true });
	await Hash.syncFile(transfer.payload);
	manifest.state = "committing";
	manifest.committingAt = new Date().toISOString();
	await Store.save(transfer, manifest);
	await fsp.rename(transfer.payload, target);
	await syncDirectory(path.dirname(target));
	return finishCommit(transfer, manifest, proof.sha256);
}

async function recoverCommit(transfer, manifest, target) {
	if (fs.existsSync(transfer.payload)) {
		const proof = await Hash.fileSha256(transfer.payload);
		assertFinalProof(proof, manifest);
		await Destination.ensureDestination(target, manifest.overwrite);
		await fsp.rename(transfer.payload, target);
		await syncDirectory(path.dirname(target));
		return finishCommit(transfer, manifest, proof.sha256);
	}
	const proof = await Hash.fileSha256(target);
	assertFinalProof(proof, manifest);
	return finishCommit(transfer, manifest, proof.sha256);
}

async function finishCommit(transfer, manifest, sha256) {
	manifest.state = "committed";
	manifest.committedAt = new Date().toISOString();
	manifest.committedSha256 = sha256;
	await Store.save(transfer, manifest);
	return committedResult(manifest);
}

function assertFinalProof(proof, manifest) {
	if (proof.bytes !== manifest.totalBytes) {
		throw Policy.fault("transfer_size_mismatch");
	}
	if (proof.sha256 !== manifest.expectedSha256) {
		throw Policy.fault("transfer_final_hash_mismatch");
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

module.exports = { commit, committedResult };
