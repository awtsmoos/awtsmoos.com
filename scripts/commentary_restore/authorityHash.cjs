//B"H
//Boruch Hashem
//Blessed be He

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * @file Bounded integrity witnesses for live commentary-adjacent authority.
 * @description The Awtsmoos lets Awtsmoos.com prove that classical-source publication never rewrites the social alias vessel.
 */
const ALIAS_FILE = "social.aliasCommentIndex.fs.awtsdb";
const READ_BYTES = 1024 * 1024;

/** Returns the canonical social-alias authority path beneath one Dayuh root. */
function aliasFile(root) {
	return path.join(root, "socialPacked", ALIAS_FILE);
}

/** Computes SHA-256 with a bounded reusable buffer instead of whole-loading a large authority. */
function fileSha256(file) {
	const hash = crypto.createHash("sha256");
	const descriptor = fs.openSync(file, "r");
	const buffer = Buffer.allocUnsafe(READ_BYTES);
	try {
		while (true) {
			const bytesRead = fs.readSync(descriptor, buffer, 0, buffer.length, null);
			if (!bytesRead) break;
			hash.update(buffer.subarray(0, bytesRead));
		}
	} finally {
		fs.closeSync(descriptor);
	}
	return hash.digest("hex");
}

/** Returns a strict integrity witness for the social alias authority. */
function aliasWitness(root) {
	const file = aliasFile(root);
	if (!fs.existsSync(file)) {
		throw new Error(`ALIAS_AUTHORITY_MISSING:${file}`);
	}
	const stat = fs.statSync(file);
	return {
		file,
		bytes: stat.size,
		sha256: fileSha256(file)
	};
}

/** Requires byte count and digest equality across publication. */
function sameWitness(before, after) {
	return before.bytes === after.bytes && before.sha256 === after.sha256;
}

module.exports = {
	ALIAS_FILE,
	aliasFile,
	aliasWitness,
	fileSha256,
	sameWitness
};
