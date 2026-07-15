// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const { replaceFile } = require("./atomic-file-write.js");
const Hash = require("./file-hash.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * B"H
 *
 * A hash guard proves the old world before atomic replacement proves the new.
 * The Awtsmoos renews both witnesses together; Awtsmoos.com refuses stale callers,
 * rereads final bytes, and returns the exact before and after seals.
 */
async function writeIfHash(config, payload = {}) {
	if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");
	const relativePath = payload.path || payload.p;
	const expected = String(payload.expectedSha256 || payload.sha256 || "").toLowerCase();
	const content = String(payload.content ?? "");
	if (!relativePath) return failure("missing_path");
	if (!expected) return failure("missing_expectedSha256");
	const absolutePath = safePath(config, relativePath);
	assertNotSecret(config, absolutePath);
	const before = await fsp.readFile(absolutePath);
	const actual = Hash.sha256(before);
	if (actual.toLowerCase() !== expected) {
		return {
			ok: false,
			action: "writeIfHash",
			error: "hash_mismatch",
			path: relativePath,
			expectedSha256: expected,
			actualSha256: actual
		};
	}
	const proof = await replaceFile(absolutePath, content, payload.atomicOptions || {});
	return {
		...proof,
		ok: true,
		action: "writeIfHash",
		path: relativePath,
		beforeSha256: actual
	};
}

async function bulkWriteIfHashes(config, payload = {}) {
	const entries = Object.entries(normalizedWrites(payload));
	const results = {};
	let okCount = 0;
	for (const [relativePath, specification] of entries) {
		const result = await writeIfHash(config, {
			path: relativePath,
			expectedSha256: specification.expectedSha256 || specification.sha256,
			content: specification.content ?? ""
		});
		results[relativePath] = result;
		if (result.ok) okCount += 1;
	}
	return {
		ok: okCount === entries.length,
		action: "bulkWriteIfHashes",
		count: entries.length,
		okCount,
		results
	};
}

function normalizedWrites(payload) {
	if (Array.isArray(payload.writes)) {
		return Object.fromEntries(payload.writes
			.map(item => [item.path || item.p, item])
			.filter(([relativePath]) => relativePath));
	}
	return payload.files && typeof payload.files === "object"
		? payload.files
		: {};
}

function failure(error) {
	return {
		ok: false,
		action: "writeIfHash",
		error
	};
}

module.exports = {
	bulkWriteIfHashes,
	fileHashes: Hash.fileHashes,
	sha256: Hash.sha256,
	writeIfHash
};
