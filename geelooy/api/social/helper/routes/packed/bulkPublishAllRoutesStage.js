//B"H
//Blessed is He
//Boruch Hashem

/**
 * BulkPublishAllRoutes stage upload endpoint (split from bulkPublishAllRoutes.js).
 *
 * Bulk-upload redesign §3.1 (keep + harden the stage):
 * - Per-chunk receipt: each chunk reply returns chunkSha256. The client
 *   hashes each chunk before sending; the server verifies the hash on
 *   write and rejects a mismatched chunk (CHUNK_HASH_MISMATCH) without
 *   failing the upload. A re-sent chunk with a matching hash is a no-op.
 * - Upload ownership: the uploadId is bound to its staging caller in a
 *   sidecar <uploadId>.owner.json (caller identity + createdAt +
 *   totalChunks). posts/start with an uploadId owned by another alias
 *   is rejected (see stageMixin.js).
 * - Upload progress: GET /packed/import/bulk/stage?uploadId= returns
 *   received/total/complete/bytes so a browser uploader can resume
 *   after a reload.
 * - Upload TTL: incomplete uploads older than 7 days are deleted by a
 *   background sweep; completed uploads are deleted 7 days after their
 *   job reaches terminal state (or 7 days after assembly when no job
 *   ever references them).
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { requireMethod, requestValue } = require('./requestValues.js');
const { UPLOAD_ID_RE, CHUNK_RAW_MAX, STAGE_TOTAL_MAX, uploadDir, stageRoot } = require('./bulkPublishAllRoutesPaths.js');

const UPLOAD_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STAGE_SWEEP_INTERVAL_MS = 4 * 60 * 60 * 1000;
let stageSweepState = { timer: null, lastRun: 0 };

/** Count the chunk files present for an upload directory. */
function countChunks(dir, totalChunks) {
	let received = 0;
	let bytes = 0;
	for (let i = 0; i < totalChunks; i++) {
		try {
			const st = fs.statSync(path.join(dir, 'chunk-' + i + '.bin'));
			received++;
			bytes += st.size;
		} catch (_) { /* missing chunk */ }
	}
	return { received, bytes };
}

/** Read the upload sidecar (owner + totals), if one exists. */
function readUploadMeta(dir, uploadId) {
	try {
		return JSON.parse(fs.readFileSync(path.join(dir, uploadId + '.owner.json'), 'utf8'));
	} catch (_) {
		return null;
	}
}

/** Best-effort background sweep of stale staged uploads (never throws). */
async function sweepStaleUploads($i) {
	const root = stageRoot($i);
	let names;
	try {
		names = await fs.promises.readdir(root);
	} catch (_) {
		return { inspected: 0, deleted: 0 };
	}
	const now = Date.now();
	const result = { inspected: 0, deleted: 0 };
	for (const name of names) {
		if (!UPLOAD_ID_RE.test(name)) continue;
		const dir = path.join(root, name);
		let stat;
		try {
			stat = await fs.promises.stat(dir);
			if (!stat.isDirectory()) continue;
		} catch (_) {
			continue;
		}
		result.inspected++;
		const tarPath = path.join(dir, 'upload.tar.gz');
		const hasTar = fs.existsSync(tarPath);
		let mtime = stat.mtimeMs;
		try {
			if (hasTar) mtime = (await fs.promises.stat(tarPath)).mtimeMs;
		} catch (_) { /* keep dir mtime */ }
		if (now - mtime < UPLOAD_TTL_MS) continue;
		try {
			await fs.promises.rm(dir, { recursive: true, force: true });
			result.deleted++;
		} catch (_) { /* best effort */ }
		if (result.inspected % 64 === 0) await new Promise(resolve => setImmediate(resolve));
	}
	return result;
}

/** Schedule the stale-upload sweep at most every 4h (unref'd). */
function scheduleStageSweep($i) {
	if (stageSweepState.timer) return;
	const delay = Math.max(60000, stageSweepState.lastRun + STAGE_SWEEP_INTERVAL_MS - Date.now());
	const timer = setTimeout(async () => {
		stageSweepState.timer = null;
		stageSweepState.lastRun = Date.now();
		try {
			await sweepStaleUploads($i);
		} catch (_) { /* retention must never fail a request */ }
	}, delay);
	if (timer.unref) timer.unref();
	stageSweepState.timer = timer;
}

