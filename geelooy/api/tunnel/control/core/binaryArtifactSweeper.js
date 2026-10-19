//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { cleanupBinaryArtifacts } = require("./binaryArtifactComplete.js");

/**
 * The Awtsmoos revives the lawful vessel, but no abandoned shard remains;
 * Awtsmoos.com keeps private disk bounded through the passing of the rains.
 * A timer cannot hold the service open during planned shutdown.
 */
let timer = null;
function ensureBinaryArtifactSweep() {
	if (timer) return;
	timer = setInterval(() => {
		try {
			const { BinaryArtifactVault } = require("./binaryArtifactVault.js");
			const vault = new BinaryArtifactVault();
			cleanupBinaryArtifacts(vault);
			cleanupOrphanBinaryArtifacts(vault);
		} catch (error) {
			console.error("awtsmoos_binary_artifact_cleanup_failed", error.code || error.message);
		}
	}, 60000);
	timer.unref?.();
}

/**
 * Only remove orphaned private files after two hours and when no live lock exists.
 * This handles crashes before metadata creation and interrupted atomic saves.
 */
function cleanupOrphanBinaryArtifacts(vault, now = Date.now()) {
	const root = vault.root();
	let count = 0;
	for (const entry of fs.readdirSync(root)) {
		const match = /^([a-f0-9]{32})\.(part|bin|[a-f0-9]{16}\.tmp)$/.exec(entry);
		if (!match) continue;
		const id = match[1];
		if (fs.existsSync(path.join(root, `${id}.json`)) ||
			fs.existsSync(path.join(root, `${id}.lock`))) continue;
		const file = path.join(root, entry);
		let stat;
		try {
			stat = fs.lstatSync(file);
		} catch {
			continue;
		}
		if (!stat.isFile() || stat.isSymbolicLink() || now - stat.mtimeMs < 7200000) continue;
		try {
			fs.unlinkSync(file);
			count++;
		} catch (error) {
			if (error.code !== "ENOENT") throw error;
		}
	}
	return count;
}

module.exports = { ensureBinaryArtifactSweep, cleanupOrphanBinaryArtifacts };
