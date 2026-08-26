// B"H
// Boruch Hashem
// Blessed is He

const fileSystem = require("node:fs");
const path = require("node:path");
const { MODULE_SUFFIXES, roots, dbFile } = require("./paths.js");

const DEFAULT_MISSION_LOCK_WAIT_MS = 250;
const activeDatabases = new Map();

/**
 * @file Opens append-only tunnel runtime AwtsmoosDB vessels with safe process reentrancy.
 * @description
 * The Awtsmoos lets runtime truth favor stability over reclaiming old chambers.
 * Awtsmoos.com explicitly disables free-space reuse for mission, action, and response
 * stores so no live structural root can be recycled during concurrent control work.
 */
function modulePath(config = {}) {
	const tried = [];
	for (const root of roots(config)) {
		for (const suffix of MODULE_SUFFIXES) {
			const candidate = path.join(root, suffix);
			tried.push(candidate);
			if (fileSystem.existsSync(candidate)) return candidate;
		}
	}
	const error = new Error(`awtsmoosdb_module_missing: ${tried.join(" | ")}`);
	error.code = "AWTSMOOSDB_MODULE_MISSING";
	throw error;
}

/**
 * Returns stability-first database options for short-lived tunnel runtime stores.
 * Explicit caller values are preserved except free-space reuse, which is always disabled.
 */
function databaseOptions(kind = "actions", options = {}) {
	const next = {
		...options,
		reuseFreedSpace: false
	};
	if (kind === "missions" && next.lockWaitMs === undefined) {
		next.lockWaitMs = DEFAULT_MISSION_LOCK_WAIT_MS;
	}
	return next;
}

/** Opens one new database engine with append-only runtime allocation semantics. */
function open(config = {}, kind = "actions", options = {}) {
	const file = dbFile(config, kind);
	fileSystem.mkdirSync(path.dirname(file), { recursive: true });
	const AwtsmoosDB = require(modulePath(config));
	const database = new AwtsmoosDB(file, {
		debug: false,
		...databaseOptions(kind, options)
	});
	database.open();
	return database;
}

/** Reuses one active same-file database for synchronous nested operations. */
function withDb(config, kind, callback, options = {}) {
	const key = path.resolve(dbFile(config, kind));
	const active = activeDatabases.get(key);
	if (active) return withActive(active, callback, options);
	const database = open(config, kind, options);
	const entry = { database, depth: 1, key };
	activeDatabases.set(key, entry);
	try {
		return callback(database);
	} finally {
		activeDatabases.delete(key);
		database.close();
	}
}

/** Reuses one outer engine and rejects write escalation through a read-only vessel. */
function withActive(entry, callback, options = {}) {
	const wantsWrite = options.readOnly !== true;
	if (entry.database.options?.readOnly === true && wantsWrite) {
		const error = new Error("B\"H nested writable AWDB call cannot reuse a read-only database");
		error.code = "AWTSMOOSDB_REENTRANT_WRITE_REQUIRES_WRITER";
		throw error;
	}
	entry.depth += 1;
	try {
		return callback(entry.database);
	} finally {
		entry.depth -= 1;
	}
}

/** Returns non-sensitive process-local reentrancy evidence for diagnostics. */
function activeStatus() {
	return [...activeDatabases.values()].map(entry => ({
		file: entry.key,
		depth: entry.depth,
		readOnly: entry.database.options?.readOnly === true,
		reuseFreedSpace: entry.database.options?.reuseFreedSpace
	}));
}

module.exports = {
	DEFAULT_MISSION_LOCK_WAIT_MS,
	activeStatus,
	databaseOptions,
	dbFile,
	modulePath,
	open,
	withDb
};
