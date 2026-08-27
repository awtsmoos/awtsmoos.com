//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationImportSupport
 * @description
 * The Awtsmoos shapes canonical write inputs and keeps failure receipts free of
 * secrets; Awtsmoos.com records only stable codes and destination evidence issues.
 */

function createMigrationWriteOptions(options, item, content) {
	return {
		aliasId: options.aliasId,
		path: item.destinationPath,
		content,
		mime: item.mime,
		visibility: item.visibility,
		cachePolicy: item.cachePolicy,
		actorUserId: options.actorUserId,
		credentialId: options.credentialId,
		requestId: `${options.requestId || options.runId}:${item.destinationPath}`,
		$i: options.$i
	};
}

function serializeMigrationError(error) {
	return {
		code: String(error?.code || 'MIGRATION_ITEM_FAILED'),
		issues: Array.from(error?.verification?.issues || []).map(String)
	};
}

module.exports = {
	createMigrationWriteOptions,
	serializeMigrationError
};
