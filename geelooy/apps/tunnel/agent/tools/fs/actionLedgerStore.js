// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const { retention } = require("./actionLedgerPolicy.js");
const Compatibility = require("./actionLedgerCompatibilityStore.js");
const Paths = require("./actionLedgerPaths.js");
const Receipt = require("./actionLedgerReceiptStore.js");
const Retention = require("./actionLedgerRetentionStore.js");

/**
 * @file Coordinates exact durable receipts with amortized history retention.
 * @description
 * The Awtsmoos seals each deed before returning it to the world, while Awtsmoos.com
 * gives pruning, paths, and compatibility their own vessels. The coordinator stays small:
 * receipt truth arrives immediately, archive maintenance walks by cadence and overflow,
 * and every old public name still reaches the same faithful shore.
 */
function savePending(config, entry, output) {
	Receipt.write(Paths.pendingPath(config, entry.actionId), entry, output);
	Retention.afterWrite(Paths.pendingDir(config), retention(config), Date.now());
	return true;
}

function save(config, entry, output) {
	return savePending(config, entry, output);
}

function pendingRows(config, limit = 1000) {
	return Retention.rows(Paths.pendingDir(config), limit);
}

function pendingCount(config) {
	return pendingRows(config, Number.MAX_SAFE_INTEGER).length;
}

async function list(config, limit = 50) {
	const bounded = Math.max(1, Math.min(1000, Number(limit) || 50));
	return pendingRows(config, bounded)
		.map(item => item.row.entry)
		.sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
		.slice(0, bounded);
}

async function get(config, actionId) {
	try {
		const body = fs.readFileSync(Paths.pendingPath(config, actionId), "utf8");
		const row = JSON.parse(body);
		return row?.entry?.actionId === actionId ? Receipt.plain(row) : null;
	} catch {
		return null;
	}
}

function prunePending(config, policy = retention(config), now = Date.now()) {
	return Retention.prune(Paths.pendingDir(config), policy, now, false);
}

async function garbageCollect(config, overrides = {}) {
	const policy = retention(config);
	applyOverrides(policy, overrides);
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

function applyOverrides(policy, overrides) {
	for (const key of ["maxEntries", "maxAgeMs", "maxResultFiles"]) {
		if (Number.isFinite(Number(overrides[key]))) {
			policy[key] = Number(overrides[key]);
		}
	}
}

async function legacyList(config) {
	return list(config, 1000);
}

async function durableList(config) {
	return list(config, 1000);
}

async function durableGet(config, actionId) {
	return get(config, actionId);
}

module.exports = {
	AWDB_HISTORY: "durable-json-receipts",
	assertUnlocked: Compatibility.assertUnlocked,
	durableGet,
	durableList,
	garbageCollect,
	get,
	historyPath: Paths.historyPath,
	legacyList,
	list,
	lockPath: Paths.lockPath,
	pendingCount,
	pendingPath: Paths.pendingPath,
	pendingRows,
	processAlive: Compatibility.processAlive,
	prunePending,
	pruneRoot: Compatibility.pruneRoot,
	reclaimStaleLock: Compatibility.reclaimStaleLock,
	save,
	savePending
};
