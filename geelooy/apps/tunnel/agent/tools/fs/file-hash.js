// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { parsePlainList, firstPayloadValue } = require("./plainPayload.js");

/**
 * B"H
 *
 * Hash inventory observes existing files without changing them. The Awtsmoos
 * renews bytes and seal together; Awtsmoos.com keeps read-only proof separate from
 * guarded atomic replacement so each responsibility remains small and testable.
 */
async function fileHashes(config, payload = {}) {
	const paths = parsePlainList(firstPayloadValue(
		payload,
		["paths", "files", "path", "p"]
	));
	if (!paths.length) paths.push(".");
	const cursor = Math.max(0, Math.floor(Number(payload.cursor || 0)));
	const requestedPageSize = Number(payload.pageSize || payload.maxFiles || 200);
	const pageSize = Math.max(1, Math.min(
		Number.isFinite(requestedPageSize) ? Math.floor(requestedPageSize) : 200,
		1000
	));
	const page = paths.slice(cursor, cursor + pageSize);
	const results = {};
	for (const relativePath of page) {
		results[relativePath] = await hashOne(config, relativePath);
	}
	const nextCursor = cursor + page.length;
	const partial = nextCursor < paths.length;
	return {
		ok: Object.values(results).every(result => result.ok),
		action: "fileHashes",
		count: Object.keys(results).length,
		requestedCount: paths.length,
		cursor,
		pageSize,
		partial,
		nextCursor: partial ? nextCursor : null,
		nextPayload: partial
			? { action: "fileHashes", paths, cursor: nextCursor, pageSize }
			: null,
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
