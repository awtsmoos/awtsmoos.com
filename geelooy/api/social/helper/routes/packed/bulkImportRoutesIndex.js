//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedBulkImportRoutes per-post index builder (split from bulkImportRoutes.js).
 */

const packed = require('../../comments/richDb/PackedStore.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { CHASSIDUS_BASE, CHASSIDUS_INDEX } = require('./bulkImportRoutesPaths.js');
const { setJob, yieldTick } = require('./bulkImportRoutesJobs.js');
const { heapTooHigh } = require('./bulkImportRoutesGuards.js');

module.exports = {
	async buildPerPostIndex($i, job) {
		const db = packed.open($i);
		const index = {};
		let total = 0;
		let aliases = [];
		try {
			aliases = db.fs.ls(CHASSIDUS_BASE) || [];
		} catch (e) {
			job.errors.push({ message: 'INDEX_LS_FAILED: ' + e.message });
			return 'failed';
		}
		// OOM guard: the index is a single in-memory object + one serialized
		// string. Abort cleanly if the heap gets hot mid-build rather than
		// OOM-killing the server. The index is a read fallback only; the
		// primary lookup (alias parsed from comment ID -> per-post file)
		// works without it.
		for (const alias of aliases) {
			if (job.cancelRequested) return 'cancelled';
			if (String(alias).startsWith('_')) continue;
			if (heapTooHigh()) {
				job.errors.push({ message: 'INDEX_ABORTED_MEMORY: heap exceeded safe threshold during index build. Primary per-post lookup is unaffected.' });
				return 'failed';
			}
			let files = [];
			try { files = db.fs.ls(CHASSIDUS_BASE + '/' + alias) || []; }
			catch (_) { continue; }
			for (const f of files) {
				if (job.cancelRequested) return 'cancelled';
				if (Date.now() - job.startedAt > job.timeBudgetMs) return 'paused-budget';
				const data = this.readPerPostFile(db, alias, String(f).replace(/\.json$/, ''));
				if (!data || !Array.isArray(data.comments)) continue;
				for (const c of data.comments) {
					if (c && c.id) { index[c.id] = data.postId || c.postId; total++; }
				}
				job.wrote++;
				if (job.wrote % 25 === 0) {
					job.updatedAt = Date.now(); setJob(job); await yieldTick();
					if (heapTooHigh()) {
						job.errors.push({ message: 'INDEX_ABORTED_MEMORY: heap exceeded safe threshold during index build. Primary per-post lookup is unaffected.' });
						return 'failed';
					}
				}
			}
		}
		if (!job.dryRun) {
			db.fs.write(CHASSIDUS_INDEX, awts.serializeJSON(index));
			if (db.fs.flush) db.fs.flush();
		}
		job.skipped = total;
		return 'ok';
	}
};
