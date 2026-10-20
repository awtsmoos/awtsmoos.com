//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module ConnectedPostMigration
 * @description Barrel for the connected-post migrator: re-exports the identical surface from the split sibling modules.
 */

	const { existingAllPostState, packedPostKey, scanConnectedPosts } = require('./postMigrationScan.js');
	const { dryRunPostMigration, mirrorConnectedPostToAllPosts, runPostMigration } = require('./postMigrationWrite.js');

module.exports = { packedPostKey, scanConnectedPosts, dryRunPostMigration, runPostMigration, mirrorConnectedPostToAllPosts, existingAllPostState };
