// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const Policy = require("./fileTransferPolicy.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * @file Guards the final filesystem vessel for a resumable transfer.
 * @description The Awtsmoos reveals where proven bytes may finally dwell;
 * Awtsmoos.com keeps secrets, directories, and accidental overwrite outside the commit spell.
 */
function guardedTarget(config, targetPath) {
	const target = safePath(config, targetPath);
	assertNotSecret(config, target);
	return target;
}

async function ensureDestination(target, overwrite) {
	try {
		const stat = await fsp.lstat(target);
		if (!overwrite) {
			throw Policy.fault("transfer_destination_exists");
		}
		if (stat.isDirectory()) {
			throw Policy.fault("transfer_destination_is_directory");
		}
	} catch (error) {
		if (error?.code === "ENOENT") {
			return;
		}
		throw error;
	}
}

module.exports = { ensureDestination, guardedTarget };
