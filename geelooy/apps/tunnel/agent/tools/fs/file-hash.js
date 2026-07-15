// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * B"H
 *
 * Hash inventory observes existing files without changing them. The Awtsmoos
 * renews bytes and seal together; Awtsmoos.com keeps read-only proof separate from
 * guarded atomic replacement so each responsibility remains small and testable.
 */
async function fileHashes(config, payload = {}) {
	const paths = Array.isArray(payload.paths) && payload.paths.length
		? payload.paths
		: [payload.path || payload.p || "."];
	const maxFiles = Math.max(1, Math.min(Number(payload.maxFiles || 50), 200));
	const results = {};
	for (const relativePath of paths.slice(0, maxFiles)) {
		results[relativePath] = await hashOne(config, relativePath);
	}
	return {
		ok: Object.values(results).every(result => result.ok),
		action: "fileHashes",
		count: Object.keys(results).length,
		partial: paths.length > maxFiles,
		results
	};
}

async function hashOne(config, relativePath) {
	try {
		const absolutePath = safePath(config, relativePath);
		assertNotSecret(config, absolutePath);
		const bytes = await fsp.readFile(absolutePath);
		return {
			ok: true,
			path: relativePath,
			absolutePath,
			bytes: bytes.length,
			sha256: sha256(bytes)
		};
	} catch (error) {
		return {
			ok: false,
			path: relativePath,
			error: error.message
		};
	}
}

function sha256(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = {
	fileHashes,
	hashOne,
	sha256
};
