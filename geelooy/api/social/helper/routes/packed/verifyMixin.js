//B"H
//Blessed is He
//Boruch Hashem

/** @module VerifyMixin
 * Import verification routes: creates a verify job against a staged
 * tarball (hash-checking posts without writing), and reports verify job
 * status.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { requireMethod, requestValue } = require('./requestValues.js');
const { extractTarball } = require('./tarball.js');
const { jobStateShape, saveJobState, getJobView } = require('./jobState.js');
const { setJob } = require('./jobStore.js');
const { UPLOAD_ID_RE } = require('./importBounds.js');
const { normalizePost } = require('./postValidate.js');

module.exports = {

	// -- byte-exact verification ------------------------------------------------
	// Yaakov 2026-10-11 (binding): verify 1,011/1,011 records byte-exact in
	// AwtsmoosDB format. A per-post HTTP verify (1011 x /packed/read) parses
	// the entire core shard file per request — it 500s and DOSes production.
	// Instead the verify runs server-side as a background job:
	//   1. ONE streaming pass over the core JSONL builds {postId -> liveHash}
	//      (O(1) memory — lines are parsed and discarded, never all held).
	//   2. Per manifest entry: expected hash from the staged source doc
	//      (normalizePost + aliasId, same as the import job); packed check
	//      against the streamed map; native check via $i.db.get on the
	//      first-class record; alias-link check.
	// POST /packed/import/posts/verify {uploadId, aliasId?, aliasName?}
	//   -> {verifyId}; poll GET /packed/import/posts/verify-status?verify=<id>.
	async verify() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const body = this.$i?.body || {};
		const uploadId = String(body.uploadId || requestValue(this.$i, 'uploadId') || '');
		if (!UPLOAD_ID_RE.test(uploadId)) {
			return { success: false, error: 'BAD_UPLOAD_ID', message: 'uploadId must match [A-Za-z0-9_-]{8,64}' };
		}
		let dest;
		try {
			dest = await extractTarball(this.$i, uploadId);
		} catch (e) {
			return { success: false, error: 'STAGE_READ_FAILED', message: e.message };
		}
		let manifest;
		try {
			manifest = JSON.parse(fs.readFileSync(path.join(dest, 'manifest.json'), 'utf8'));
		} catch (e) {
			return { success: false, error: 'MANIFEST_UNREADABLE', message: e.message };
		}
		const files = Array.isArray(manifest.files) ? manifest.files : [];
		if (!files.length) {
			return { success: false, error: 'MANIFEST_EMPTY', message: 'No post files listed in manifest.json' };
		}
		// heichelId/alias fallback come from the manifest itself, not client
		// parameters (keeps the signature simple: {ts, op, payloadHash}).
		const heichelId = String((files[0] && files[0].heichelId) || 'tanach');
		const jobAliasId = heichelId + '-import';
		const jobAliasName = heichelId + ' Import';
		const v = {
			id: 'verify_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex'),
			status: 'queued', uploadId, heichelId, aliasId: jobAliasId, aliasName: jobAliasName,
			stagedDir: dest, total: files.length,
			checked: 0, ok: 0, mismatches: [],
			createdAt: Date.now(), updatedAt: Date.now(), finishedAt: null, durationMs: null,
			// B"H 2026-10-11: in-memory job needs spec too — jobStateShape and
			// the jobs list read spec.* directly; without it status polls 500.
			spec: { heichelId, source: 'verify:' + uploadId, stagedDir: dest },
			doneHashes: {},
		};
		setJob(v);
		saveJobState(this.$i, { ...v });
		this.runVerify(this.$i, v, files).catch(() => {});
		return { success: { verifyId: v.id, total: files.length, status: v.status } };
	},


	/** GET /packed/import/posts/verify-status?verify=<id> */
	async verifyStatus() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const verifyId = requestValue(this.$i, 'verify') || requestValue(this.$i, 'verifyId') || requestValue(this.$i, 'jobId') || requestValue(this.$i, 'job') || requestValue(this.$i, 'id'); // Worker A 2026-10-21: accept jobId-style aliases, same defect class as status
		const found = getJobView(this.$i, verifyId);
		if (!found) return { success: false, error: 'VERIFY_NOT_FOUND', verifyId };
		const v = found.view;
		return {
			success: {
				id: v.id, status: v.status, live: found.live,
				uploadId: v.uploadId, heichelId: v.heichelId,
				total: v.total, checked: v.checked, ok: v.ok,
				mismatches: (v.mismatches || []).slice(0, 50),
				mismatchCount: (v.mismatches || []).length,
				durationMs: v.durationMs,
			}
		};
	}
};
