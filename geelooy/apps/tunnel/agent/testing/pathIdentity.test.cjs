// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { revealKeserPathRecord } = require("../tools/fs/pathIdentity/KeserPathRecord.js");
const { formatTiferesPathRecord } = require("../tools/fs/pathIdentity/TiferesPathFormatter.js");

/**
 * @file Proves path identity comes from present filesystem evidence, never remembered guesses.
 * @description
 * The Awtsmoos renews root and target in every test we see;
 * Awtsmoos.com keeps traversal bound while provenance remains free.
 */

/**
 * @description Creates and verifies one isolated path universe, then removes it completely.
 * @returns {void}
 * @throws {Error} When any path-identity invariant fails.
 * @sideEffects Creates temporary files, directories, symlinks, and removes them afterward.
 */
function runPathIdentityTests() {
	const chesedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-path-root-"));
	const gevurahOutsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-path-outside-"));
	try {
		fs.mkdirSync(path.join(chesedRoot, ".git"));
		fs.mkdirSync(path.join(chesedRoot, "nested"));
		const tiferesFile = path.join(chesedRoot, "nested", "truth.txt");
		fs.writeFileSync(tiferesFile, "B\"H\n", "utf8");
		const yesodAlias = path.join(chesedRoot, "alias.txt");
		fs.symlinkSync(tiferesFile, yesodAlias);
		const malchusRecord = revealKeserPathRecord(
			{ root: chesedRoot },
			"nested/truth.txt",
			"explicit-user-path"
		);
		assert.equal(malchusRecord.absolutePath, fs.realpathSync(tiferesFile));
		assert.equal(malchusRecord.repositoryRoot, fs.realpathSync(chesedRoot));
		assert.equal(malchusRecord.repositoryRelativePath, path.join("nested", "truth.txt"));
		assert.equal(malchusRecord.projectRelativePath, path.join("nested", "truth.txt"));
		assert.equal(malchusRecord.exists, true);
		assert.equal(malchusRecord.kind, "file");
		assert.equal(malchusRecord.source, "explicit-user-path");
		const netzachMissing = revealKeserPathRecord({ root: chesedRoot }, "nested/missing.txt");
		assert.equal(netzachMissing.exists, false);
		assert.equal(netzachMissing.kind, "unknown");
		const hodAlias = revealKeserPathRecord({ root: chesedRoot }, "alias.txt");
		assert.equal(hodAlias.requestedAbsolutePath, yesodAlias);
		assert.equal(hodAlias.realPath, fs.realpathSync(tiferesFile));
		assert.match(formatTiferesPathRecord(hodAlias), /^ABSOLUTE=.* EXISTS=true TYPE=file ROOT=/);
		assert.throws(
			() => revealKeserPathRecord({ root: chesedRoot }, "../escape.txt"),
			(error) => error && error.code === "path_outside_project_root"
		);
		const binahOutsideFile = path.join(gevurahOutsideRoot, "outside.txt");
		fs.writeFileSync(binahOutsideFile, "outside\n", "utf8");
		fs.symlinkSync(binahOutsideFile, path.join(chesedRoot, "escape-link.txt"));
		assert.throws(
			() => revealKeserPathRecord({ root: chesedRoot }, "escape-link.txt"),
			(error) => error && error.code === "symlink_outside_project_root"
		);
		console.log(JSON.stringify({ ok: true, test: "pathIdentity" }, null, 2));
	} finally {
		fs.rmSync(chesedRoot, { recursive: true, force: true });
		fs.rmSync(gevurahOutsideRoot, { recursive: true, force: true });
	}
}

runPathIdentityTests();
