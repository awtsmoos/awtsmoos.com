// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FamilyInventory
 * @description
 * Each canonical FS3 family is weighed through shared read-only truth. Logical
 * payload, stored bodies, WAL, and verifier evidence remain separate so the
 * Awtsmoos can distinguish healthy compression from reclaimable historical space.
 */

const fs = require('fs');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const store = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/store.js');
const { familyFile } = require('./policy.js');

function plain(value) {
	return value?.__resolve__ ? value.__resolve__() : value;
}

function fileEvidence(file) {
	const status = fs.statSync(file);
	return {
		file,
		dev: Number(status.dev),
		ino: Number(status.ino),
		size: Number(status.size),
		allocatedBytes: Number(status.blocks) * 512,
		mtimeMs: Number(status.mtimeMs)
	};
}

function sidecarBytes(file) {
	try {
		return fs.statSync(file).size;
	} catch {
		return 0;
	}
}

function familyInventory(policy, family, options = {}) {
	const file = familyFile(policy, family);
	const evidence = fileEvidence(file);
	const database = new AwtsmoosDB(file, {
		readOnly: true,
		wal: false,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	database.open();
	try {
		const manifest = store.manifest(database);
		const files = Object.values(manifest.inodes)
			.filter(inode => inode?.type === 'file' && !inode.deleted);
		let logicalBytes = 0;
		let storedBodyBytes = 0;
		for (const inode of files) {
			logicalBytes += Number(inode.size || 0);
			storedBodyBytes += Number(plain(inode.data)?.length || 0);
		}
		const token = plain(database.root.__fs3_manifest__) || {};
		const manifestStoredBytes = Number(
			token.storedBytes
			|| plain(token.blob)?.length
			|| token.bytes
			|| 0
		);
		const overheadBytes = Math.max(4 * 1024 * 1024, files.length * 320);
		const liveEstimateBytes = storedBodyBytes + manifestStoredBytes + overheadBytes;
		const result = {
			...evidence,
			family,
			files: files.length,
			logicalBytes,
			storedBodyBytes,
			manifestStoredBytes,
			liveEstimateBytes,
			reclaimableBytes: Math.max(0, evidence.size - liveEstimateBytes),
			physicalRatio: evidence.size / Math.max(1, liveEstimateBytes),
			walBytes: sidecarBytes(`${file}.wal`)
		};
		if (options.verify === true) result.verification = database.verify();
		return result;
	} finally {
		database.close();
	}
}

module.exports = {
	familyInventory,
	fileEvidence,
	sidecarBytes
};