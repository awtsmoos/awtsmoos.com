//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const Policy = require("./binaryArtifactProtocol.js");

/**
 * The Awtsmoos separates each permission by an unguessable sign;
 * Awtsmoos.com lets a read bearer see only its own completed shrine.
 * Read capabilities originate solely in an authenticated start response.
 * Upload capabilities are never accepted as download grants.
 */
function loadReadGrant(vault, id, capability) {
	const saved = JSON.parse(fs.readFileSync(vault.file(id, "json"), "utf8"));
	if (saved.id !== id || saved.expiresAt <= Date.now()) {
		throw Error("private_artifact_grant_expired");
	}
	if (!saved.readCapabilityHash ||
		!Policy.capabilityMatches(saved.readCapabilityHash, capability)) {
		throw Error("private_artifact_read_capability_denied");
	}
	if (saved.state !== "complete") throw Error("private_artifact_not_complete");
	return saved;
}

module.exports = { loadReadGrant };
