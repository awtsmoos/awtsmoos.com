//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedShardRoutes chunk upload endpoint (split from shardRoutes.js).
 */

const fs = require('fs');
const crypto = require('crypto');
const { requireMethod, requestValue } = require('./requestValues.js');
const { er } = require('../../general.js');
const { stagedFile, validateShard, validateFileName, readPlan, MAX_CHUNK_BYTES } = require('./shardRoutesPaths.js');

module.exports = {
	// -- POST /packed/shard/chunk -------------------------------------------
	async chunk() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const { shard, name, offset, bytes, chunkSha256, data } = this.body();
		const signedFiles = [{ shard, name, offset, bytes, chunkSha256 }];
		const auth = this.checkAuth(signedFiles);
		if (auth) return auth;
		const vs = validateShard(shard);
		if (!vs.ok) return er(vs);
		const vf = validateFileName(shard, name);
		if (!vf.ok) return er(vf);
		const plan = readPlan(this.$i, shard);
		if (!plan) return er({ code: 'NO_PLAN', message: 'Call /packed/shard/start first.' });
		const entry = plan.files.find(f => f.name === name);
		if (!entry) return er({ code: 'NOT_PLANNED', message: `${name} is not in the transfer plan.` });
		if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(bytes) || bytes <= 0) {
			return er({ code: 'BAD_CHUNK', message: 'offset/bytes must be non-negative integers.' });
		}
		if (bytes > MAX_CHUNK_BYTES) {
			return er({ code: 'CHUNK_TOO_LARGE', message: `Max ${MAX_CHUNK_BYTES} bytes per chunk.` });
		}
		let buf;
		try {
			buf = Buffer.from(String(data || ''), 'base64');
		} catch {
			return er({ code: 'BAD_CHUNK', message: 'data must be base64.' });
		}
		if (buf.length !== bytes) {
			return er({ code: 'BAD_CHUNK', message: `data decodes to ${buf.length} bytes, declared ${bytes}.` });
		}
		const actualChunkSha = crypto.createHash('sha256').update(buf).digest('hex');
		if (actualChunkSha !== String(chunkSha256)) {
			return er({ code: 'CHUNK_SHA_MISMATCH', message: 'Chunk bytes do not match chunkSha256.' });
		}
		const sf = stagedFile(this.$i, shard, name);
		const current = fs.existsSync(sf) ? fs.statSync(sf).size : 0;
		if (offset !== current) {
			// Idempotent retry: client re-sending bytes the server already has.
			if (offset < current) {
				return er({ code: 'OFFSET_BEHIND', message: `Server already has ${current} bytes; resume from there.`, current });
			}
			return er({ code: 'OFFSET_MISMATCH', message: `Expected offset ${current}, got ${offset}.`, current });
		}
		if (current + bytes > entry.bytes) {
			return er({ code: 'OVERRUN', message: `Chunk would exceed planned ${entry.bytes} bytes.` });
		}
		fs.appendFileSync(sf, buf);
		const staged = fs.statSync(sf).size;
		return { success: true, shard, name, staged, remaining: entry.bytes - staged };
	}
};
