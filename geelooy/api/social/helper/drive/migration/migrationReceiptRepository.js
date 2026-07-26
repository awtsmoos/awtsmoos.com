//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationReceiptRepository
 * @description
 * The Awtsmoos guards a migration's durable memory from torn writes and crossed
 * manifests; Awtsmoos.com locks each run before every read-change-write cycle.
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const {
	createMigrationReceipt,
	normalizeMigrationReceipt
} = require('./migrationReceiptShape.js');
const { withMigrationReceiptLock } = require('./migrationReceiptLock.js');
const { writeReceiptFileAtomic } = require('./atomicReceiptFile.js');

class MigrationReceiptRepository {
	constructor(directory, options = {}) {
		this.directory = path.resolve(String(directory || ''));
		this.lockOptions = options.lockOptions || {};
	}

	async read(runId) {
		return readReceiptFile(this.receiptPath(runId));
	}

	async createOrLoad(options) {
		const receiptPath = this.receiptPath(options.runId);
		await this.prepareDirectory();
		return withMigrationReceiptLock(`${receiptPath}.lock`, async () => {
			const existing = await readReceiptFile(receiptPath);
			if (existing) {
				assertManifestFingerprint(existing, options.manifest.fingerprint);
				return existing;
			}
			const receipt = createMigrationReceipt(options);
			await writeReceiptFileAtomic(receiptPath, receipt);
			return receipt;
		}, this.lockOptions);
	}

	async update(runId, manifestFingerprint, mutator) {
		const receiptPath = this.receiptPath(runId);
		await this.prepareDirectory();
		return withMigrationReceiptLock(`${receiptPath}.lock`, async () => {
			const current = await readReceiptFile(receiptPath);
			if (!current) throw receiptRepositoryError('MIGRATION_RECEIPT_NOT_FOUND');
			assertManifestFingerprint(current, manifestFingerprint);
			const changed = await mutator(current) || current;
			changed.updatedAt = new Date().toISOString();
			const normalized = normalizeMigrationReceipt(changed);
			await writeReceiptFileAtomic(receiptPath, normalized);
			return normalized;
		}, this.lockOptions);
	}

	receiptPath(runId) {
		const safeRunId = normalizeRunId(runId);
		return path.join(this.directory, `${safeRunId}.receipt.json`);
	}

	async prepareDirectory() {
		await fs.mkdir(this.directory, { recursive: true, mode: 0o700 });
		await fs.chmod(this.directory, 0o700).catch(() => undefined);
	}
}

async function readReceiptFile(receiptPath) {
	try {
		const value = JSON.parse(await fs.readFile(receiptPath, 'utf8'));
		return normalizeMigrationReceipt(value);
	} catch (error) {
		if (error.code === 'ENOENT') return null;
		throw error;
	}
}

function assertManifestFingerprint(receipt, expected) {
	if (receipt.manifestFingerprint !== String(expected)) {
		throw receiptRepositoryError('MIGRATION_MANIFEST_CONFLICT');
	}
}

function normalizeRunId(value) {
	const runId = String(value || '').trim();
	if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,119}$/.test(runId)) {
		throw receiptRepositoryError('MIGRATION_RUN_ID_INVALID');
	}
	return runId;
}

function receiptRepositoryError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	MigrationReceiptRepository,
	readReceiptFile,
	assertManifestFingerprint,
	normalizeRunId,
	receiptRepositoryError
};
