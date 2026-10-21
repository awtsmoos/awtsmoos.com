//B"H
//Blessed is He
//Boruch Hashem

/**
 * BulkPublishAllRoutes one staged post import with merge (split from bulkPublishAllRoutes.js).
 */

const fs = require('fs');
const path = require('path');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { noteImportedComments } = require('../../search/rag/pendingCommentVectors.js');
const { validateCommentItem, buildComment } = require('./bulkPublishAllRoutesComments.js');
const { perPostPath } = require('./bulkPublishAllRoutesPlumbing.js');

module.exports = {
	/** One staged post: same merge/write semantics as the perPost path.
	 * When skipMerge is true (freshImport), the existing per-post file is not
	 * read — the post is written directly. Re-running still produces
	 * byte-identical files (deterministic IDs), so it stays idempotent. */
	async importOneStagedPost($i, job, db, dir, f, spec, skipMerge = false) {
		if (!f || !f.file || !f.postId || !f.alias) throw new Error('MANIFEST_ENTRY_INVALID');
		const payload = JSON.parse(fs.readFileSync(path.join(dir, 'files', f.file), 'utf8'));
		const items = Array.isArray(payload.commentArray) ? payload.commentArray : [];
		if (!items.length) {
			job.skipped++;
			return;
		}
		const ctx = { heichelId: spec.heichelId, seriesId: f.series, postId: f.postId, aliasId: f.alias };
		const now = Date.now();
		const comments = [];
		for (let n = 0; n < items.length; n++) {
			const err = validateCommentItem(items[n], n);
			if (err) throw new Error(f.file + ': ' + err);
			comments.push(buildComment(items[n], ctx, now));
		}
		// Idempotent union with any existing per-post file, by comment ID.
		// Skipped entirely in freshImport mode (caller guarantees overwrite is safe).
		const seen = new Set();
		const merged = [];
		if (!skipMerge) {
			const existing = this.readPerPostFile(db, f.alias, f.postId);
			if (existing && Array.isArray(existing.comments)) {
				for (const c of existing.comments) {
					if (c && c.id && !seen.has(c.id)) {
						seen.add(c.id);
						merged.push(c);
					}
				}
			}
		}
		let added = 0;
		const vectorRows = [];
		for (const c of comments) {
			if (seen.has(c.id)) {
				job.skipped++;
				continue;
			}
			seen.add(c.id);
			merged.push(c);
			added++;
			vectorRows.push({
				commentId: c.id, aliasId: f.alias, seriesId: f.series, postId: f.postId,
				verseSection: c.verseSection, subsectionId: c.subsectionId, content: c.content,
			});
		}
		const postData = {
			postId: f.postId, seriesId: f.series, aliasId: f.alias, heichelId: spec.heichelId,
			commentCount: merged.length, comments: merged,
		};
		db.fs.write(perPostPath(f.alias, f.postId), awts.serializeJSON(postData));
		// No per-post flush here: the caller flushes every FLUSH_EVERY_POSTS posts.
		if (vectorRows.length) {
			noteImportedComments({ $i, rows: vectorRows, aliasId: f.alias }).catch(() => {});
		}
		job.wrote += added;
	}
};
