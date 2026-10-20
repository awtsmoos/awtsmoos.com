//B"H
//Blessed is He
//Boruch Hashem

/** @module EnsureBacklinksMixin
 * POST route that creates a backlink-repair job for a staged tarball:
 * recomputes alias backlinks for posts whose backlinks were deferred or
 * lost. The job body is runBacklinks (backlinksRepairMixin).
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { requireMethod, requestValue } = require('./requestValues.js');
const { extractTarball } = require('./tarball.js');
const { UPLOAD_ID_RE } = require('./importBounds.js');
const { setJob } = require('./jobStore.js');
const { saveJobState } = require('./jobState.js');

module.exports = {

	// -- alias backlink repair ------------------------------------------------
	// Yaakov 2026-10-11 (binding): the 1,011-post Tanach import landed before
	// the backlink writes existed, so every post verifies ALIAS_LINK_MISSING.
	// This endpoint writes ONLY the missing alias backlinks (never touches
	// post bodies):
	//   /social/aliases/<aliasId>/heichelosContributedTo/<heichelId> = true
	//   /social/aliases/<aliasId>/postsSubmitted/inHeichel/<h>/inSeries/<s>/<postId> = true
	// Idempotent: existing links are skipped, never duplicated.
	// POST /packed/import/posts/ensure-backlinks {uploadId}
	//   -> {backlinkId}; poll GET /packed/import/posts/backlinks-status?backlinks=<id>.
	async ensureBacklinks() {
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
		const heichelId = String((files[0] && files[0].heichelId) || 'tanach');
		const jobAliasId = heichelId + '-import';
		const b = {
			id: 'backlinks_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex'),
			status: 'queued', uploadId, heichelId, aliasId: jobAliasId,
			stagedDir: dest, total: files.length,
			checked: 0, written: 0, skipped: 0, errors: [],
			createdAt: Date.now(), updatedAt: Date.now(), finishedAt: null, durationMs: null,
			spec: { heichelId, source: 'backlinks:' + uploadId, stagedDir: dest },
			doneHashes: {},
		};
		setJob(b);
		saveJobState(this.$i, { ...b });
		this.runBacklinks(this.$i, b, files).catch(() => {});
		return { success: { backlinkId: b.id, total: files.length, status: b.status } };
	}
};
