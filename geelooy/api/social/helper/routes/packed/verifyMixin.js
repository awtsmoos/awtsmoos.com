// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VerifyMixin
 * @description Creates byte-exact packed-import verification jobs and caller-scoped status views.
 * The Awtsmoos compares each staged vessel with its live revelation without leaking another caller's hidden work.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { requireMethod, requestValue } = require('./requestValues.js');
const { extractTarball } = require('./tarball.js');
const { saveJobState, getJobView } = require('./jobState.js');
const { setJob } = require('./jobStore.js');
const { UPLOAD_ID_RE } = require('./importBounds.js');
const { summarizeReceipts, appendReceipt, closeReceipts, streamReceipts } = require('./jobReceipts.js');
const { contentHash } = require('./postValidate.js');
const { yieldTick } = require('./serverHealth.js');
const { appendJobLog } = require('./jobLog.js');
const {
	callerMaySeeVerify,
	callerOwnsAlias,
	verifyAccount
} = require('./verifyAccess.js');

module.exports = {
	/** POST /packed/import/posts/verify {uploadId} -> {verifyId}; or {jobId} for receipt-based verify. */
	async verify() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const account = verifyAccount(this);
		if (account.authError) return account.authError;
		const body = this.$i?.body || {};
		// Bulk-upload redesign §3.6: verify FROM THE RECEIPTS of a job —
		// per-post packed-hash + native + backlink checks, read from the
		// job's own receipts, never from a listing count (E5). The result
		// is itself a receipts file on the verify job.
		const jobId = String(body.jobId || body.job || requestValue(this.$i, 'jobId') || requestValue(this.$i, 'job') || '');
		if (jobId && !body.uploadId && !requestValue(this.$i, 'uploadId')) {
			return this.verifyFromReceipts(account, jobId);
		}
		const uploadId = String(body.uploadId || requestValue(this.$i, 'uploadId') || '');
		if (!UPLOAD_ID_RE.test(uploadId)) {
			return { success: false, error: 'BAD_UPLOAD_ID', message: 'uploadId must match [A-Za-z0-9_-]{8,64}' };
		}
		let dest;
		try {
			dest = await extractTarball(this.$i, uploadId);
		} catch (error) {
			return { success: false, error: 'STAGE_READ_FAILED', message: error.message };
		}
		let manifest;
		try {
			manifest = JSON.parse(fs.readFileSync(path.join(dest, 'manifest.json'), 'utf8'));
		} catch (error) {
			return { success: false, error: 'MANIFEST_UNREADABLE', message: error.message };
		}
		const files = Array.isArray(manifest.files) ? manifest.files : [];
		if (!files.length) {
			return { success: false, error: 'MANIFEST_EMPTY', message: 'No post files listed in manifest.json' };
		}
		const heichelId = String(files[0]?.heichelId || 'tanach');
		const jobAliasId = `${heichelId}-import`;
		const jobAliasName = `${heichelId} Import`;
		if (!await callerOwnsAlias(this, account.detailed, jobAliasId)) {
			return { success: false, error: 'FORBIDDEN', message: `Verify alias ${jobAliasId} is not one of your aliases.` };
		}
		const job = {
			id: `verify_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`,
			status: 'queued', uploadId, heichelId, aliasId: jobAliasId, aliasName: jobAliasName,
			stagedDir: dest, total: files.length, checked: 0, ok: 0, mismatches: [],
			createdAt: Date.now(), updatedAt: Date.now(), finishedAt: null, durationMs: null,
			spec: { heichelId, source: `verify:${uploadId}`, stagedDir: dest },
			doneHashes: {}
		};
		setJob(job);
		saveJobState(this.$i, { ...job });
		this.runVerify(this.$i, job, files).catch(() => {});
		return { success: { verifyId: job.id, total: files.length, status: job.status } };
	},

	/** POST /packed/import/posts/verify {jobId} — verify from the job's receipts. */
	async verifyFromReceipts(account, jobId) {
		const found = getJobView(this.$i, jobId);
		if (!found || !await callerMaySeeVerify(this, account.detailed, found)) {
			return { success: false, error: 'VERIFY_NOT_FOUND', jobId };
		}
		const view = found.view;
		const lineageId = view.resumeOf || view.id;
		// Nov 8 instant pass: stream the receipts — a 500K-post job's
		// receipts file is ~60 MB and the old readReceipts() array spiked
		// hundreds of MB. The verify engine consumes postId+hash one at
		// a time, so it takes the generator, not an array.
		const summary = summarizeReceipts(this.$i, lineageId);
		const total = summary.wrote + summary.updated + summary.skipped;
		if (!total) {
			return { success: false, error: 'NO_RECEIPTS', jobId, message: 'The job has no wrote/updated/skipped receipts to verify.' };
		}
		const heichelId = String(view.heichelId || 'tanach');
		const job = {
			id: `verify_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`,
			status: 'queued', jobId: view.id, verifyOf: lineageId, heichelId,
			aliasId: view.aliasId, aliasName: view.aliasName,
			total, checked: 0, ok: 0, mismatches: [],
			createdAt: Date.now(), updatedAt: Date.now(), finishedAt: null, durationMs: null,
			spec: { heichelId, source: `verify-receipts:${lineageId}` },
			doneHashes: {}
		};
		setJob(job);
		saveJobState(this.$i, { ...job });
		this.runVerifyFromReceipts(this.$i, job, streamReceipts(this.$i, lineageId)).catch(() => {});
		return { success: { verifyId: job.id, jobId: view.id, total, status: job.status, fromReceipts: true } };
	},

	/** The receipt-based verify engine: 3 checks per receipt, result is a receipts file. Consumes an iterable (streamed), never a materialized array. */
	async runVerifyFromReceipts($i, v, receipts) {
		await yieldTick();
		v.status = 'running';
		v.startedAt = Date.now();
		setJob(v);
		try {
			const liveHashes = await this.streamLiveHashes($i, v.heichelId);
			await yieldTick();
			let n = 0;
			for (const receipt of receipts) {
				// Only wrote/updated/skipped receipts name a live post;
				// 'failed' receipts are the job's own failure record, not
				// something to verify (the old code filtered them out
				// before calling; the stream carries them, so skip here).
				if (receipt.status !== 'wrote' && receipt.status !== 'updated' && receipt.status !== 'skipped') continue;
				const postId = String(receipt.postId || '');
				const expectedHash = receipt.hash || null;
				let problem = null;
				try {
					if (!expectedHash) {
						problem = 'RECEIPT_NO_HASH';
					} else {
						// 1. packed mirror check (streamed map — no per-post file scan).
						const liveHash = liveHashes.get(postId);
						if (liveHash !== expectedHash) {
							problem = liveHash ? 'PACKED_HASH_MISMATCH' : 'PACKED_NOT_FOUND';
						} else {
							// 2. native first-class record check.
							let live = null;
							try { live = await $i.db.get(`/social/heichelos/${v.heichelId}/posts/${postId}`); } catch (_) { /* ignore */ }
							if (!live) problem = 'NATIVE_NOT_FOUND';
							else if (contentHash(live) !== expectedHash) problem = 'NATIVE_HASH_MISMATCH';
							else {
								// 3. alias link check (alias/series from the live record).
								const aliasId = String(live.aliasId || '');
								const seriesId = String(live.seriesId || '');
								let link = null;
								try { link = await $i.db.get(`/social/aliases/${aliasId}/postsSubmitted/inHeichel/${v.heichelId}/inSeries/${seriesId}/${postId}`); } catch (_) { /* ignore */ }
								if (!link) problem = 'ALIAS_LINK_MISSING';
							}
						}
					}
				} catch (e) {
					problem = 'VERIFY_ERROR: ' + (e.message || e);
				}
				if (problem) {
					v.mismatches.push({ postId, problem });
					appendReceipt($i, v, { postId, hash: expectedHash, status: 'failed', error: problem });
				} else {
					v.ok++;
					appendReceipt($i, v, { postId, hash: expectedHash, status: 'skipped' });
				}
				v.checked++;
				n++;
				if (n % 25 === 0) {
					v.updatedAt = Date.now();
					setJob(v);
					await yieldTick();
				}
			}
			v.status = 'done';
		} catch (e) {
			v.status = 'failed';
			v.mismatches.push({ postId: '', problem: 'VERIFY_JOB_FAILED: ' + (e.message || e) });
		}
		v.finishedAt = Date.now();
		v.durationMs = v.finishedAt - v.startedAt;
		try { closeReceipts($i, v); } catch (_) { /* best effort */ }
		setJob(v);
		saveJobState($i, { ...v, spec: { heichelId: v.heichelId, source: 'verify-receipts:' + v.verifyOf }, doneHashes: {} });
		appendJobLog($i, { jobId: v.id, event: 'verify-' + v.status, checked: v.checked, ok: v.ok, mismatches: v.mismatches.length, durationMs: v.durationMs });
	},

	/** GET /packed/import/posts/verify-status?verify=<id> */
	async verifyStatus() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const account = verifyAccount(this);
		if (account.authError) return account.authError;
		const verifyId = requestValue(this.$i, 'verify')
			|| requestValue(this.$i, 'verifyId')
			|| requestValue(this.$i, 'jobId')
			|| requestValue(this.$i, 'id');
		const found = getJobView(this.$i, verifyId);
		if (!found || !await callerMaySeeVerify(this, account.detailed, found)) {
			return { success: false, error: 'VERIFY_NOT_FOUND', verifyId };
		}
		const view = found.view;
		let receipts = null;
		try {
			if (view.id) receipts = summarizeReceipts(this.$i, view.id);
		} catch (_) { /* advisory */ }
		return {
			success: {
				id: view.id, status: view.status, live: found.live,
				uploadId: view.uploadId, jobId: view.jobId || undefined, verifyOf: view.verifyOf || undefined, fromReceipts: !!view.verifyOf,
				heichelId: view.heichelId,
				total: view.total, checked: view.checked, ok: view.ok,
				mismatches: (view.mismatches || []).slice(0, 50),
				mismatchCount: (view.mismatches || []).length,
				receipts,
				durationMs: view.durationMs
			}
		};
	}
};
