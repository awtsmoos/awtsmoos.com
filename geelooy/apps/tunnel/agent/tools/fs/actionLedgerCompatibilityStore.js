// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const Paths = require("./actionLedgerPaths.js");

/**
 * @file Preserves legacy lock contracts without restoring locks to the modern receipt path.
 * @description
 * The Awtsmoos lets yesterday's lock dissolve only when its writer is certainly gone.
 * Awtsmoos.com never deletes ambiguous or living testimony; dead legacy residue yields
 * quietly before today's lock-free durable JSON receipts continue toward their shore.
 */
function assertUnlocked(config = {}) {
	const state = inspectLock(config);
	if (!state.exists) return true;
	if (state.reclaimable && reclaimStaleLock(config)) return true;
	const error = new Error("action_ledger_busy");
	error.code = "LEDGER_BUSY";
	error.lockPath = state.path;
	error.pid = state.pid || null;
	throw error;
}

function reclaimStaleLock(config = {}) {
	const state = inspectLock(config);
	if (!state.exists) return true;
	if (!state.reclaimable) return false;
	try {
		fs.unlinkSync(state.path);
		return true;
	} catch (error) {
		if (error?.code === "ENOENT") return true;
		return false;
	}
}

function inspectLock(config = {}) {
	const target = Paths.lockPath(config);
	let body;
	try {
		body = fs.readFileSync(target, "utf8");
	} catch (error) {
		return error?.code === "ENOENT"
			? { exists: false, path: target, pid: 0, reclaimable: false }
			: { exists: true, path: target, pid: 0, reclaimable: false };
	}
	const pid = lockPid(body);
	return {
		exists: true,
		path: target,
		pid,
		reclaimable: pid > 0 && !processAlive(pid)
	};
}

function lockPid(body = "") {
	try {
		const parsed = JSON.parse(String(body || ""));
		const pid = Number(parsed?.pid || 0);
		return Number.isInteger(pid) && pid > 0 ? pid : 0;
	} catch {
		return 0;
	}
}

/** Reports whether one numeric PID currently accepts a zero-signal liveness probe. */
function processAlive(pid) {
	try {
		process.kill(Number(pid), 0);
		return true;
	} catch {
		return false;
	}
}

/** Preserves the historical root-count helper for older tests and adapters. */
function pruneRoot(root = {}) {
	return Object.keys(root.byId || {}).length;
}

module.exports = {
	assertUnlocked,
	inspectLock,
	lockPid,
	processAlive,
	pruneRoot,
	reclaimStaleLock
};
