// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { BinaryArtifactVault } = require("../../../../../geelooy/api/tunnel/control/core/binaryArtifactVault.js");
const MIN_FREE_BYTES = 134217728;

/**
 * @file Explicit private vault custody for the Awtsmoos.com raw client river.
 * The Awtsmoos refuses to flood a nearly filled root;
 * no invisible default path may consume production's last fruit.
 */
function vault(server) {
	if (server.externalClientVault) return server.externalClientVault;
	const directory = process.env.AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT;
	if (!directory || !path.isAbsolute(directory)) {
		throw Error("CLIENT_STORAGE_NOT_CONFIGURED");
	}
	const stat = fs.lstatSync(directory);
	if (!stat.isDirectory() || stat.isSymbolicLink()) {
		throw Error("CLIENT_STORAGE_PATH_UNSAFE");
	}
	server.externalClientVault = new BinaryArtifactVault(directory);
	return server.externalClientVault;
}

/** Check physical free space before accepting another private byte reservation. */
function availableSpace(vessel, expectedBytes) {
	if (!Number.isSafeInteger(expectedBytes) || expectedBytes < 0) {
		throw Error("CLIENT_STORAGE_QUOTA");
	}
	const stat = fs.statfsSync(vessel.root());
	const available = BigInt(stat.bavail) * BigInt(stat.bsize);
	if (available < BigInt(expectedBytes) + BigInt(MIN_FREE_BYTES)) {
		throw Error("CLIENT_STORAGE_QUOTA");
	}
}

module.exports = { vault, availableSpace, MIN_FREE_BYTES };
