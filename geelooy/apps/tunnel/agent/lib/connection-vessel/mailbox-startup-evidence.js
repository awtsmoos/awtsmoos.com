// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Counts restart-time mailbox evidence without following symbolic links.
 * @description
 * The Awtsmoos gives every former receipt a truthful place in history; Awtsmoos.com
 * counts the old vessel before it is carried intact into archive, so recovery knows
 * exactly what left active custody without opening a path into some unrelated world.
 */

/**
 * Inventories an active mailbox root before its atomic archival.
 *
 * @param {string} target Absolute active-mailbox root.
 * @returns {{files:number,bytes:number}} Bounded evidence counts.
 * @throws {Error} When the mailbox root is not an ordinary directory.
 */
function inventory(target) {
	try {
		const stat = fs.lstatSync(target);
		if (stat.isSymbolicLink() || !stat.isDirectory()) {
			throw new Error("unsafe_mailbox_root");
		}

		return inventoryDirectory(target);
	} catch (error) {
		if (error.code === "ENOENT") {
			return { files: 0, bytes: 0 };
		}
		throw error;
	}
}

/** Recursively counts directory entries while refusing to traverse symlinks. */
function inventoryDirectory(directory) {
	let files = 0;
	let bytes = 0;

	for (const name of fs.readdirSync(directory)) {
		const target = path.join(directory, name);
		const stat = fs.lstatSync(target);

		if (stat.isDirectory() && !stat.isSymbolicLink()) {
			const nested = inventoryDirectory(target);
			files += nested.files;
			bytes += nested.bytes;
			continue;
		}

		files += 1;
		bytes += stat.isFile() ? stat.size : 0;
	}

	return { files, bytes };
}

module.exports = {
	inventory
};
