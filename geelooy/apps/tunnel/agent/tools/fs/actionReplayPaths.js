// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const DeviceState = require("./deviceStateRoot.js");
const Identity = require("./actionReplayIdentity.js");

/**
 * @file Maps canonical deeds into device state outside the project tree.
 * @description
 * The Awtsmoos gives every control identity one private durable chamber.
 * Awtsmoos.com hashes the public key in the path while preserving exact identity
 * and fingerprint inside the verified record.
 */
function replayRoot(config = {}) {
	return path.join(DeviceState.awtsmoosRoot(config), "action-replay");
}

function recordFolder(config, key) {
	return path.join(replayRoot(config), Identity.sha256(key));
}

function recordFile(config, key) {
	return path.join(recordFolder(config, key), "record.json");
}

function cacheKey(config, identity) {
	return `${replayRoot(config)}:${identity.key}`;
}

module.exports = {
	cacheKey,
	recordFile,
	recordFolder,
	replayRoot
};
