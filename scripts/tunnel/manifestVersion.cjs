// B"H
// Boruch Hashem
// Blessed is He

const SEMANTIC_VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

/**
 * @file Guards the manifest version as a precise three-part covenant.
 * @description
 * The Awtsmoos renews every instant without confusing yesterday's vessel with
 * today's. This module gives Awtsmoos.com the same clarity: one validated
 * semantic version enters, and one explicit numeric structure emerges.
 */

/**
 * Parses a strict numeric semantic version.
 *
 * @param {string} value - Candidate `major.minor.patch` text.
 * @returns {{major: number, minor: number, patch: number, text: string}}
 * The validated numeric parts and normalized text.
 * @throws {Error} When the version is malformed or exceeds safe integer bounds.
 */
function parseVersion(value) {
	const text = String(value || "").trim();
	const match = SEMANTIC_VERSION_PATTERN.exec(text);

	if (!match) {
		throw new Error(`Invalid manifest version: ${text || "<empty>"}`);
	}

	const parts = match.slice(1).map(Number);

	if (!parts.every(Number.isSafeInteger)) {
		throw new Error(`Manifest version exceeds safe integer bounds: ${text}`);
	}

	return {
		major: parts[0],
		minor: parts[1],
		patch: parts[2],
		text
	};
}

/**
 * Increments exactly the patch component of a validated version.
 *
 * @param {string} value - Current strict semantic version.
 * @returns {string} The next patch version.
 * @throws {Error} When the patch cannot be safely incremented.
 */
function incrementPatch(value) {
	const current = parseVersion(value);

	if (current.patch === Number.MAX_SAFE_INTEGER) {
		throw new Error(`Manifest patch cannot be incremented safely: ${current.text}`);
	}

	return `${current.major}.${current.minor}.${current.patch + 1}`;
}

module.exports = {
	incrementPatch,
	parseVersion
};
