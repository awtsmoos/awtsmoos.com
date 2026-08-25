// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { dbFile } = require("./awdb/paths.js");
const { retention } = require("./actionLedgerPolicy.js");

/**
 * @file Stores action history as independent durable JSON receipts.
 * @description
 * The Awtsmoos lets evidence survive without making one binary index a gate before
 * every deed. Awtsmoos.com keeps each action in its own atomic receipt, so history
 * remains replayable while optional AwtsmoosDB files stay preserved and untouched.
 */
function historyPath(config = {}) {
	return dbFile(config, "actions");
}

/** Returns the authoritative receipt directory beside preserved historical databases. */
function pendingDir(config = {}) {
	return path.join(path.dirname(historyPath(config)), "pending");
}

/** Returns a filesystem-safe deterministic receipt filename. */
function pendingPath(config = {}, actionId = "") {
	const safeId = String(actionId).replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 240);
	return path.join(pendingDir(config), `${safeId}.json`);
}

/** Persists one exact JSON receipt through fsync, rename, and directory fsync. */
function savePending(config, entry, output) {
	const destination = pendingPath(config, entry.actionId);
	fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o700 });
	const body = Buffer.from(JSON.stringify({ entry: plain(entry), output: plain(output) }), "utf8");
	durableWrite(destination, body);
	prunePending(config, retention(config), Date.now());
	return true;
}

/** Compatibility save now targets the same authoritative JSON receipt. */
function save(config, entry, output) {
	return savePending(config, entry, output);
}

/** Returns newest durable receipt rows without opening AwtsmoosDB. */
function pendingRows(config, limit = 1000) {
	let names = [];
	try {
		names = fs.readdirSync(pendingDir(config)).filter(name => name.endsWith(".json")).sort();
	} catch {
		return [];
	}
	return names.slice(-Math.max(1, limit)).flatMap(name => {
		const file = path.join(pendingDir(config), name);
		try {
			const row = JSON.parse(fs.readFileSync(file, "utf8"));
			return row?.entry?.actionId ? [{ file, row }] : [];
		} catch {
			return [];
		}
	});
}

/** Returns the number of authoritative JSON receipts currently retained. */
function pendingCount(config) {
	return pendingRows(config, Number.MAX_SAFE_INTEGER).length;
}

/** Lists action entries newest-first from durable JSON only. */
async function list(config, limit = 50) {
	const bounded = Math.max(1, Math.min(1000, Number(limit) || 50));
	return pendingRows(config, bounded)
		.map(item => item.row.entry)
		.sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
		.slice(0, bounded);
}

/** Retrieves one complete action receipt directly by canonical action ID. */
async function get(config, actionId) {
	try {
		const row = JSON.parse(fs.readFileSync(pendingPath(config, actionId), "utf8"));
		return row?.entry?.actionId === actionId ? plain(row) : null;
	} catch {
		return null;
	}
}

/** Prunes old/excess JSON receipts according to the existing retention policy. */
function prunePending(config, policy = retention(config), now = Date.now()) {
	const items = pendingRows(config, Number.MAX_SAFE_INTEGER);
	const eligible = items
		.filter(item => now - Date.parse(item.row.entry.createdAt || 0) <= policy.maxAgeMs)
		.sort((left, right) => String(left.row.entry.createdAt).localeCompare(String(right.row.entry.createdAt)))
		.slice(-Math.max(1, policy.maxEntries));
	const keep = new Set(eligible.map(item => item.file));
	for (const item of items) {
		if (!keep.has(item.file)) fs.rmSync(item.file, { force: true });
	}
	return eligible.length;
}

/** Applies retention and reports JSON-only history statistics. */
async function garbageCollect(config, overrides = {}) {
	const policy = retention(config);
	for (const key of ["maxEntries", "maxAgeMs", "maxResultFiles"]) {
		if (Number.isFinite(Number(overrides[key]))) policy[key] = Number(overrides[key]);
	}
	const before = pendingCount(config);
	const after = prunePending(config, policy, Date.now());
	return {
		ok: true,
		action: "actionHistoryGarbageCollect",
		historyBackend: "durable-json-receipts",
		beforeEntries: before,
		afterEntries: after,
		deletedEntries: Math.max(0, before - after),
		policy
	};
}

/** Writes bytes durably without sharing a global database lock. */
function durableWrite(destination, body) {
	const temporary = `${destination}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
	const descriptor = fs.openSync(temporary, "wx", 0o600);
	try {
		fs.writeFileSync(descriptor, body);
		fs.fsyncSync(descriptor);
	} finally {
		fs.closeSync(descriptor);
	}
	fs.renameSync(temporary, destination);
	const directory = fs.openSync(path.dirname(destination), fs.constants.O_RDONLY);
	try {
		fs.fsyncSync(directory);
	} finally {
		fs.closeSync(directory);
	}
}

/** Produces JSON-safe data without retaining proxies or class instances. */
function plain(value) {
	return JSON.parse(JSON.stringify(value ?? null));
}

/** Legacy binary-lock helpers remain harmless compatibility shims. */
function lockPath(config = {}) { return `${historyPath(config)}.lock`; }
function assertUnlocked() { return true; }
function reclaimStaleLock() { return true; }
function processAlive(pid) { try { process.kill(Number(pid), 0); return true; } catch { return false; } }
function pruneRoot(root = {}) { return Object.keys(root.byId || {}).length; }
async function legacyList(config) { return list(config, 1000); }
async function durableList(config) { return list(config, 1000); }
async function durableGet(config, actionId) { return get(config, actionId); }

module.exports = {
	AWDB_HISTORY: "durable-json-receipts",
	assertUnlocked,
	durableGet,
	durableList,
	garbageCollect,
	get,
	historyPath,
	legacyList,
	list,
	lockPath,
	pendingCount,
	pendingPath,
	pendingRows,
	processAlive,
	prunePending,
	pruneRoot,
	reclaimStaleLock,
	save,
	savePending
};
