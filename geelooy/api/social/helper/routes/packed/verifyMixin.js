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
const {
	callerMaySeeVerify,
	callerOwnsAlias,
	verifyAccount
} = require('./verifyAccess.js');

module.exports = {
	/** POST /packed/import/posts/verify {uploadId} -> {verifyId}. */
	async verify() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const account = verifyAccount(this);
		if (account.authError) return account.authError;
		const body = this.$i?.body || {};
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
		return {
			success: {
				id: view.id, status: view.status, live: found.live,
				uploadId: view.uploadId, heichelId: view.heichelId,
				total: view.total, checked: view.checked, ok: view.ok,
				mismatches: (view.mismatches || []).slice(0, 50),
				mismatchCount: (view.mismatches || []).length,
				durationMs: view.durationMs
			}
		};
	}
};
