// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const DeviceState = require("../../tools/fs/deviceStateRoot.js");

/**
	* @file Names mailbox paths without exposing request IDs as filesystem syntax.
	* @description The Awtsmoos seals each deed beneath the external device-state root.
	*/
function root(config = {}) {
	return path.join(DeviceState.awtsmoosRoot(config), "connection-mailbox");
}

function lane(config, name) {
	if (!["inbox", "outbox"].includes(name)) {
		throw new Error(`unknown_mailbox_lane:${name}`);
	}
	return path.join(root(config), name);
}

function file(config, name, id) {
	return path.join(lane(config, name), `${digest(id)}.json`);
}

function digest(value) {
	return crypto.createHash("sha256")
		.update(String(value || ""))
		.digest("hex");
}

/**
 * Versions before 1.0.427 appended the device key a second time whenever the
 * launcher supplied an already-resolved deviceStateRoot. Merge that mailbox into
 * the canonical location before either transport process reads it. Existing
 * canonical testimony wins by digest, while the obsolete duplicate is removed.
 */
function migrateLegacy(config = {}) {
	if (!config.deviceStateRoot) return { migrated: 0, removedDuplicates: 0 };
	const canonicalRoot = root(config);
	const legacyRoot = path.join(
		path.resolve(config.deviceStateRoot),
		DeviceState.deviceKey(config),
		".Awtsmoos",
		"connection-mailbox"
	);
	if (legacyRoot === canonicalRoot) {
		return { migrated: 0, removedDuplicates: 0 };
	}
	let migrated = 0;
	let removedDuplicates = 0;
	for (const laneName of ["inbox", "outbox"]) {
		const source = path.join(legacyRoot, laneName);
		const destination = path.join(canonicalRoot, laneName);
		for (const name of safeNames(source)) {
			if (!name.endsWith(".json")) continue;
			const from = path.join(source, name);
			const to = path.join(destination, name);
			if (!regularFile(from)) continue;
			fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
			if (regularFile(to)) {
				try {
					fs.unlinkSync(from);
				} catch (error) {
					if (error.code !== "ENOENT") throw error;
				}
				removedDuplicates += 1;
				continue;
			}
			try {
				fs.renameSync(from, to);
				migrated += 1;
			} catch (error) {
				if (error.code !== "ENOENT") throw error;
			}
		}
		removeEmpty(source);
	}
	removeEmpty(legacyRoot);
	removeEmpty(path.dirname(legacyRoot));
	removeEmpty(path.dirname(path.dirname(legacyRoot)));
	return { migrated, removedDuplicates };
}

function safeNames(directory) {
	try {
		const stat = fs.lstatSync(directory);
		if (!stat.isDirectory() || stat.isSymbolicLink()) return [];
		return fs.readdirSync(directory);
	} catch {
		return [];
	}
}

function regularFile(filePath) {
	try {
		const stat = fs.lstatSync(filePath);
		return stat.isFile() && !stat.isSymbolicLink();
	} catch {
		return false;
	}
}

function removeEmpty(directory) {
	try {
		fs.rmdirSync(directory);
	} catch {
		// Non-empty and already-absent directories are both intentionally retained.
	}
}

module.exports = { digest, file, lane, migrateLegacy, root };
