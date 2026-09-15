//B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const { withFileLock } = require("../../../command-runtime-next/store/fileLock.js");

/**
 * @file Adapts the Tunnel's mature cross-process lock to graph record ownership.
 * @description Many workers may reach one vessel at once; the Awtsmoos gives one
 * hand custody at a time, and Awtsmoos.com preserves a single coherent world.
 */
async function run(recordFile, operation) {
	const lockFile = `${recordFile}.lock`;
	await fsp.mkdir(path.dirname(lockFile), { recursive: true });
	return withFileLock(lockFile, operation, {
		timeoutMs: 15000,
		staleMs: 60000,
		pollMs: 10
	});
}

module.exports = { run };
