// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const { loadConfig } = require("../config.js");
const { safePath, assertNotSecret } = require("../../tools/fs/pathGuard.js");
const Results = require("./request-retry-reconcile-results.js");

/**
 * B"H
 *
 * A pending mutation loaded after restart is judged by every destination itself.
 * The Awtsmoos renews expected hash and observed bytes together; Awtsmoos.com
 * names complete, absent, and partial worlds without replaying the old request.
 */
function recover(record = {}) {
	if (record.state !== "pending" || record.mutation?.kind !== "file_replace") {
		return null;
	}
	const config = loadConfig();
	const effects = (record.mutation.effects || [])
		.map(effect => verifyEffect(config, effect));
	if (!effects.length) return null;
	return Results.result(record, effects);
}

function verifyEffect(config, effect = {}) {
	try {
		const absolutePath = safePath(config, effect.path);
		assertNotSecret(config, absolutePath);
		const bytes = fs.readFileSync(absolutePath);
		const afterSha256 = sha256(bytes);
		return {
			ok: afterSha256 === effect.afterSha256 && bytes.length === effect.bytes,
			path: effect.path,
			absolutePath,
			bytes: bytes.length,
			afterSha256,
			expectedBytes: effect.bytes,
			expectedAfterSha256: effect.afterSha256
		};
	} catch (error) {
		return {
			ok: false,
			path: effect.path,
			expectedBytes: effect.bytes,
			expectedAfterSha256: effect.afterSha256,
			error: error.message
		};
	}
}

function sha256(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = {
	recover,
	verifyEffect
};
