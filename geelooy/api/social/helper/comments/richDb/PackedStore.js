//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedStore
 * @description Barrel for the rich comment packed store: re-exports the identical surface from the split sibling modules.
 */

	const { FILE, MAX_IMPLICIT_STORE_BYTES, legacyMigrationAllowed, refuseImplicitLegacyMigration, refuseOversizedImplicitStore } = require("./PackedStoreGuard.js");

	const { closeAll, dbFile, open, read, remove, write } = require("./PackedStoreCore.js");

module.exports = { FILE, MAX_IMPLICIT_STORE_BYTES, closeAll, dbFile, legacyMigrationAllowed, open, read, refuseImplicitLegacyMigration, refuseOversizedImplicitStore, remove, write };
