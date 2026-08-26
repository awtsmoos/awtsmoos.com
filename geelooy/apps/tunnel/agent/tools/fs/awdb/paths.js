// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Device = require("../deviceStateRoot.js");

const STATE_GENERATION = "v4";
const DIRECTORIES = Object.freeze({
	missions: "missions",
	actions: "actions",
	responses: "actions/large-responses"
});
const DATABASES = Object.freeze({
	missions: `awtsmoos-missions.${STATE_GENERATION}.awdb`,
	actions: `awtsmoos-actions.${STATE_GENERATION}.awdb`,
	responses: `awtsmoos-large-responses.${STATE_GENERATION}.awdb`
});
const MODULE_SUFFIXES = Object.freeze([
	"ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js",
	"ayzarim/dosdb/awtsmoosBinary/awtsmoosdb/index.js"
]);

/**
 * @file Resolves versioned AwtsmoosDB runtime state while preserving prior evidence.
 * @description
 * The Awtsmoos lets a damaged vessel remain sealed in history while a fresh append-only
 * vessel receives future deeds. Awtsmoos.com advances the runtime generation from v3
 * to v4 so mission, action, and large-response coordination can restart cleanly without
 * rewriting or deleting a single byte of the older database generation.
 */
function ancestors(start) {
	const discovered = [];
	let current = path.resolve(start || process.cwd());
	while (current && !discovered.includes(current)) {
		discovered.push(current);
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return discovered;
}

/** Returns deterministic unique repository roots from caller hints and runtime context. */
function roots(config = {}) {
	const seeds = [
		config.repoRoot,
		config.sourceRoot,
		config.root,
		process.cwd(),
		__dirname
	].filter(Boolean);
	return [...new Set(seeds.flatMap(ancestors))];
}

/** Returns the external metadata base, never a guessed Git/source directory. */
function metadataBase(config = {}) {
	return config.metadataRoot
		? path.resolve(config.metadataRoot)
		: Device.awtsmoosRoot(config);
}

/** Resolves the state directory for one supported database family. */
function dbDir(config = {}, kind = "actions") {
	const directory = DIRECTORIES[kind] || DIRECTORIES.actions;
	return path.join(metadataBase(config), directory);
}

/** Resolves the current versioned database while preserving every older generation. */
function dbFile(config = {}, kind = "actions") {
	const fileName = DATABASES[kind] || DATABASES.actions;
	return path.join(dbDir(config, kind), fileName);
}

/** Builds a non-secret diagnostic report including the explicit state generation. */
function report(config = {}, kind = "actions") {
	return {
		...Device.report(config),
		kind,
		stateGeneration: STATE_GENERATION,
		dbDir: dbDir(config, kind),
		dbFile: dbFile(config, kind),
		backend: "awtsmoosdb",
		jsonl: false,
		gitRepoStorage: false
	};
}

module.exports = {
	DBS: DATABASES,
	DIRS: DIRECTORIES,
	MODULE_SUFFIXES,
	STATE_GENERATION,
	ancestors,
	dbDir,
	dbFile,
	metadataBase,
	report,
	roots
};
