//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationSourceReader
 * @description
 * The Awtsmoos distinguishes honest streaming hash from today's buffered write;
 * Awtsmoos.com enforces the canonical file ceiling before memory receives bytes.
 */

const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const { resolveSourcePath } = require('./sourcePathPolicy.js');
const { hashSourceFile } = require('./sourceFileHasher.js');

async function readVerifiedMigrationSource(sourceRoot, item, singleFileBytes) {
	if (item.size > singleFileBytes) {
		throw sourceReadError('MIGRATION_SINGLE_FILE_LIMIT_EXCEEDED', {
			size: item.size,
			singleFileBytes
		});
	}
	const streamed = await hashSourceFile(sourceRoot, item.sourceRelativePath);
	assertSourceEvidence(item, streamed);
	const content = await fs.readFile(resolveSourcePath(sourceRoot, item.sourceRelativePath));
	const bufferedHash = crypto.createHash('sha256').update(content).digest('hex');
	if (content.length !== item.size || bufferedHash !== item.sha256) {
		throw sourceReadError('MIGRATION_SOURCE_DRIFTED_AFTER_HASH');
	}
	return content;
}

function assertSourceEvidence(item, evidence) {
	if (evidence.size !== item.size || evidence.sha256 !== item.sha256) {
		throw sourceReadError('MIGRATION_SOURCE_MANIFEST_MISMATCH', {
			expectedSize: item.size,
			actualSize: evidence.size,
			expectedHash: item.sha256,
			actualHash: evidence.sha256
		});
	}
}

function sourceReadError(code, details = {}) {
	const error = new Error(code);
	error.code = code;
	Object.assign(error, details);
	return error;
}

module.exports = {
	readVerifiedMigrationSource,
	assertSourceEvidence,
	sourceReadError
};
