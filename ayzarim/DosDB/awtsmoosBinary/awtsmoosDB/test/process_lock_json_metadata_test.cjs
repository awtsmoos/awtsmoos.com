// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const WritableProcessLock = require("../core/writableProcessLock.js");

test("plain JSON process locks never enter binary corruption diagnostics", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-lock-json-"));
	const databasePath = path.join(root, "test.awdb");
	const originalWarn = console.warn;
	const warnings = [];
	console.warn = (...values) => warnings.push(values);
	try {
		for (let index = 0; index < 8; index += 1) {
			const lock = new WritableProcessLock(databasePath);
			assert.equal(lock.acquire(), true);
			assert.equal(fs.existsSync(`${databasePath}.lock`), true);
			lock.release();
			assert.equal(fs.existsSync(`${databasePath}.lock`), false);
		}
		assert.equal(warnings.length, 0);
	} finally {
		console.warn = originalWarn;
		fs.rmSync(root, { recursive: true, force: true });
	}
});
