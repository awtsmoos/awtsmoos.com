// B"H
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
	pruneOldJobStates,
	scheduleJobStateCleanup,
	RETENTION_MS,
	CLEANUP_INTERVAL_MS
} = require("./postImportJobStateRetention.js");

/** Create a disposable durable state record with controlled modification age. */
function record(directory, name, status, ageMs = 0) {
	const filename = path.join(directory, name + ".json");
	fs.writeFileSync(filename, JSON.stringify({ id: name, status }));
	const time = new Date(Date.now() - ageMs);
	fs.utimesSync(filename, time, time);
	return filename;
}

test("cleanup only removes expired terminal records", async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-job-retention-"));
	try {
		const expired = RETENTION_MS + 60000;
		const complete = record(directory, "completed", "done", expired);
		const failed = record(directory, "failed", "absolute-failure", expired);
		const running = record(directory, "running", "running", expired);
		const queued = record(directory, "queued", "queued", expired);
		const interrupted = record(directory, "interrupted", "interrupted", expired);
		const paused = record(directory, "paused", "paused", expired);
		const fresh = record(directory, "fresh", "done", 1000);
		const invalid = path.join(directory, "damaged.json");
		fs.writeFileSync(invalid, "invalid-json");
		const oldTime = new Date(Date.now() - expired);
		fs.utimesSync(invalid, oldTime, oldTime);

		const outcome = await pruneOldJobStates(directory);
		assert.equal(outcome.deleted, 2);
		assert.equal(outcome.errors, 1);
		for (const filename of [complete, failed]) {
			assert.equal(fs.existsSync(filename), false);
		}
		for (const filename of [running, queued, interrupted, paused, fresh, invalid]) {
			assert.equal(fs.existsSync(filename), true);
		}
		assert.ok(CLEANUP_INTERVAL_MS >= 60 * 60 * 1000);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test("scheduling cleanup performs no synchronous metadata traversal", () => {
	const directory = path.join(os.tmpdir(), "awts-job-retention-schedule-" + process.pid);
	const originalReadDir = fs.readdirSync;
	const originalStat = fs.statSync;
	try {
		fs.readdirSync = () => { throw Error("synchronous_directory_scan"); };
		fs.statSync = () => { throw Error("synchronous_stat_scan"); };
		assert.doesNotThrow(() => scheduleJobStateCleanup(directory));
		assert.doesNotThrow(() => scheduleJobStateCleanup(directory));
	} finally {
		fs.readdirSync = originalReadDir;
		fs.statSync = originalStat;
	}
});
