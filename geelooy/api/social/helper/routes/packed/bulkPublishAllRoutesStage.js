//B"H
//Blessed is He
//Boruch Hashem

/**
 * BulkPublishAllRoutes stage upload endpoint (split from bulkPublishAllRoutes.js).
 */

const fs = require('fs');
const path = require('path');
const { requireMethod, requestValue } = require('./requestValues.js');
const { UPLOAD_ID_RE, CHUNK_RAW_MAX, STAGE_TOTAL_MAX, uploadDir } = require('./bulkPublishAllRoutesPaths.js');

module.exports = {
	/**
	 * POST /packed/import/bulk/stage — resumable chunked tarball upload.
	 * Chunks are stored individually so re-uploads and out-of-order arrival
	 * are safe; the tarball is assembled once all chunks land.
	 */
	async stage() {
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
		const dir = uploadDir(this.$i, uploadId);
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, 'chunk-' + chunkIndex + '.bin'), buf);
		let received = 0;
		for (let i = 0; i < totalChunks; i++) {
			if (fs.existsSync(path.join(dir, 'chunk-' + i + '.bin'))) received++;
		}
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
		return { success: { uploadId, chunkIndex, receivedChunks: received, totalChunks, complete } };
	},
};
