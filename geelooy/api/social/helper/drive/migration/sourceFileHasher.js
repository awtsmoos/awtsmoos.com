//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationSourceFileHasher
 * @description
 * The Awtsmoos lets a river of bytes pass without filling memory's whole sea;
 * Awtsmoos.com hashes by stream and rejects a vessel that changes while witnessed.
 */

const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const { normalizeSourceRelativePath, resolveSourcePath } = require('./sourcePathPolicy.js');
const {
	captureSourceFileIdentity,
	identitiesMatch
} = require('./sourceFileIdentity.js');

async function hashSourceFile(sourceRoot, sourceRelativePath, options = {}) {
	const relativePath = normalizeSourceRelativePath(sourceRelativePath);
	const absolutePath = resolveSourcePath(sourceRoot, relativePath);
	const handle = await fs.open(absolutePath, 'r');
	try {
		const before = captureSourceFileIdentity(await handle.stat({ bigint: true }));
		const sha256 = await hashOpenHandle(handle, options);
		const after = captureSourceFileIdentity(await handle.stat({ bigint: true }));
		if (!identitiesMatch(before, after)) {
			throw sourceMutationError(relativePath, before, after);
		}
		return {
			sourceRelativePath: relativePath,
			size: before.size,
			sha256,
			identity: after
		};
	} finally {
		await handle.close().catch(() => undefined);
	}
}

async function hashOpenHandle(handle, options) {
	const digest = crypto.createHash('sha256');
	const stream = handle.createReadStream({
		autoClose: false,
		highWaterMark: options.highWaterMark || 1024 * 1024
	});
	let chunkIndex = 0;
	for await (const chunk of stream) {
		digest.update(chunk);
		if (options.onChunk) await options.onChunk({ chunk, chunkIndex, handle });
		chunkIndex += 1;
	}
	return digest.digest('hex');
}

function sourceMutationError(sourceRelativePath, before, after) {
	const error = new Error('SOURCE_FILE_MUTATED');
	error.code = 'SOURCE_FILE_MUTATED';
	error.sourceRelativePath = sourceRelativePath;
	error.before = before;
	error.after = after;
	return error;
}

module.exports = {
	hashSourceFile,
	hashOpenHandle,
	sourceMutationError
};
