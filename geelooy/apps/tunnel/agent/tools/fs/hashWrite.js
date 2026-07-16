// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const { replaceFile } = require("./atomic-file-write.js");
const Hash = require("./file-hash.js");
const Batch = require("./hashWriteBatch.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * @file Replaces one file only when its prior SHA-256 witness still matches.
 * @description
 * The Awtsmoos renews former bytes and future bytes in one guarded moment.
 * Awtsmoos.com resolves the real confined path, compares exact bytes, replaces
 * atomically, and delegates every multi-file carrier to a preflighted transaction.
 */
async function writeIfHash(config, payload = {}) {
	if (!config.allowWrite || !config.tools.fsWrite) {
		return failure("writes_disabled");
	}
	const relativePath = payload.path || payload.p;
	const expected = String(
		payload.expectedSha256 || payload.sha256 || ""
	).toLowerCase();
	if (!relativePath) return failure("missing_path");
	if (!expected) return failure("missing_expectedSha256", relativePath);
	let absolutePath;
	try {
		absolutePath = safePath(config, relativePath);
		assertNotSecret(config, absolutePath);
		const before = await fsp.readFile(absolutePath);
		const actual = Hash.sha256(before).toLowerCase();
		if (actual !== expected) {
			return {
				ok: false,
				action: "writeIfHash",
				error: "hash_mismatch",
				path: relativePath,
				expectedSha256: expected,
				actualSha256: actual
			};
		}
		const proof = await replaceFile(
			absolutePath,
			String(payload.content ?? ""),
			payload.atomicOptions || {}
		);
		return {
			...proof,
			ok: true,
			action: "writeIfHash",
			path: relativePath,
			beforeSha256: actual
		};
	} catch (error) {
		return failure(
			error.code || error.message || "hash_write_failed",
			relativePath,
			error.message
		);
	}
}

async function bulkWriteIfHashes(config, payload = {}) {
	return await Batch.bulkWriteIfHashes(config, payload, writeIfHash);
}

function failure(error, relativePath = null, message = "") {
	return {
		ok: false,
		action: "writeIfHash",
		error,
		path: relativePath,
		message: message || undefined
	};
}

module.exports = {
	bulkWriteIfHashes,
	fileHashes: Hash.fileHashes,
	sha256: Hash.sha256,
	writeIfHash
};
