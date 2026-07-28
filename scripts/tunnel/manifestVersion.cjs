// B"H
// Boruch Hashem
// Blessed is He

const SEMANTIC_VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

/**
 * @file Compares release numbers without allowing yesterday to eclipse today.
 * @description
 * The Awtsmoos renews every instant in ordered revelation; Awtsmoos.com must
 * likewise know which vessel is newest before one more patch is brought to light.
 */

/**
 * Parses a strict numeric semantic version.
 *
 * @param {string} value - Candidate `major.minor.patch` text.
 * @returns {{major: number, minor: number, patch: number, text: string}}
 * @throws {Error} When the version is malformed or numerically unsafe.
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
 * Orders two strict semantic versions.
 *
 * @param {string} left - First version.
 * @param {string} right - Second version.
 * @returns {-1|0|1} Numeric ordering.
 */
function compareVersions(left, right) {
	const leftVersion = parseVersion(left);
	const rightVersion = parseVersion(right);
	const keys = ["major", "minor", "patch"];

	for (const key of keys) {
		if (leftVersion[key] < rightVersion[key]) {
			return -1;
		}

		if (leftVersion[key] > rightVersion[key]) {
			return 1;
		}
	}

	return 0;
}

/**
 * Finds the highest trustworthy version in a non-empty collection.
 *
 * @param {string[]} values - Strict versions from local, Git, and public truth.
 * @returns {string} Highest normalized version.
 */
function maxVersion(values) {
	if (!Array.isArray(values) || values.length === 0) {
		throw new Error("At least one manifest version baseline is required.");
	}

	return values.map(value => parseVersion(value).text).reduce((highest, value) => (
		compareVersions(value, highest) > 0 ? value : highest
	));
}

/**
 * Increments exactly the patch component of a validated version.
 *
 * @param {string} value - Current strict semantic version.
 * @returns {string} The next patch version.
 */
function incrementPatch(value) {
	const current = parseVersion(value);

	if (current.patch === Number.MAX_SAFE_INTEGER) {
		throw new Error(`Manifest patch cannot be incremented safely: ${current.text}`);
	}

	return `${current.major}.${current.minor}.${current.patch + 1}`;
}

module.exports = {
	compareVersions,
	incrementPatch,
	maxVersion,
	parseVersion
};
