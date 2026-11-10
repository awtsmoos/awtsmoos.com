//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file updateJobMixin.js
 * @description
 * Bulk-upload redesign §3.5: bulk update as a job.
 *  POST /packed/import/posts/update-job {heichelId, uploadId?, updates?, dryRun?, verify?}
 *    — the same field-level update semantics as the synchronous
 *    posts/update (load the native document, apply ONLY the named
 *    top-level fields, preserve everything else, idempotent no-op,
 *    identity-field guard, per-post ownership, per-series lock, verify
 *    by re-read) but as a durable job: any number of updates, streamed
 *    one at a time, per-update receipts, resume and retry-failed-only
 *    through the same endpoints as import jobs. The synchronous
 *    posts/update STAYS for small corrections (≤ 100).
 * Staged updates arrive as a tarball (same chunked upload) holding
 * updates.jsonl — one JSON update object per line — plus manifest.json
 * {files: [{file: 'updates.jsonl'}], kind: 'updates', totalUpdates}.
 * Inline updates (≤ 100) use the same body shape as posts/update.
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { requireMethod, requestValue } = require('./requestValues.js');
const { buildJob } = require('./jobFactory.js');
const { scheduleImportJob } = require('./importLaneScheduler.js');
const { getJobView, saveJobState } = require('./jobState.js');
const { appendReceipt, closeReceipts, donePostIdsFromReceipts } = require('./jobReceipts.js');
const { setJob } = require('./jobStore.js');
const { finalizeJob } = require('./runJobWorkers.js');
const { armJobWatchdog, clearJobWatchdog } = require('./jobWatchdog.js');
const { heartbeatJob } = require('./jobWatchdogPolicy.js');
const { extractTarball } = require('./tarball.js');
const { UPLOAD_ID_RE } = require('./importBounds.js');
const { yieldTick } = require('./serverHealth.js');
const ownership = require('./ownership.js');
// B"H 2026-11-10 (bulk-import speed fix): runJob (post imports) has
// always held the refcounted durability batching + complement-refresh
// deferral for its run (see runJobMixin fix (C)/(E)/(I)); the update
// job never did, so every updateOnePost paid full FS3 child-map
// flushes per native write and a 40-update job was watchdog-killed
// after 3 writes (~30-90s per post). The update job now holds the
// same batching and flushes once in its finally, before finalizeJob
// reports it done — a job that says "done" has its data durable, and
// crash loss stays bounded by the update semantics (idempotent
// re-apply; resume skips receipted postIds).
const { deferRefresh, undeferRefresh } = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/core/allocator/refreshDeferral.js');
const { setImportBatching, clearImportBatching, flushAllPending } = require('../../../../../../ayzarim/DosDB/durableFlush.js');
const { setImportBatching: setFs3ImportBatching, clearImportBatching: clearFs3ImportBatching } = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/storeState.js');

const INLINE_UPDATES_MAX_COUNT = 100;

/** Count the lines of a staged updates file without loading it. */
async function countUpdatesFile(file) {
	let count = 0;
	const rl = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
	for await (const line of rl) {
		if (line.trim()) count++;
	}
	return count;
}

/** Stream staged update entries one at a time (memory: one line). */
async function* streamUpdatesFile(file) {
	const rl = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
	for await (const line of rl) {
		if (!line.trim()) continue;
		yield JSON.parse(line);
	}
}

