//B"H
//Blessed is He
//Boruch Hashem

/**
 * BulkPublishAllRoutes dry-run loop and prebuilt-post import (split from bulkPublishAllRoutes.js).
 */

const fs = require('fs');
const path = require('path');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { validateCommentItem } = require('./bulkPublishAllRoutesComments.js');
const { setJob, yieldTick, perPostPath } = require('./bulkPublishAllRoutesPlumbing.js');

module.exports = {
	/** Dry run: validate + count everything, open nothing, write nothing. */
	async dryRunLoop($i, job, dir, files, prebuilt = false) {
		for (let i = 0; i < files.length; i++) {
			if (job.cancelRequested) { job.status = 'cancelled'; break; }
			const f = files[i];
			if (prebuilt) {
				// Prebuilt: verify the binary deserializes and count comments.
				const buf = fs.readFileSync(path.join(dir, 'files', f.file));
				let data;
				try {
					data = awts.deserializeBinary(buf);
				} catch (e) {
					throw new Error(f.file + ': PREBUILT_CORRUPT: ' + e.message);
				}
				const n = Array.isArray(data && data.comments) ? data.comments.length : 0;
				if (!n) throw new Error(f.file + ': PREBUILT_EMPTY');
				job.wrote += n;
			} else {
				const payload = JSON.parse(fs.readFileSync(path.join(dir, 'files', f.file), 'utf8'));
				const items = Array.isArray(payload.commentArray) ? payload.commentArray : [];
				for (let n = 0; n < items.length; n++) {
					const err = validateCommentItem(items[n], n);
					if (err) throw new Error(f.file + ': ' + err);
				}
				job.wrote += items.length; // would-write count
			}
			job.postsDone = i + 1;
			if (job.postsDone % 50 === 0) {
				job.updatedAt = Date.now();
				setJob(job);
			}
			await yieldTick();
		}
		if (job.status === 'running') job.status = 'done';
	},

	/**
	 * INSTANT PATH: one prebuilt post — the staged file is already a serialized
	 * AwtsmoosDB record (built by scripts/prebuildPublishAll.mjs). Zero parse,
	 * zero ID derivation, zero serialize: read the bytes, write them.
	 * Requires freshImport (no merge); the manifest entry carries postId/alias.
	 */
	async importPrebuiltPost($i, job, db, dir, f, spec) {
		if (!f || !f.file || !f.postId || !f.alias) throw new Error('MANIFEST_ENTRY_INVALID');
		if (!String(f.file).endsWith('.bin')) throw new Error('PREBUILT_NOT_BIN: ' + f.file);
		const buf = fs.readFileSync(path.join(dir, 'files', f.file));
		if (!buf.length) throw new Error('PREBUILT_EMPTY: ' + f.file);
		// Optional integrity check against the manifest sha256 (cheap, one hash).
		if (f.sha256) {
			const h = require('crypto').createHash('sha256').update(buf).digest('hex');
			if (h !== f.sha256) throw new Error('PREBUILT_SHA_MISMATCH: ' + f.file);
		}
		db.fs.write(perPostPath(f.alias, f.postId), buf);
		// Count comments for the job record without deserializing: the manifest
		// carries commentCount when the prebuilder sets it; else skip counting.
		const n = Number(f.commentCount) || 0;
		job.wrote += n;
		// Note: vectorRows for RAG are skipped in instant mode — the prebuilder
		// can emit a separate vector manifest, or a follow-up pass can backfill.
		// Skipping keeps the hot path at raw write speed.
	}
};
