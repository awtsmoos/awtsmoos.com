// B"H
// Boruch Hashem
// Blessed is He

const Batch = require("./writeBatchTransaction.js");
const Copy = require("./atomic-file-copy.js");
const Destination = require("./fileTransferDestination.js");
const Finalize = require("./writeBatchTransferFinalize.js");
const Hash = require("./fileTransferHash.js");
const Lock = require("./fileTransferLock.js");
const Policy = require("./fileTransferPolicy.js");
const Store = require("./fileTransferStore.js");

/**
 * @file Commits many verified staged transfers as one rollback-safe filesystem transaction.
 * @description
 * The Awtsmoos gathers many rivers before one shore changes. Awtsmoos.com locks each
 * transfer, proves every staged byte, then publishes all destinations or restores them all.
 */
async function bulkWriteTransfers(config, payload = {}) {
	assertWritable(config);
	const transferIds = normalizeTransferIds(payload.transfers);
	const locks = transferIds
		.map(transferId => Store.paths(config, transferId))
		.sort((left, right) => left.directory.localeCompare(right.directory));
	return withLocks(locks, 0, async () => {
		const staged = await loadAndVerify(config, transferIds);
		const transaction = await Batch.runBatchTransaction(
			config,
			staged.map(item => ({
				path: item.manifest.target,
				transferId: item.manifest.transferId,
				staged: item
			})),
			async target => publishOne(config, target)
		);
		if (!transaction.ok) {
			return {
				...transaction,
				action: "bulkWriteTransfers",
				stagedPreserved: true
			};
		}
		const finalized = await Finalize.finalize(staged);
		return {
			...transaction,
			action: "bulkWriteTransfers",
			stagedPreserved: finalized.payloadsPreserved,
			transferMetadataComplete: finalized.complete,
			metadataWarnings: finalized.warnings
		};
	});
}

async function loadAndVerify(config, transferIds) {
	const staged = [];
	for (const transferId of transferIds) {
		const item = await Store.load(config, transferId);
		const { transfer, manifest } = item;
		if (manifest.state !== "receiving") throw Policy.fault("transfer_not_receiving");
		if (!Store.completeCoverage(manifest)) throw Policy.fault("transfer_incomplete");
		const proof = await Hash.fileSha256(transfer.payload);
		if (proof.bytes !== manifest.totalBytes) throw Policy.fault("transfer_size_mismatch");
		if (proof.sha256 !== manifest.expectedSha256) throw Policy.fault("transfer_final_hash_mismatch");
		Destination.guardedTarget(config, manifest.target);
		staged.push({ ...item, proof });
	}
	return staged;
}

async function publishOne(config, target) {
	const { transfer, manifest, proof } = target.staged;
	const destination = Destination.guardedTarget(config, manifest.target);
	await Destination.ensureDestination(destination, manifest.overwrite);
	return Copy.copyAtomic(transfer.payload, destination, {
		bytes: proof.bytes,
		sha256: proof.sha256
	});
}

async function withLocks(locks, index, operation) {
	if (index >= locks.length) return operation();
	return Lock.withTransferLock(
		locks[index].directory,
		async () => withLocks(locks, index + 1, operation)
	);
}

function normalizeTransferIds(value) {
	if (!Array.isArray(value) || !value.length) throw Policy.fault("missing_transfers");
	if (value.length > 512) throw Policy.fault("too_many_transfers");
	const ids = value.map(item => Policy.id(item?.transferId || item?.id || item));
	if (new Set(ids).size !== ids.length) throw Policy.fault("duplicate_transfer_id");
	return ids;
}

function assertWritable(config) {
	if (!config.tools.fsWrite || !config.tools.fsBulk || !config.allowWrite) {
		throw new Error("Bulk writes disabled.");
	}
}

module.exports = {
	bulkWriteTransfers,
	loadAndVerify,
	normalizeTransferIds
};
