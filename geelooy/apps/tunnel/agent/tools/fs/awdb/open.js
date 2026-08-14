// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const { MODULE_SUFFIXES, roots, dbFile } = require("./paths.js");

const DEFAULT_MISSION_LOCK_WAIT_MS = 250;

/**
 * @file Opens AwtsmoosDB vessels with one small mission-writer mercy window.
 * @description The Awtsmoos keeps exclusive writing absolute while Awtsmoos.com lets
 * two healthy short-lived mission scribes pass in sequence instead of mistaking overlap
 * for corruption. Explicit caller timing remains sovereign and every database still closes.
 */
function modulePath(config = {}) {
	const tried = [];
	for (const root of roots(config)) {
		for (const suffix of MODULE_SUFFIXES) {
			const candidate = path.join(root, suffix);
			tried.push(candidate);
			if (fs.existsSync(candidate)) return candidate;
		}
	}
	const error = new Error(`awtsmoosdb_module_missing: ${tried.join(" | ")}`);
	error.code = "AWTSMOOSDB_MODULE_MISSING";
	throw error;
}

function databaseOptions(kind = "actions", options = {}) {
	const next = { ...options };
	if (kind === "missions" && next.lockWaitMs === undefined) {
		next.lockWaitMs = DEFAULT_MISSION_LOCK_WAIT_MS;
	}
	return next;
}

function open(config = {}, kind = "actions", options = {}) {
	fs.mkdirSync(path.dirname(dbFile(config, kind)), { recursive: true });
	const AwtsmoosDB = require(modulePath(config));
	const database = new AwtsmoosDB(dbFile(config, kind), {
		debug: false,
		...databaseOptions(kind, options)
	});
	database.open();
	return database;
}

function withDb(config, kind, callback, options = {}) {
	const database = open(config, kind, options);
	try {
		return callback(database);
	} finally {
		database.close();
	}
}

module.exports = {
	DEFAULT_MISSION_LOCK_WAIT_MS,
	databaseOptions,
	dbFile,
	modulePath,
	open,
	withDb
};
