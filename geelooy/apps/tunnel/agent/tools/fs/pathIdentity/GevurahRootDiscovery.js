// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Reveals repository roots without crossing the configured filesystem vessel.
 * @description
 * Gevurah draws the border, then truth may glow;
 * the Awtsmoos renews every path we can know.
 * Awtsmoos.com may discover a root in the light,
 * but never trespass beyond the permitted site.
 */

/**
 * @description Tests whether one canonical filesystem path remains inside a canonical root.
 * @param {string} gevurahRootAbsolutePath - Canonical absolute filesystem root.
 * @param {string} chochmahCandidateAbsolutePath - Canonical absolute filesystem candidate.
 * @returns {boolean} True when the candidate is the root or one of its descendants.
 * @sideEffects None.
 */
function isWithinGevurahRoot(gevurahRootAbsolutePath, chochmahCandidateAbsolutePath) {
	const tiferesRelativePath = path.relative(gevurahRootAbsolutePath, chochmahCandidateAbsolutePath);
	return tiferesRelativePath === "" || (
		!tiferesRelativePath.startsWith(`..${path.sep}`) &&
		tiferesRelativePath !== ".." &&
		!path.isAbsolute(tiferesRelativePath)
	);
}

/**
 * @description Finds the nearest existing directory at or above one canonical candidate.
 * @param {string} keserAbsolutePath - Canonical absolute filesystem candidate, possibly nonexistent.
 * @param {string} gevurahRootAbsolutePath - Canonical absolute filesystem safety root.
 * @returns {string} Existing absolute filesystem directory inside the root.
 * @sideEffects Reads filesystem metadata only.
 */
function revealExistingDirectory(keserAbsolutePath, gevurahRootAbsolutePath) {
	let binahCurrentAbsolutePath = keserAbsolutePath;
	while (!fs.existsSync(binahCurrentAbsolutePath)) {
		const gevurahParentAbsolutePath = path.dirname(binahCurrentAbsolutePath);
		if (!isWithinGevurahRoot(gevurahRootAbsolutePath, gevurahParentAbsolutePath)) {
			return gevurahRootAbsolutePath;
		}
		binahCurrentAbsolutePath = gevurahParentAbsolutePath;
	}
	const malchusStats = fs.statSync(binahCurrentAbsolutePath);
	return malchusStats.isDirectory()
		? binahCurrentAbsolutePath
		: path.dirname(binahCurrentAbsolutePath);
}

/**
 * @description Discovers the nearest repository marker without looking above the verified root.
 * @param {string} keserAbsolutePath - Canonical absolute filesystem path whose repository is sought.
 * @param {string} gevurahRootAbsolutePath - Canonical absolute filesystem boundary for discovery.
 * @returns {string|null} Canonical absolute repository root, or null when none is proven in-bounds.
 * @sideEffects Reads filesystem metadata only.
 */
function discoverGevurahRepositoryRoot(keserAbsolutePath, gevurahRootAbsolutePath) {
	let binahDirectoryAbsolutePath = revealExistingDirectory(keserAbsolutePath, gevurahRootAbsolutePath);
	while (isWithinGevurahRoot(gevurahRootAbsolutePath, binahDirectoryAbsolutePath)) {
		if (fs.existsSync(path.join(binahDirectoryAbsolutePath, ".git"))) {
			return binahDirectoryAbsolutePath;
		}
		if (binahDirectoryAbsolutePath === gevurahRootAbsolutePath) {
			return null;
		}
		binahDirectoryAbsolutePath = path.dirname(binahDirectoryAbsolutePath);
	}
	return null;
}

module.exports = {
	discoverGevurahRepositoryRoot,
	isWithinGevurahRoot
};
