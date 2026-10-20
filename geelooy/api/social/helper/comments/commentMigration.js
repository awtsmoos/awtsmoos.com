//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentMigration
 * @description Barrel for comment migration: re-exports the identical surface from the split sibling modules.
 */

	const { migrateParentCommentsToAwtsmoosDb } = require("./commentMigrationCopy.js");

	const { compactReport } = require("./commentMigrationReport.js");

module.exports = { migrateParentCommentsToAwtsmoosDb, compactReport };