module.exports = {
	/** POST /packed/import/posts/update-job — admit a bulk update job. */
	async updateJob() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const detailed = this.checkAuthDetailed();
		if (detailed.authError) return detailed.authError;
		const caller = detailed.caller;
		const body = Object.assign({}, this.$i?.$_POST || {}, this.$i?.body || {});
		const heichelId = String(body.heichelId || requestValue(this.$i, 'heichelId') || '');
		if (!heichelId) return { success: false, error: 'BAD_ARGS', message: 'heichelId is required' };
		const dryRun = body.dryRun === true || body.dryRun === 'true';
		const verify = body.verify === true || body.verify === 'true';
		const uploadId = String(body.uploadId || requestValue(this.$i, 'uploadId') || '');
		let updates = null;
		let stagedDir = null;
		let updatesFile = null;
		let totalUpdates = 0;
		let source = 'inline';
		if (uploadId) {
			if (!UPLOAD_ID_RE.test(uploadId)) {
				return { success: false, error: 'BAD_UPLOAD_ID', message: 'uploadId must match [A-Za-z0-9_-]{8,64}' };
			}
			let dest;
			try {
				dest = await extractTarball(this.$i, uploadId);
			} catch (error) {
				return { success: false, error: 'STAGE_READ_FAILED', message: error.message };
			}
			const candidate = path.join(dest, 'updates.jsonl');
			if (!fs.existsSync(candidate)) {
				return { success: false, error: 'UPDATES_FILE_MISSING', message: 'staged upload has no updates.jsonl' };
			}
			stagedDir = dest;
			updatesFile = candidate;
			source = 'upload:' + uploadId;
			try {
				totalUpdates = await countUpdatesFile(candidate);
			} catch (error) {
				return { success: false, error: 'UPDATES_UNREADABLE', message: error.message };
			}
			if (!totalUpdates) return { success: false, error: 'NO_UPDATES', message: 'updates.jsonl is empty' };
		} else {
			let inline = body.updates ?? requestValue(this.$i, 'updates');
			if (typeof inline === 'string') {
				try { inline = JSON.parse(inline); } catch (_) { inline = null; }
			}
			if (!Array.isArray(inline) || inline.length === 0) {
				return { success: false, error: 'NO_UPDATES', message: 'Provide updates[] (inline, ≤ 100) or uploadId (staged updates.jsonl).' };
			}
			if (inline.length > INLINE_UPDATES_MAX_COUNT) {
				return { success: false, error: 'INLINE_TOO_LARGE', message: 'Inline updates exceed ' + INLINE_UPDATES_MAX_COUNT + ' (' + inline.length + ' given). Stage an updates.jsonl and pass uploadId.' };
			}
			updates = inline;
			totalUpdates = inline.length;
		}
		const job = buildJob({
			kind: 'update',
			dryRun,
			heichelId,
			isAdmin: !!caller?.isAdmin,
			jobAliasId: heichelId + '-import',
			jobAliasName: heichelId + ' Import',
			posts: [],
			skipLiveCheck: false,
			source,
			stagedDir,
			uploadId: uploadId || null,
			caller,
			timeBudgetMs: 600000
		});
		job.spec.updates = updates;
		job.spec.updatesFile = updatesFile;
		job.spec.verify = verify;
		job.totalPosts = totalUpdates;
		const admission = scheduleImportJob(this.$i, job, () => this.runUpdateJob(this.$i, job));
		if (admission.error) {
			return { error: admission.error, message: admission.message, retryable: admission.retryable, retryAfterMs: admission.retryAfterMs, persistError: admission.persistError || undefined };
		}
		return { success: { jobId: job.id, status: job.status, kind: 'update', held: admission.held || false, totalUpdates, source } };
	},

	/** Run one bulk-update job: same per-post semantics as posts/update, receipted. */
	async runUpdateJob($i, job) {
		await yieldTick();
		job.status = 'running';
		job.updatedAt = Date.now();
		setJob(job);
		saveJobState($i, job);
		armJobWatchdog($i, job);
		const heichelId = job.spec.heichelId;
		const verify = !!job.spec.verify;
		const dryRun = !!job.dryRun;
		const caller = job.caller || null;
		const callerScope = caller && !caller.isAdmin ? await ownership.callerAliasSet($i, caller) : null;
		// A resumed attempt skips receipted postIds while streaming.
		const done = job.resumeOf ? donePostIdsFromReceipts($i, job.resumeOf) : new Set();
		let seen = 0;
		let remaining = 0;
		// Deferred packed mirrors for this job's updates, flushed in
		// batches (see the require block above).
		const mirrorBatch = [];
		const flushMirror = () => {
			if (!mirrorBatch.length) return;
			try {
				for (const e of this.flushUpdateMirrorBatch($i, mirrorBatch)) {
					job.errors.push({ postId: e.postId, message: e.message });
				}
			} catch (error) {
				job.errors.push({ message: 'PACKED_BATCH_FAILED: ' + (error.message || error) });
			}
		};
		deferRefresh();
		setImportBatching();
		setFs3ImportBatching();
		try {
			const entries = job.spec.updatesFile
				? streamUpdatesFile(job.spec.updatesFile)
				: (async function* () { for (const u of (job.spec.updates || [])) yield u; })();
			for await (const u of entries) {
				if (job.status !== 'running') break;
				if (job.cancelRequested) { job.status = 'cancelled'; break; }
				heartbeatJob(job);
				seen++;
				const postId = String((u && (u.postId || u.id)) || '');
				if (postId && done.has(postId)) continue;
				remaining++;
				let result;
				try {
					result = await this.updateOnePost(heichelId, u, { dryRun, verify, caller, callerScope, mirrorBatch });
				} catch (error) {
					result = { postId, ok: false, error: 'UPDATE_FAILED', message: String((error && error.message) || error) };
				}
				if (mirrorBatch.length >= 50) flushMirror();
				job.postsDone++;
				if (result && result.ok) {
					if (result.noop) {
						job.skipped++;
						appendReceipt($i, job, { postId: result.postId || postId, status: 'skipped', dryRun });
					} else {
						job.updated++;
						appendReceipt($i, job, { postId: result.postId || postId, status: 'updated', dryRun });
					}
				} else {
					job.failed++;
					const message = String((result && (result.error || result.message)) || 'UPDATE_FAILED');
					job.errors.push({ postId: result?.postId || postId, message });
					appendReceipt($i, job, { postId: result?.postId || postId, status: 'failed', error: message, dryRun });
				}
				job.updatedAt = Date.now();
				// Breathe every post (same rule as processOneWrite): one
				// setImmediate round-trip lets web requests and watchdog
				// probes land between posts, however fast a post is.
				await new Promise(r => setImmediate(r));
				if (seen % 25 === 0) {
					setJob(job);
					saveJobState($i, job);
					await yieldTick();
				}
			}
			if (job.status === 'running') job.status = 'done';
			// The attempt total is the work actually attempted (done
			// entries from a previous attempt are not re-counted).
			job.totalPosts = remaining;
		} catch (error) {
			if (job.status === 'running') job.status = 'failed';
			job.errors.push({ message: 'UPDATE_JOB_FAILED: ' + (error.message || error) });
		} finally {
			// Job-end durability checkpoint (mirrors runJobMixin):
			// flush the remaining mirrors and every pending FS3 file
			// BEFORE the job is finalized, then release the batching.
			try { flushMirror(); } catch (_) { /* errors already recorded */ }
			flushAllPending();
			undeferRefresh();
			clearImportBatching();
			clearFs3ImportBatching();
		}
		try { closeReceipts($i, job); } catch (_) { /* best effort */ }
		clearJobWatchdog(job);
		finalizeJob($i, job);
	}
};
