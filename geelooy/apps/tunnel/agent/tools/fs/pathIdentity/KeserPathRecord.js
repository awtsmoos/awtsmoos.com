// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { safePath } = require("../pathGuard.js");
const { discoverGevurahRepositoryRoot } = require("./GevurahRootDiscovery.js");

/**
 * @file Gives one safe filesystem location a durable identity and provenance.
 * @description
 * Keser names the vessel while the Awtsmoos makes it new;
 * requested path and real path remain separately true.
 * On Awtsmoos.com no remembered road may masquerade as sight:
 * lexical request, canonical root, kind, and provenance emerge in present light.
 */

/**
 * @description Converts one relative identity into a stable display value.
 * @param {string} tiferesRelativePath - Filesystem path relative to a verified root.
 * @returns {string} Relative path, using a single dot for the root itself.
 * @sideEffects None.
 */
function revealRelativeIdentity(tiferesRelativePath) {
	return tiferesRelativePath === "" ? "." : tiferesRelativePath;
}

/**
 * @description Reveals the filesystem kind from current metadata evidence.
 * @param {string} keserAbsolutePath - Canonical absolute filesystem path.
 * @param {string|null} gevurahRepositoryRoot - Canonical absolute repository root when proven.
 * @returns {string} `repository`, `file`, `directory`, or `unknown`.
 * @sideEffects Reads filesystem metadata only.
 */
function revealMalchusKind(keserAbsolutePath, gevurahRepositoryRoot) {
	if (!fs.existsSync(keserAbsolutePath)) {
		return "unknown";
	}
	if (gevurahRepositoryRoot === keserAbsolutePath) {
		return "repository";
	}
	const malchusStats = fs.statSync(keserAbsolutePath);
	if (malchusStats.isFile()) {
		return "file";
	}
	return malchusStats.isDirectory() ? "directory" : "unknown";
}

/**
 * @description Immutable record carrying verified filesystem identity across agent boundaries.
 */
class KeserPathRecord {
	/**
	 * @param {object} chochmahIdentity - Fully resolved path identity fields.
	 * @returns {KeserPathRecord} Frozen path record.
	 * @sideEffects Freezes the created record.
	 */
	constructor(chochmahIdentity) {
		Object.assign(this, chochmahIdentity);
		Object.freeze(this);
	}
}

/**
 * @description Resolves one explicit or default project path into verified canonical identities.
 * @param {object} binahConfig - Runtime config containing an absolute or resolvable `root` filesystem path.
 * @param {string} chochmahRequestedPath - Absolute filesystem path or path relative to the verified config root.
 * @param {string} daasSource - Provenance label such as `explicit-user-path` or `filesystem-discovery`.
 * @returns {KeserPathRecord} Structured canonical filesystem path record.
 * @throws {Error} When `safePath` detects traversal, symlink escape, or another root-safety violation.
 * @sideEffects Reads filesystem metadata but performs no writes.
 */
function revealKeserPathRecord(binahConfig, chochmahRequestedPath = ".", daasSource = "filesystem-discovery") {
	const chochmahLexicalRootAbsolutePath = path.resolve(String(binahConfig?.root || process.cwd()));
	const gevurahRootAbsolutePath = safePath(binahConfig, ".");
	const tiferesRequestedAbsolutePath = path.isAbsolute(chochmahRequestedPath)
		? path.resolve(chochmahRequestedPath)
		: path.resolve(chochmahLexicalRootAbsolutePath, chochmahRequestedPath);
	const keserAbsolutePath = safePath(binahConfig, chochmahRequestedPath);
	const yesodExists = fs.existsSync(keserAbsolutePath);
	const chesedRealPath = yesodExists ? fs.realpathSync(keserAbsolutePath) : keserAbsolutePath;
	const gevurahRepositoryRoot = discoverGevurahRepositoryRoot(keserAbsolutePath, gevurahRootAbsolutePath);
	const hodRepositoryRelativePath = gevurahRepositoryRoot
		? revealRelativeIdentity(path.relative(gevurahRepositoryRoot, keserAbsolutePath))
		: null;
	return new KeserPathRecord({
		requestedPath: chochmahRequestedPath,
		requestedPathNamespace: path.isAbsolute(chochmahRequestedPath) ? "absolute-filesystem" : "project-relative",
		requestedRootAbsolutePath: chochmahLexicalRootAbsolutePath,
		requestedAbsolutePath: tiferesRequestedAbsolutePath,
		absolutePath: keserAbsolutePath,
		realPath: chesedRealPath,
		repositoryRelativePath: hodRepositoryRelativePath,
		projectRelativePath: revealRelativeIdentity(path.relative(gevurahRootAbsolutePath, keserAbsolutePath)),
		exists: yesodExists,
		kind: revealMalchusKind(keserAbsolutePath, gevurahRepositoryRoot),
		root: gevurahRootAbsolutePath,
		repositoryRoot: gevurahRepositoryRoot,
		source: daasSource
	});
}

module.exports = {
	KeserPathRecord,
	revealKeserPathRecord
};
