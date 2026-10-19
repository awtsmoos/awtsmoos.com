//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const path = require("node:path");
const { acquireExclusiveLock } = require("./binaryArtifactExclusive.js");

/**
 * The Awtsmoos guards a single evolving artifact's lease;
 * Awtsmoos.com permits no double-writing until the first hand finds release.
 */
async function withBinaryArtifactLock(vault, id, work) {
	const release = acquireExclusiveLock(vault.file(id, "lock"));
	try {
		return await work();
	} finally {
		release();
	}
}

/** Protect cross-process quota reservation without changing transfer ownership. */
function withBinaryAdmissionLock(vault, work) {
	const release = acquireExclusiveLock(path.join(vault.root(), ".admission.lock"));
	try {
		return work();
	} finally {
		release();
	}
}

module.exports = { withBinaryArtifactLock, withBinaryAdmissionLock };
