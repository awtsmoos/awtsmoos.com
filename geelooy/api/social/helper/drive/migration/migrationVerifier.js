//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationVerifier
 * @description
 * The Awtsmoos requires destination matter to answer every manifest claim;
 * Awtsmoos.com trusts no completed label without metadata and physical evidence.
 */

const { getDriveEntry } = require('../queryService.js');
const { statObject } = require('../objectRepository.js');

async function verifyMigrationDestination(options, dependencies = {}) {
	const readEntry = dependencies.getEntry || getDriveEntry;
	const inspectObject = dependencies.statObject || statObject;
	const entry = await readEntry({
		aliasId: options.aliasId,
		path: options.item.destinationPath,
		includeTrash: true,
		$i: options.$i
	});
	const issues = metadataIssues(entry, options.item);
	let physicalSize = null;
	if (entry?.objectHash) {
		try {
			physicalSize = (await inspectObject(
				options.aliasId,
				entry.objectHash,
				options.$i
			)).size;
			if (physicalSize !== options.item.size) issues.push('PHYSICAL_SIZE_MISMATCH');
		} catch (error) {
			if (error.code !== 'ENOENT') throw error;
			issues.push('PHYSICAL_OBJECT_MISSING');
		}
	}
	return {
		healthy: issues.length === 0,
		issues,
		entry,
		physicalSize
	};
}

function metadataIssues(entry, item) {
	if (!entry || entry.trashedAt) return ['DESTINATION_MISSING'];
	const issues = [];
	if (entry.type !== 'file') issues.push('DESTINATION_NOT_FILE');
	if (entry.objectHash !== item.sha256) issues.push('METADATA_HASH_MISMATCH');
	if (Number(entry.size) !== item.size) issues.push('LOGICAL_SIZE_MISMATCH');
	if (entry.visibility !== item.visibility) issues.push('VISIBILITY_MISMATCH');
	if (entry.cachePolicy !== item.cachePolicy) issues.push('CACHE_POLICY_MISMATCH');
	return issues;
}

function assertVerifiedDestination(result) {
	if (result.healthy) return result;
	const error = new Error('MIGRATION_DESTINATION_VERIFICATION_FAILED');
	error.code = 'MIGRATION_DESTINATION_VERIFICATION_FAILED';
	error.verification = result;
	throw error;
}

module.exports = {
	verifyMigrationDestination,
	metadataIssues,
	assertVerifiedDestination
};
