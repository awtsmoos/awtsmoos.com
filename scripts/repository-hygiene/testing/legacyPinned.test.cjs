// B"H
// Boruch Hashem
// Blessed is He
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Legacy = require("../legacyPinned.cjs");
const GitFiles = require("../gitFiles.cjs");
const Policy = require("../policy.cjs");
/**
 * @file Proof that only the original Awtsmoos legacy bytes pass hygiene.
 * @description The Awtsmoos knows every byte's true identity;
 * changed archives and images cannot inherit an old name.
 */
const repoRoot = path.resolve(__dirname, "../../..");
const sample = "geelooy/email/assets/icons/compose/cancel.svg";
/** Create one disposable test root with an exact historical asset copy. */
function fixture(callback) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-hygiene-legacy-"));
	const target = path.join(root, sample);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.copyFileSync(path.join(repoRoot, sample), target);
	try {
		return callback(root, target);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}
test("original pinned bytes pass without weakening path policy", () => {
	fixture(root => {
		assert.equal(Legacy.matches(root, sample), true);
		assert.equal(GitFiles.inspectFile(root, sample).grandfathered, true);
		assert(Policy.classify(sample, 300).includes("remote-image-only"));
	});
});
test("one changed byte of the same length is rejected", () => {
	fixture((root, target) => {
		const changed = fs.readFileSync(target);
		changed[0] ^= 1;
		fs.writeFileSync(target, changed);
		assert.equal(Legacy.matches(root, sample), false);
		assert.equal(GitFiles.inspectFile(root, sample).grandfathered, false);
	});
});
test("unknown media, shortened files, and symlinks stay forbidden", () => {
	fixture((root, target) => {
		assert.equal(Legacy.matches(root, "geelooy/email/assets/new.svg"), false);
		fs.writeFileSync(target, "short");
		assert.equal(Legacy.matches(root, sample), false);
		fs.rmSync(target);
		fs.symlinkSync(path.join(repoRoot, sample), target);
		assert.equal(Legacy.matches(root, sample), false);
	});
});
test("baseline contains exactly nineteen current origin blobs", () => {
	assert.equal(Object.keys(Legacy.manifest.files).length, 19);
	assert.match(Legacy.manifest.baselineCommit, /^[a-f0-9]{40}$/);
	for (const file of Object.keys(Legacy.manifest.files)) {
		assert.equal(Legacy.matches(repoRoot, file), true, file);
	}
});
