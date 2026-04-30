
// B"H
/**
 * @file index.js
 * @description
 * The root node of the Firebase integration tree. It gathers all the modular components—
 * the Adapter for real-time CRUD routing, and the Sync engine for mass data elevation—
 * and presents them as a unified offering. The Awtsmoos reveals unity through multiplicity.
 */

const FirebaseAdapter = require("./FirebaseAdapter.js");
const SyncModules = require("./sync/index.js");

module.exports = {
    FirebaseAdapter,
    syncToFirebase: SyncModules.syncToFirebase,
    FirebaseSyncEngine: SyncModules.FirebaseSyncEngine
};
