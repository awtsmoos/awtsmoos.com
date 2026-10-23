//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedBulkImportRoutes per-post import core (PATH2) (split from bulkImportRoutes.js).
 */

const packed = require('../../comments/richDb/PackedStore.js');
const { noteImportedComments } = require('../../search/rag/pendingCommentVectors.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { perPostPath } = require('./bulkImportRoutesPaths.js');
const { buildComment } = require('./bulkImportRoutesComments.js');
const { setJob, yieldTick } = require('./bulkImportRoutesJobs.js');

module.exports = {
	async importPerPost($i, job, items, ctx) {
		const { heichelId, seriesId, postId, aliasId } = ctx;
		// The server already holds the exclusive lock; open() returns the cached
		// in-process handle — never a second writable store.
		const db = packed.open($i);
		const now = Date.now();
		const vectorRows = [];
		const flushVectorRows = () => {
			if (vectorRows.length === 0) return;
			const rows = vectorRows.splice(0, vectorRows.length);
			// Fire-and-forget: pending semantic vectors for newly imported
			// comments; idempotent by comment key, never blocks the import.
			noteImportedComments({ $i, rows, aliasId }).catch(() => {});
		};
		// Build the full comment list for this post (validates + derives IDs).
		const comments = [];
		for (let n = 0; n < items.length; n++) {
			if (job.cancelRequested) return 'cancelled';
			if (Date.now() - job.startedAt > job.timeBudgetMs) return 'paused-budget';
			const comment = buildComment(items[n], ctx, now);
			comments.push(comment);
			if (!job.dryRun) {
				vectorRows.push({
					commentId: comment.id, aliasId, seriesId, postId,
					verseSection: comment.verseSection, subsectionId: comment.subsectionId,
					content: comment.content,
				});
			}
			if (n % 200 === 199) { job.updatedAt = Date.now(); setJob(job); await yieldTick(); }
		}
		if (job.dryRun) {
			job.wrote = comments.length;
			flushVectorRows();
			return 'ok';
		}
		// Idempotent union: merge with any existing per-post file by comment ID.
		const existing = this.readPerPostFile(db, aliasId, postId);
		const seen = new Set();
		const merged = [];
		if (existing && Array.isArray(existing.comments)) {
			for (const c of existing.comments) {
				if (c && c.id && !seen.has(c.id)) { seen.add(c.id); merged.push(c); }
			}
		}
		let added = 0;
		const addedComments = [];
		for (const c of comments) {
			if (seen.has(c.id)) { job.skipped++; continue; }
			seen.add(c.id); merged.push(c); added++; addedComments.push(c);
		}
		const postData = {
			postId, seriesId, aliasId, heichelId,
			commentCount: merged.length,
			comments: merged,
		};
		db.fs.write(perPostPath(aliasId, postId), awts.serializeJSON(postData));
		if (db.fs.flush) db.fs.flush();
		// Worker G (2026-10-21): imported comments must appear in the alias
		// comment index (allFor) like native comments do. Guarded so it only
		// runs with a real app db handle and can never fail the import.
		if (addedComments.length && ($i?.db?.directory || $i?.db?.root)) {
			try {
				const { indexAliasCommentsBatch } = require('../../comments/aliasCommentIndex.js');
				await indexAliasCommentsBatch({ $i, comments: addedComments });
			} catch (_) { /* alias indexing is additive; import already succeeded */ }
		}
		flushVectorRows();
		job.wrote = added;
		return 'ok';
	}
};
