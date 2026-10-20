//B"H
//Blessed is He
//Boruch Hashem

/**
 * Packed shard staging paths, file hashing and name validation (split from shardRoutes.js).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ragRoot } = require('../../search/rag/paths.js');

const SHARD_NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const ALLOWED_SUFFIXES = ['.awtsdb', '.f32', '.meta.jsonl', '.fast-manifest.json'];
const MAX_CHUNK_BYTES = 2 * 1024 * 1024; // 2 MB per chunk (server-side cap)

function stagingRoot($i, shard) {
	return path.join(ragRoot($i), 'shard-staging', shard);
}

function planPath($i, shard) {
	return path.join(stagingRoot($i, shard), 'plan.json');
}

function stagedFile($i, shard, name) {
	return path.join(stagingRoot($i, shard), name);
}

function liveFile($i, name) {
	return path.join(ragRoot($i), name);
}

function sha256File(file) {
	const h = crypto.createHash('sha256');
	const fd = fs.openSync(file, 'r');
	const buf = Buffer.alloc(4 << 20);
	let n;
	while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) h.update(buf.subarray(0, n));
	fs.closeSync(fd);
	return h.digest('hex');
}

function validateShard(shard) {
	if (typeof shard !== 'string' || !SHARD_NAME_RE.test(shard)) {
		return { ok: false, error: 'BAD_SHARD', message: 'Shard name must match [a-z0-9-].' };
	}
	return { ok: true };
}

function validateFileName(shard, name) {
	if (typeof name !== 'string') return { ok: false, error: 'BAD_FILE', message: 'File name required.' };
	const good = ALLOWED_SUFFIXES.some(s => name === shard + s);
	if (!good) return { ok: false, error: 'BAD_FILE', message: `File must be one of ${shard}{${ALLOWED_SUFFIXES.join(',')}}.` };
	return { ok: true };
}

function readPlan($i, shard) {
	try {
		return JSON.parse(fs.readFileSync(planPath($i, shard), 'utf8'));
	} catch {
		return null;
	}
}

module.exports = {
	SHARD_NAME_RE,
	ALLOWED_SUFFIXES,
	MAX_CHUNK_BYTES,
	stagingRoot,
	planPath,
	stagedFile,
	liveFile,
	sha256File,
	validateShard,
	validateFileName,
	readPlan,
	ragRoot,
};
