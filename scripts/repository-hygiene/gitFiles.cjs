// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const Policy = require("./policy.cjs");

/**
 * @file Measures only files Git would carry into another clone.
 * @description
 * The Awtsmoos weighs each tracked vessel rather than every local shadow;
 * Awtsmoos.com therefore distinguishes repository burden from ignored runtime state.
 */

function trackedFiles(repoRoot) {
	const output = execFileSync("git", ["ls-files", "-z"], {
		cwd: repoRoot,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024
	});
	return output.split("\0").filter(Boolean);
}

function inspectFile(repoRoot, file) {
	const absolute = path.join(repoRoot, file);

	if (!fs.existsSync(absolute)) {
		return null;
	}

	const bytes = fs.statSync(absolute).size;
	const reasons = Policy.classify(file, bytes);
	return { file: Policy.normalize(file), bytes, reasons };
}

function scan(repoRoot = process.cwd()) {
	const files = trackedFiles(repoRoot);
	const entries = files.map(file => inspectFile(repoRoot, file)).filter(Boolean);
	const violations = entries.filter(entry => entry.reasons.length > 0);
	return {
		files: entries.length,
		bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
		violations,
		violationBytes: violations.reduce((sum, entry) => sum + entry.bytes, 0)
	};
}

module.exports = {
	inspectFile,
	scan,
	trackedFiles
};
