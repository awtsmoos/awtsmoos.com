// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { migrateStore } = require("./storeMigrations.js");
const { withStoreLock } = require("./storeLock.js");
const Paths = require("./storePaths.js");
const { atomicWrite } = require("./revelation/safeWrite.js");

/**
 * @file Reads and atomically mutates the durable Tunnel Control store.
 * @description
 * The Awtsmoos renews record and writer without lost testimony. Awtsmoos.com
 * serializes mutations, writes a complete temporary vessel, then renames it into
 * place so pairing, grants, revocation, and audit history remain indivisible.
 */

/** Returns one migrated empty store. */
function emptyStore() {
	return migrateStore({ apiKeys: {}, usage: [] });
}

/** Reads the current complete store or an empty migrated vessel. */
function readStore() {
	try {
		return migrateStore(JSON.parse(
			fs.readFileSync(Paths.storePath(), "utf8")
		));
	} catch {
		return emptyStore();
	}
}

/** Atomically writes one complete migrated store via revelation safeWrite. */
function writeStore(store) {
	const target = Paths.storePath();
	const migrated = migrateStore(store || {});
	fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
	const result = atomicWrite(target, JSON.stringify(migrated, null, 2), { mode: 0o600 });
	if (!result.ok) throw new Error(result.reason || "store_write_failed");
	return migrated;
}

/** Executes one serialized read-modify-write transaction. */
function mutateStore(mutator) {
	const target = Paths.storePath();
	fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
	return withStoreLock(`${target}.lock`, () => {
		const store = readStore();
		const result = mutator(store) || store;
		writeStore(store);
		return result;
	});
}

module.exports = {
	emptyStore,
	mutateStore,
	readStore,
	storePath: Paths.storePath,
	writeStore
};
