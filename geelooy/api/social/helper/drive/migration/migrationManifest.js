//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationManifest
 * @description
 * The Awtsmoos gathers scattered files into one deterministic testimony;
 * Awtsmoos.com fingerprints only canonical relative truth, never local paths.
 */

const crypto = require('node:crypto');
const { mapWithConcurrency } = require('../boundedConcurrency.js');
const { normalizeSourceRelativePath } = require('./sourcePathPolicy.js');
const { scanSourceTree } = require('./sourceTreeScanner.js');
const { hashSourceFile } = require('./sourceFileHasher.js');
const { classifyMigrationItem } = require('./migrationItemPolicy.js');

const MANIFEST_VERSION = 1;
const HASH_ALGORITHM = 'sha256';

async function createMigrationManifest(sourceRoot, options = {}) {
	const scanned = await scanSourceTree(sourceRoot);
	const items = await mapWithConcurrency(
		scanned,
		options.concurrency || 4,
		async scannedItem => {
			const hashed = await hashSourceFile(
				sourceRoot,
				scannedItem.sourceRelativePath,
				options.hashOptions
			);
			const policy = options.classifyItem
				? await options.classifyItem(hashed.sourceRelativePath)
				: classifyMigrationItem(hashed.sourceRelativePath);
			return { ...hashed, ...policy };
		}
	);
	return buildMigrationManifest(items, options);
}

function buildMigrationManifest(items, options = {}) {
	const canonicalItems = Array.from(items || [])
		.map(normalizeManifestItem)
		.sort((left, right) => compareText(left.sourceRelativePath, right.sourceRelativePath));
	const manifest = {
		manifestVersion: MANIFEST_VERSION,
		hashAlgorithm: HASH_ALGORITHM,
		generatedAt: options.generatedAt || new Date().toISOString(),
		items: canonicalItems,
		totals: manifestTotals(canonicalItems),
		warnings: Array.from(options.warnings || []).map(String),
		rejectedNodes: Array.from(options.rejectedNodes || [])
	};
	manifest.fingerprint = fingerprintManifest(manifest);
	return manifest;
}

function normalizeManifestItem(item) {
	const sourceRelativePath = normalizeSourceRelativePath(item.sourceRelativePath);
	const destinationPath = normalizeSourceRelativePath(
		item.destinationPath || sourceRelativePath
	);
	const size = Number(item.size);
	const sha256 = String(item.sha256 || '').toLowerCase();
	if (!Number.isSafeInteger(size) || size < 0) throw manifestError('MANIFEST_SIZE_INVALID');
	if (!/^[a-f0-9]{64}$/.test(sha256)) throw manifestError('MANIFEST_HASH_INVALID');
	return {
		sourceRelativePath,
		destinationPath,
		size,
		sha256,
		mime: String(item.mime || 'application/octet-stream'),
		visibility: item.visibility === 'private' ? 'private' : 'public',
		cachePolicy: item.cachePolicy === 'immutable' ? 'immutable' : 'mutable',
		warnings: Array.from(item.warnings || []).map(String)
	};
}

function fingerprintManifest(manifest) {
	const canonical = {
		manifestVersion: Number(manifest.manifestVersion || MANIFEST_VERSION),
		hashAlgorithm: String(manifest.hashAlgorithm || HASH_ALGORITHM),
		items: Array.from(manifest.items || []).map(normalizeManifestItem)
			.sort((left, right) => compareText(left.sourceRelativePath, right.sourceRelativePath))
	};
	return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

function manifestTotals(items) {
	return {
		fileCount: items.length,
		byteCount: items.reduce((total, item) => total + item.size, 0)
	};
}

function compareText(left, right) {
	return left < right ? -1 : left > right ? 1 : 0;
}

function manifestError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	MANIFEST_VERSION,
	HASH_ALGORITHM,
	createMigrationManifest,
	buildMigrationManifest,
	fingerprintManifest,
	manifestTotals,
	normalizeManifestItem
};
