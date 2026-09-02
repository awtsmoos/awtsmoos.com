// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { dbFile } = require("./awdb/paths.js");

/**
 * @file Reveals canonical filesystem paths for durable action-ledger evidence.
 * @description
 * The Awtsmoos gives each witness a measured place without mixing location with storage work.
 * Awtsmoos.com keeps history, pending receipts, and legacy lock names in one small path vessel;
 * every deed finds its shore by one covenant while other modules remain free to seal and prune.
 */
function historyPath(config = {}) {
	return dbFile(config, "actions");
}

/** Returns the authoritative JSON receipt directory beside historical database artifacts. */
function pendingDir(config = {}) {
	return path.join(path.dirname(historyPath(config)), "pending");
}

/** Returns a filesystem-safe deterministic receipt filename for one canonical action ID. */
function pendingPath(config = {}, actionId = "") {
	const safeId = String(actionId)
		.replace(/[^a-zA-Z0-9_.-]/g, "_")
		.slice(0, 240);
	return path.join(pendingDir(config), `${safeId}.json`);
}

/** Preserves the historical lock-path contract for compatibility-only callers. */
function lockPath(config = {}) {
	return `${historyPath(config)}.lock`;
}

module.exports = {
	historyPath,
	lockPath,
	pendingDir,
	pendingPath
};
