// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Verifies canonical source SHA, manifest checksum, and manifest file presence.
 * @description
 * The Awtsmoos asks provenance and manifest to testify independently; Awtsmoos.com
 * accepts neither a malformed Git witness nor a checksum that points at absent runtime
 * files, so recovery health cannot be painted green by one surviving metadata field.
 */
function sourceSha(root, failures) {
	try {
		const value = fs.readFileSync(path.join(root, "release-source-sha.txt"), "utf8").trim();
		if (!/^[0-9a-f]{40}$/.test(value)) {
			failures.push("source:sha_invalid");
		}
	} catch (error) {
		failures.push(`source:${error.code || "read_failed"}`);
	}
}

function manifestChecksum(root, failures, hash) {
	try {
		const checksumPath = path.join(root, "install-manifest.sha256");
		const expected = fs.readFileSync(checksumPath, "utf8").trim().split(/\s+/)[0];
		const actual = hash(path.join(root, "installed-manifest.txt"));
		if (expected !== actual) {
			failures.push("manifest:checksum_mismatch");
		}
	} catch (error) {
		failures.push(`manifest:${error.code || "read_failed"}`);
	}
}

function manifestFiles(root, failures) {
	try {
		const lines = fs.readFileSync(path.join(root, "installed-manifest.txt"), "utf8")
			.split(/\r?\n/)
			.map(line => line.trim())
			.filter(Boolean);
		for (const relative of lines.slice(2)) {
			if (!fs.existsSync(path.join(root, relative))) {
				failures.push(`manifest_missing:${relative}`);
				if (failures.length > 20) {
					break;
				}
			}
		}
	} catch {}
}

module.exports = {
	manifestChecksum,
	manifestFiles,
	sourceSha
};
