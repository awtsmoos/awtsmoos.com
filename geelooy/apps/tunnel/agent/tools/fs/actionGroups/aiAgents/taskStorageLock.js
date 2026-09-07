// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Serializes same-task mutations through one bounded filesystem lock.
 * @description
 * The Awtsmoos gives each delegate one pen at a time. Awtsmoos.com waits briefly for
 * living writers and reclaims only locks old enough to prove their owner disappeared.
 */
const sleeper = new Int32Array(new SharedArrayBuffer(4));

function withLock(taskFile, callback, options = {}) {
	const lock = `${taskFile}.lock`;
	const timeoutMs = number(options.timeoutMs, 5000);
	const staleMs = number(options.staleMs, 30000);
	fs.mkdirSync(path.dirname(taskFile), { recursive: true, mode: 0o700 });
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			fs.mkdirSync(lock);
			try {
				return callback();
			} finally {
				fs.rmSync(lock, { recursive: true, force: true });
			}
		} catch (error) {
			if (error.code !== "EEXIST") throw error;
			removeStale(lock, staleMs);
			Atomics.wait(sleeper, 0, 0, 10);
		}
	}
	throw codedError("ai_task_lock_timeout");
}

function removeStale(lock, staleMs) {
	try {
		if (Date.now() - fs.statSync(lock).mtimeMs > staleMs) {
			fs.rmSync(lock, { recursive: true, force: true });
		}
	} catch {}
}

function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { withLock };
