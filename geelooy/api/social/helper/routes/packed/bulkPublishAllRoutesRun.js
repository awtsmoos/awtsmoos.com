//B"H
//Blessed is He
//Boruch Hashem

/**
 * BulkPublishAllRoutes job dispatch and the publishAll streaming loop (split from bulkPublishAllRoutes.js).
 */

const fs = require('fs');
const path = require('path');
const packed = require('../../comments/richDb/PackedStore.js');
const { uploadDir, FLUSH_EVERY_POSTS } = require('./bulkPublishAllRoutesPaths.js');
const { setJob, appendJobLog, yieldTick } = require('./bulkPublishAllRoutesPlumbing.js');
const stageLifecycle = require('./stageLifecycle.js');

module.exports = {
	/** Dispatch publishAll jobs to the streaming loop; everything else to parent. */
	async runJob($i, job) {
		if (job && job.spec && job.spec.kind === 'publishAll') return this.runPublishAll($i, job);
		return super.runJob($i, job);
	},

	/** The one-call streaming loop. */
	async runPublishAll($i, job) {
		const spec = job.spec;
		job.status = 'running';
		job.startedAt = Date.now();
		job.postsDone = 0;
		setJob(job);
		appendJobLog($i, { jobId: job.id, event: 'started', kind: 'publishAll', uploadId: spec.uploadId, dryRun: !!job.dryRun });
		try {
			const dir = uploadDir($i, spec.uploadId);
			const manifestPath = path.join(dir, 'files', 'manifest.json');
			if (!fs.existsSync(manifestPath)) await this.extractTarball($i, spec.uploadId);
			const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
			const files = Array.isArray(manifest.files) ? manifest.files : [];
			if (!files.length) throw new Error('MANIFEST_EMPTY: no files listed.');
			// Manifest cross-check: every extracted payload file must be listed.
			const listed = new Set(files.map(f => f.file));
			for (const n of fs.readdirSync(path.join(dir, 'files'))) {
				if (n === 'manifest.json') continue;
				if (!listed.has(n)) throw new Error('MANIFEST_MISMATCH: extra file ' + n);
			}
			job.totalPosts = files.length;
			job.updatedAt = Date.now();
			setJob(job);
			// INSTANT MODE: a prebuilt manifest carries pre-serialized binaries
			// (built by scripts/prebuildPublishAll.mjs on the VM). Combined with
			// freshImport, the server does zero parsing, zero ID derivation,
			// zero serialization — just a direct DB write per post.
			const prebuilt = manifest.prebuilt === true;
			const freshImport = spec.freshImport === true;
			if (prebuilt && !freshImport) {
				throw new Error('PREBUILT_REQUIRES_FRESH: prebuilt manifests require freshImport:true (no merge possible on pre-serialized records).');
			}
			if (job.dryRun) {
				await this.dryRunLoop($i, job, dir, files, prebuilt);
			} else {
				// Explicit per-call approval. open() itself is O(1): it reads
				// only the 64-byte superblock; the page cache is demand-driven.
				const db = packed.open($i, { allowOversizedStore: true });
				let sinceFlush = 0;
				// Fresh imports flush once at the end (the fsync is ~4s; doing
				// it every 100 posts dominates runtime). The v3 store
				// auto-flushes on cache-budget pressure, so memory stays bounded
				// even without periodic flushes. Standard (merge) imports keep
				// the periodic flush for durability during long runs.
				const flushEvery = freshImport ? Infinity : FLUSH_EVERY_POSTS;
				for (let i = 0; i < files.length; i++) {
					if (job.cancelRequested) { job.status = 'cancelled'; break; }
					if (Date.now() - job.startedAt > job.timeBudgetMs) {
						job.status = 'paused';
						job.errors.push({ message: 'TIME_BUDGET_EXCEEDED' });
						break;
					}
					if (prebuilt) {
						await this.importPrebuiltPost($i, job, db, dir, files[i], spec);
					} else {
						await this.importOneStagedPost($i, job, db, dir, files[i], spec, freshImport);
					}
					job.postsDone = i + 1;
					sinceFlush++;
					if (sinceFlush >= flushEvery) {
						if (db.fs.flush) db.fs.flush();
						sinceFlush = 0;
					}
					if (job.postsDone % 10 === 0) {
						job.updatedAt = Date.now();
						setJob(job);
					}
					await yieldTick();
				}
				if (job.status === 'running') {
					if (db.fs.flush) db.fs.flush();
					job.status = 'done';
				}
			}
		} catch (e) {
			job.status = 'failed';
			job.errors.push({ message: e.message, stack: e.stack });
		}
		job.finishedAt = Date.now();
		job.durationMs = job.finishedAt - job.startedAt;
		setJob(job);
		stageLifecycle.cleanupStageAfterJob($i, job).catch(() => {});
		stageLifecycle.sweepStaleStages($i, {}).catch(() => {});
		appendJobLog($i, {
			jobId: job.id, event: job.status,
			postsDone: job.postsDone, totalPosts: job.totalPosts,
			wrote: job.wrote, skipped: job.skipped,
			errors: job.errors.length, durationMs: job.durationMs,
		});
	}
};
