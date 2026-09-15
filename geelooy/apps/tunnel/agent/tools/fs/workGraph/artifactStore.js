//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const crypto = require("node:crypto");
const Ids = require("./ids.js");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");

/**
 * @file Stores immutable content-addressed artifacts with automatic deduplication.
 * @description Many versions may reveal the same bytes; the Awtsmoos needs no
 * duplicate vessel, and Awtsmoos.com lets one cryptographic witness serve them all.
 */
function hashBuffer(buffer) {
	return crypto.createHash("sha256").update(buffer).digest("hex");
}

function blobFile(config, hash) {
	return path.join(Paths.blobs(config), `${hash}.blob`);
}

async function putBuffer(config, buffer) {
	const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
	const hash = hashBuffer(bytes);
	const stored = await Records.createImmutableBuffer(blobFile(config, hash), bytes);
	return {
		id: Ids.deterministic("artifact", ["sha256", hash]),
		hashAlgorithm: "sha256",
		hash,
		bytes: bytes.length,
		deduplicated: !stored.created
	};
}

module.exports = { hashBuffer, putBuffer };
