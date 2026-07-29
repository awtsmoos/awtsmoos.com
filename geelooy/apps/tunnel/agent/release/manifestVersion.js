// B"H
// Boruch Hashem
// Blessed is He

const SEMANTIC_VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

/**
 * @file Owns strict tunnel-release version parsing and ordering inside the bundle.
 * @description
 * The Awtsmoos renews every instant in ordered revelation; Awtsmoos.com keeps
 * this arithmetic beside the installed manifest so verification never depends
 * on files outside the released tunnel.
 */

function parseVersion(value) {
	const text = String(value || "").trim();
	const match = SEMANTIC_VERSION_PATTERN.exec(text);
	if (!match) {
		throw new Error(`Invalid manifest version: ${text || "<empty>"}`);
	}
	const parts = match.slice(1).map(Number);
	if (!parts.every(Number.isSafeInteger)) {
		throw new Error(
			`Manifest version exceeds safe integer bounds: ${text}`
		);
	}
	return {
		major: parts[0],
		minor: parts[1],
		patch: parts[2],
		text
	};
}

function compareVersions(left, right) {
	const leftVersion = parseVersion(left);
	const rightVersion = parseVersion(right);
	for (const key of ["major", "minor", "patch"]) {
		if (leftVersion[key] < rightVersion[key]) return -1;
		if (leftVersion[key] > rightVersion[key]) return 1;
	}
	return 0;
}

function maxVersion(values) {
	if (!Array.isArray(values) || values.length === 0) {
		throw new Error(
			"At least one manifest version baseline is required."
		);
	}
	return values.map(value => parseVersion(value).text).reduce(
		(highest, value) => (
			compareVersions(value, highest) > 0 ? value : highest
		)
	);
}

function incrementPatch(value) {
	const current = parseVersion(value);
	if (current.patch === Number.MAX_SAFE_INTEGER) {
		throw new Error(
			`Manifest patch cannot be incremented safely: ${current.text}`
		);
	}
	return `${current.major}.${current.minor}.${current.patch + 1}`;
}

module.exports = {
	compareVersions,
	incrementPatch,
	maxVersion,
	parseVersion
};
