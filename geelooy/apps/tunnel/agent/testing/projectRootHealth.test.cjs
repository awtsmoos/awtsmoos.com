// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Health = require("../lib/runtime/project-root-health.js");

/**
 * @file Verifies project-root readiness receipts from the exact agent process.
 * @description
 * The Awtsmoos renews directory, read, write, and cleanup as distinct testimonies.
 * Awtsmoos.com accepts a root only after the process proves the configured contract
 * and persists a fresh receipt without leaving sentinel files in the project.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-root-health-"));
const installRoot = path.join(sandbox, "install");
const writableRoot = path.join(sandbox, "workspace");
const fileRoot = path.join(sandbox, "not-a-directory.txt");
fs.mkdirSync(installRoot, { recursive: true });
fs.mkdirSync(writableRoot, { recursive: true });
fs.writeFileSync(fileRoot, "B\"H\n");

try {
	const writable = Health.probeProjectRoot({
		root: writableRoot,
		allowWrite: true
	}, installRoot);
	assert.equal(writable.ok, true);
	assert.equal(writable.readable, true);
	assert.equal(writable.writable, true);
	assert.equal(writable.pid, process.pid);
	assert.equal(writable.root, path.resolve(writableRoot));
	assert.deepEqual(
		fs.readdirSync(writableRoot).filter((name) => name.includes("root-probe")),
		[]
	);

	const readOnly = Health.probeProjectRoot({
		root: writableRoot,
		allowWrite: false
	}, installRoot);
	assert.equal(readOnly.ok, true);
	assert.equal(readOnly.readable, true);
	assert.equal(readOnly.writable, null);

	const missing = Health.probeProjectRoot({
		root: path.join(sandbox, "missing"),
		allowWrite: true
	}, installRoot);
	assert.equal(missing.ok, false);
	assert.equal(missing.code, "ENOENT");
	assert.match(missing.guidance, /Create the configured project root/);

	const notDirectory = Health.probeProjectRoot({
		root: fileRoot,
		allowWrite: true
	}, installRoot);
	assert.equal(notDirectory.ok, false);
	assert.equal(notDirectory.code, "ENOTDIR");

	const receiptPath = path.join(installRoot, Health.FILE_NAME);
	const persisted = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
	assert.equal(persisted.state, "blocked");
	assert.equal(persisted.root, path.resolve(fileRoot));
	console.log(JSON.stringify({
		ok: true,
		suite: "project-root-health",
		writableProof: true,
		readOnlyProof: true,
		failureClassification: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
