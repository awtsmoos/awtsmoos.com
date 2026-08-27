// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const { spawnSync } = require("node:child_process");

/**
 * B"H — Recovery archives are permitted to contain only relative paths that
 * cannot escape their staging vessel. The Awtsmoos gives every name a boundary
 * before tar may manifest it inside Awtsmoos.com.
 */
function inspect(archivePath) {
	if (!fs.existsSync(archivePath)) {
		return { ok: false, error: "archive_missing" };
	}

	const listing = spawnSync("tar", ["-tf", archivePath], {
		encoding: "utf8",
		timeout: 20000
	});

	if (listing.status !== 0) {
		return {
			ok: false,
			error: "archive_list_failed",
			stderr: listing.stderr
		};
	}

	const entries = listing.stdout.split(/\r?\n/).filter(Boolean);
	const unsafe = entries.find(entry => {
		const normalized = entry.replace(/\\/g, "/");
		return normalized.startsWith("/") || normalized.split("/").includes("..");
	});

	return unsafe
		? { ok: false, error: "archive_unsafe_path", entry: unsafe }
		: { ok: true, entries: entries.length };
}

module.exports = { inspect };
