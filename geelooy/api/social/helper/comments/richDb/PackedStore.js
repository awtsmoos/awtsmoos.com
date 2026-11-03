//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedStore
 * @description Barrel for the rich comment packed store: re-exports the identical surface from the split sibling modules.
 */

	const { FILE, MAX_IMPLICIT_STORE_BYTES, legacyMigrationAllowed, oversizedStoreHardLimitBytes, refuseImplicitLegacyMigration, refuseOversizedImplicitStore, resetOversizedStoreWarnings } = require("./PackedStoreGuard.js");

	const { batch, beginBatch, closeAll, dbFile, endBatch, open, read, remove, write, writeMany } = require("./PackedStoreCore.js");

module.exports = { FILE, MAX_IMPLICIT_STORE_BYTES, batch, beginBatch, closeAll, dbFile, endBatch, legacyMigrationAllowed, open, oversizedStoreHardLimitBytes, read, refuseImplicitLegacyMigration, refuseOversizedImplicitStore, remove, resetOversizedStoreWarnings, write, writeMany };
