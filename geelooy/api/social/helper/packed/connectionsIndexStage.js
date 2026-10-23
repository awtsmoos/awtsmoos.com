//B"H
//Boruch Hashem
//Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { INDEX_DIR, loadConnectionsData, clearConnectionsCache } = require("./connectionsIndex.js");
const { copyStageIndexFiles } = require("./connectionsIndexStageFiles.js");
const REPOSITORY_ROOT = path.resolve(__dirname, "../../../../..");

/**
 * Awtsmoos.com receives intact citations beyond the Git tree;
 * the Awtsmoos guards each source, each checksum, each decree.
 * Stage an independently verified new directory without touching the origin.
 *
 * @param {string} destination Absolute new directory outside this repository.
 * @param {string} [sourceDirectory] Generated index directory to preserve.
 * @returns {object} Integrity and placement evidence for deployment review.
 */
function stageConnectionsIndexes(destination, sourceDirectory = INDEX_DIR) {
	const target = resolveStageTarget(destination);
	if (fs.existsSync(target)) {
		throw new Error("citation index stage destination already exists");
	}
	const scratch = fs.mkdtempSync(path.join(path.dirname(target), ".awtsmoos-citations-"));
	fs.chmodSync(scratch, 0o700);
	let published = false;
	try {
		const files = copyStageIndexFiles(sourceDirectory, scratch);
		clearConnectionsCache();
		const original = loadConnectionsData(sourceDirectory);
		clearConnectionsCache();
		const staged = loadConnectionsData(scratch);
		assert.deepEqual(Array.from(staged.forward), Array.from(original.forward));
		assert.deepEqual(Array.from(staged.reverse), Array.from(original.reverse));
		assert.deepEqual(staged.meta.files, original.meta.files);
		assert.deepEqual(staged.meta.skipped, original.meta.skipped);
		if (staged.meta.skipped.length !== 0) {
			throw new Error("citation indexes contain unreadable data");
		}
		const proof = {
			BH: 'B"H',
			format: "awtsmoos-citation-index-stage-v1",
			files,
			bytes: files.reduce((total, item) => total + item.bytes, 0),
			forwardPosts: staged.meta.forwardPosts,
			reverseKeys: staged.meta.reverseKeys,
			reverseEntries: staged.meta.reverseEntries
		};
		writeStageManifest(scratch, proof);
		if (fs.existsSync(target)) {
			throw new Error("citation stage destination appeared during verification");
		}
		fs.renameSync(scratch, target);
		published = true;
		return { ...proof, directory: target };
	} finally {
		clearConnectionsCache();
		if (!published) {
			fs.rmSync(scratch, { recursive: true, force: true });
		}
	}
}

/** Refuse repository paths, nonexistent parents, and ambiguous symlink parents. */
function resolveStageTarget(destination) {
	if (typeof destination !== "string" || !path.isAbsolute(destination)) {
		throw new Error("stage destination must be an absolute path");
	}
	const parent = fs.realpathSync(path.dirname(destination));
	if (!fs.statSync(parent).isDirectory()) {
		throw new Error("stage parent must be a directory");
	}
	const target = path.join(parent, path.basename(destination));
	const relative = path.relative(REPOSITORY_ROOT, target);
	if (relative === "" || (relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative))) {
		throw new Error("stage destination must be outside the repository");
	}
	return target;
}

/** Write a durable per-file hash manifest beside the copied data. */
function writeStageManifest(directory, proof) {
	const filePath = path.join(directory, "STAGE_MANIFEST.json");
	const descriptor = fs.openSync(filePath, "wx", 0o600);
	try {
		fs.writeFileSync(descriptor, JSON.stringify(proof, null, "\t") + "\n");
		fs.fsyncSync(descriptor);
	} finally {
		fs.closeSync(descriptor);
	}
}

module.exports = { stageConnectionsIndexes };
