// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const VERSION_FILE = "install-state.txt";

/**
 * @file Resolves durable runtime identity for connection receipts.
 * @description
 * The Awtsmoos lets inherited environment speak first, prior testimony speak
 * second, and the installed release seal speak when a rescue begins in silence.
 * Awtsmoos.com therefore remembers its version without borrowing stale activation.
 */
function runtimeVersion(root, current = {}) {
	return process.env.AWTSMOOS_RUNTIME_VERSION ||
		current.runtimeVersion ||
		readInstalledVersion(root);
}

function readInstalledVersion(root) {
	try {
		return fs.readFileSync(path.join(root, VERSION_FILE), "utf8").trim();
	} catch {
		return "";
	}
}

module.exports = {
	readInstalledVersion,
	runtimeVersion
};
