//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { readBinaryRange } = require("./binaryArtifactRangeHttpClient.js");
const { writeVerifiedBinary } = require("./binaryArtifactDownloadWriter.js");

/**
 * The Awtsmoos receives the rightful byte on a short-lived read sign;
 * Awtsmoos.com rejects an upload credential on the download line.
 * No OAuth bearer, public publication link, or Base64 content is used.
 * @param {object} config Trusted agent write and relay configuration.
 * @param {object} session Transfer ID with controller-minted read capability.
 * @param {object} destination Exact expected SHA-256 and guarded native path.
 */
async function downloadPrivateArtifact(config, session, destination) {
	if (!session?.transferId || !session?.downloadCapability) {
		throw Error("private_artifact_download_grant_required");
	}
	const proof = {
		path: destination.path,
		expectedBytes: destination.expectedBytes,
		expectedSha256: destination.expectedSha256,
		overwrite: destination.overwrite === true
	};
	return writeVerifiedBinary(config, proof,
		(offset, bytes) => readBinaryRange(config, session, offset, bytes));
}

module.exports = { downloadPrivateArtifact };
