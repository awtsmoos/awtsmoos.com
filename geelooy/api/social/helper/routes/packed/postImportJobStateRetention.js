// B"H
// Boruch Hashem
// Blessed is He
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 4 * 60 * 60 * 1000;
const INITIAL_DELAY_MS = 60 * 1000;
const TERMINAL_STATUSES = new Set([
	"done", "failed", "cancelled", "absolute-failure"
]);
const cleanupState = new Map();

/**
 * Schedule exactly one best-effort asynchronous retention sweep per root.
 * No metadata scan takes place inside an HTTP request or job checkpoint.
 * @param {string} directory Absolute job-state directory.
 */
function scheduleJobStateCleanup(directory) {
	if (!directory) return;
	const state = cleanupState.get(directory) || {
		lastRun: 0,
		running: false,
		timer: null
	};
	if (state.running || state.timer) return;
	const delay = Math.max(
		INITIAL_DELAY_MS,
		state.lastRun + CLEANUP_INTERVAL_MS - Date.now()
	);
	const timer = setTimeout(async () => {
		state.timer = null;
		state.running = true;
		try {
			await pruneOldJobStates(directory);
		} catch {
			// Retention must never fail a command or import receipt.
		} finally {
			state.lastRun = Date.now();
			state.running = false;
		}
	}, delay);
	timer.unref?.();
	state.timer = timer;
	cleanupState.set(directory, state);
}

/**
 * Prune old terminal states incrementally using nonblocking filesystem I/O.
 * Pending, running, interrupted and paused receipts are preserved.
 * @param {string} directory Job-state directory.
 * @param {object} options Optional test clock and retention duration.
 * @returns {Promise<object>} Aggregate metadata without job contents.
 */
async function pruneOldJobStates(directory, options = {}) {
	const now = options.now ?? Date.now();
	const cutoff = now - (options.retentionMs ?? RETENTION_MS);
	const result = { inspected: 0, deleted: 0, preserved: 0, errors: 0 };
	let handle;
	try {
		handle = await fs.promises.opendir(directory);
	} catch (error) {
		if (error.code === "ENOENT") return result;
		throw error;
	}
	for await (const entry of handle) {
		if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
		result.inspected++;
		const filename = path.join(directory, entry.name);
		try {
			const stats = await fs.promises.stat(filename);
			if (stats.mtimeMs >= cutoff) continue;
			const record = JSON.parse(await fs.promises.readFile(filename, "utf8"));
			if (!TERMINAL_STATUSES.has(record.status)) {
				result.preserved++;
				continue;
			}
			const current = await fs.promises.stat(filename);
			if (current.mtimeMs !== stats.mtimeMs || current.size !== stats.size) {
				result.preserved++;
				continue;
			}
			await fs.promises.unlink(filename);
			result.deleted++;
		} catch (error) {
			if (error.code !== "ENOENT") result.errors++;
		}
		if (result.inspected % 64 === 0) {
			await new Promise(resolve => setImmediate(resolve));
		}
	}
	return result;
}

module.exports = {
	CLEANUP_INTERVAL_MS,
	RETENTION_MS,
	TERMINAL_STATUSES,
	pruneOldJobStates,
	scheduleJobStateCleanup
};
