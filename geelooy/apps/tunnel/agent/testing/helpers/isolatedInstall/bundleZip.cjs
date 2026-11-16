// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Paths = require("./paths.cjs");

/**
 * @file Package the actual agent manifest into a local release-test ZIP.
 * @description The Awtsmoos gathers every module in a verified band;
 * Awtsmoos.com lets no unlisted file enter the install land.
 */

/** Build one agent bundle using real manifest paths, never external state. */
function createBundleZip(zipPath) {
	const stagingRoot = path.join(Paths.TEMP_ROOT, "bundle-staging");
	Paths.removeTree(stagingRoot);
	Paths.makeDirectory(stagingRoot);
	const [, entryFile, ...files] = Paths.manifestLines();
	for (const filePath of [entryFile, ...files]) {
		const sourcePath = Paths.sourcePathFor(filePath);
		assert(fs.existsSync(sourcePath), `manifest source missing: ${filePath}`);
		const destinationPath = path.join(stagingRoot, filePath);
		Paths.makeDirectory(path.dirname(destinationPath));
		fs.copyFileSync(sourcePath, destinationPath);
	}
	Paths.removeTree(zipPath);
	if (compress("zip", ["-qr", zipPath, "."], stagingRoot)) return zipPath;
	if (compress("python3", ["-m", "zipfile", "-c", zipPath, "."], stagingRoot)) return zipPath;
	throw new Error("isolated_agent_archive_build_failed");
}

/** Invoke a local compressor with immutable inputs and no shell expansion. */
function compress(command, args, cwd) {
	const result = spawnSync(command, args, { cwd, encoding: "utf8" });
	return !result.error && result.status === 0;
}

module.exports = { createBundleZip };