module.exports = {
	sweepStaleUploads,
	scheduleStageSweep,
	UPLOAD_TTL_MS,

	/** GET /packed/import/bulk/stage?uploadId= — upload progress + liveness. */
	async stageStatus() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const uploadId = String(requestValue(this.$i, 'uploadId') || '');
		if (!UPLOAD_ID_RE.test(uploadId)) {
			return { success: false, error: 'BAD_UPLOAD_ID', message: 'uploadId must match [A-Za-z0-9_-]{8,64}.' };
		}
		const dir = uploadDir(this.$i, uploadId);
		const meta = readUploadMeta(dir, uploadId);
		const totalChunks = Number(meta?.totalChunks) || 0;
		const complete = fs.existsSync(path.join(dir, 'upload.tar.gz'));
		let received = 0;
		let bytes = 0;
		if (totalChunks > 0 && !complete) {
			({ received, bytes } = countChunks(dir, totalChunks));
		} else if (complete) {
			try { bytes = fs.statSync(path.join(dir, 'upload.tar.gz')).size; } catch (_) {}
			received = totalChunks;
		}
		return { success: { uploadId, receivedChunks: received, totalChunks, complete, bytes, owner: meta?.identity || null } };
	},

	/**
	 * POST /packed/import/bulk/stage — resumable chunked tarball upload.
	 * Chunks are stored individually so re-uploads and out-of-order arrival
	 * are safe; the tarball is assembled once all chunks land.
	 * GET on the same path reports upload progress (see stageStatus).
	 */
	async stage() {
		if (this.$i?.request?.method === 'GET') return this.stageStatus();
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const body = this.$i?.body || {};
		const uploadId = String(body.uploadId || requestValue(this.$i, 'uploadId') || '');
		if (!UPLOAD_ID_RE.test(uploadId)) {
			return { success: false, error: 'BAD_UPLOAD_ID', message: 'uploadId must match [A-Za-z0-9_-]{8,64}.' };
		}
		const chunkIndex = Math.floor(Number(body.chunkIndex ?? requestValue(this.$i, 'chunkIndex')));
		const totalChunks = Math.floor(Number(body.totalChunks ?? requestValue(this.$i, 'totalChunks')));
		if (!Number.isFinite(chunkIndex) || chunkIndex < 0 || !Number.isFinite(totalChunks) || totalChunks < 1 || totalChunks > 100000 || chunkIndex >= totalChunks) {
			return { success: false, error: 'BAD_CHUNK', message: 'chunkIndex/totalChunks invalid.' };
		}
		let buf;
		try {
			buf = Buffer.from(String(body.data ?? requestValue(this.$i, 'data') ?? ''), 'base64');
		} catch (_) {
			return { success: false, error: 'BAD_DATA', message: 'data must be base64.' };
		}
		if (buf.length === 0 || buf.length > CHUNK_RAW_MAX * 1.5) {
			return { success: false, error: 'CHUNK_TOO_LARGE', message: 'chunk raw bytes must be 1..' + CHUNK_RAW_MAX + '.' };
		}
		const chunkSha256 = crypto.createHash('sha256').update(buf).digest('hex');
		const claimed = String(body.chunkSha256 || requestValue(this.$i, 'chunkSha256') || '');
		if (claimed && claimed.toLowerCase() !== chunkSha256) {
			return { success: false, error: 'CHUNK_HASH_MISMATCH', message: 'chunk bytes do not match the claimed chunkSha256; re-send the chunk.' };
		}
		const dir = uploadDir(this.$i, uploadId);
		fs.mkdirSync(dir, { recursive: true });
		// Owner sidecar: bind the uploadId to its staging caller (first
		// chunk wins; later chunks never overwrite the owner).
		const metaFile = path.join(dir, uploadId + '.owner.json');
		try {
			if (!fs.existsSync(metaFile)) {
				let identity = null;
				let aliasId = null;
				try {
					const ownership = require('./ownership.js');
					const caller = ownership.authenticate(this.$i);
					if (caller) {
						identity = String(caller.identity || caller.userId || '');
						aliasId = String(caller.aliasId || '');
					}
				} catch (_) { /* anonymous/machine caller */ }
				const accountCaller = this.__accountCaller || null;
				if (!identity && accountCaller) identity = String(accountCaller.identity || accountCaller.userId || '');
				fs.writeFileSync(metaFile, JSON.stringify({ uploadId, identity, aliasId, totalChunks, createdAt: Date.now() }));
			} else {
				const meta = readUploadMeta(dir, uploadId);
				if (meta && Number(meta.totalChunks) !== totalChunks) {
					fs.writeFileSync(metaFile, JSON.stringify({ ...meta, totalChunks }));
				}
			}
		} catch (_) { /* the sidecar is advisory; the upload must not fail on it */ }
		const chunkFile = path.join(dir, 'chunk-' + chunkIndex + '.bin');
		try {
			const existing = fs.readFileSync(chunkFile);
			if (crypto.createHash('sha256').update(existing).digest('hex') === chunkSha256) {
				// Re-sent chunk with a matching hash is a no-op.
				const { received } = countChunks(dir, totalChunks);
				return { success: { uploadId, chunkIndex, receivedChunks: received, totalChunks, complete: received === totalChunks, chunkSha256 } };
			}
		} catch (_) { /* no existing chunk */ }
		fs.writeFileSync(chunkFile, buf);
		const { received } = countChunks(dir, totalChunks);
		let complete = false;
		if (received === totalChunks) {
			const tarPath = path.join(dir, 'upload.tar.gz');
			const out = fs.openSync(tarPath, 'w');
			let totalBytes = 0;
			try {
				for (let i = 0; i < totalChunks; i++) {
					const c = fs.readFileSync(path.join(dir, 'chunk-' + i + '.bin'));
					fs.writeSync(out, c);
					totalBytes += c.length;
				}
			} finally {
				fs.closeSync(out);
			}
			for (let i = 0; i < totalChunks; i++) {
				try { fs.unlinkSync(path.join(dir, 'chunk-' + i + '.bin')); } catch (_) {}
			}
			if (totalBytes > STAGE_TOTAL_MAX || totalBytes === 0) {
				try { fs.unlinkSync(tarPath); } catch (_) {}
				return { success: false, error: 'STAGE_TOO_LARGE', message: 'assembled upload exceeds bounds.' };
			}
			complete = true;
		}
		scheduleStageSweep(this.$i);
		return { success: { uploadId, chunkIndex, receivedChunks: received, totalChunks, complete, chunkSha256 } };
	},
};
