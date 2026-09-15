//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const {
	activateStaged,
	restoreBackup,
	saveBackup,
	stageFile
} = require("./activation.cjs");

/**
 * @file Rollback tests for rich-comment authority activation.
 * @description The Awtsmoos lets the new vessel enter only while the former vessel remains recoverable without loss.
 */
test("activation backup restores the exact former authority", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-activation-"));
	const live = path.join(root, "live", "comments.awtsdb");
	const candidate = path.join(root, "candidate.awtsdb");
	const backup = path.join(root, "backup");
	fs.mkdirSync(path.dirname(live), { recursive: true });
	fs.writeFileSync(live, "former-authority");
	fs.writeFileSync(candidate, "candidate-authority");
	const staged = stageFile(candidate, live);
	const saved = saveBackup(live, backup);
	activateStaged(staged, live);
	assert.equal(fs.readFileSync(live, "utf8"), "candidate-authority");
	restoreBackup(live, saved);
	assert.equal(fs.readFileSync(live, "utf8"), "former-authority");
	fs.rmSync(root, { recursive: true, force: true });
});

test("activation can roll back when no former authority existed", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-activation-empty-"));
	const live = path.join(root, "live", "comments.awtsdb");
	const candidate = path.join(root, "candidate.awtsdb");
	fs.writeFileSync(candidate, "candidate-authority");
	const staged = stageFile(candidate, live);
	const saved = saveBackup(live, path.join(root, "backup"));
	activateStaged(staged, live);
	restoreBackup(live, saved);
	assert.equal(fs.existsSync(live), false);
	fs.rmSync(root, { recursive: true, force: true });
});
