//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationDestinationSnapshot
 * @description
 * The Awtsmoos preserves only the metadata needed to witness an overwrite;
 * Awtsmoos.com records no secret and no unrelated neighboring state in receipts.
 */

function snapshotMigrationDestination(entry) {
	if (!entry) return null;
	return {
		path: entry.path,
		type: entry.type,
		ownerAlias: entry.ownerAlias,
		objectHash: entry.objectHash,
		size: Number(entry.size || 0),
		mime: entry.mime,
		visibility: entry.visibility,
		cachePolicy: entry.cachePolicy,
		createdAt: entry.createdAt,
		updatedAt: entry.updatedAt,
		trashedAt: entry.trashedAt || null
	};
}

module.exports = {
	snapshotMigrationDestination
};
