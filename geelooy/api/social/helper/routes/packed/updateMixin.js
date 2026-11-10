//B"H
//Blessed is He
//Boruch Hashem

/** @module UpdateMixin
 * Bulk PARTIAL update for existing posts:
 *   POST /packed/import/posts/update
 *   Body: { heichelId, dryRun?, verify?,
 *           updates: [{ seriesId, postId, set: {field: value, ...},
 *                       unset?: [field, ...] }, ...] }
 *
 * Why this exists (2026-10-21, user order): the importer's start route
 * REPLACES whole documents - normalizePost() clones the payload and
 * writeNativePostOnly()/mirrorPostBulk() write it verbatim, so any field
 * absent from a re-import payload (studyGuide, phraseTranslations,
 * embedded comments, metadata) is silently destroyed. Enrichment work
 * ("add studyGuide to the posts that lack one") needs field-level writes.
 *
 * Semantics: per post, load the existing native document, apply ONLY the
 * named top-level fields (set replaces a field wholesale - no nested
 * merge; unset deletes a field), preserve every other field exactly as
 * loaded, and write back through the SAME native + packed-mirror path
 * the importer uses (writeNativePostOnly + writeOnePostBulk), so the
 * native record, packed core shard, allPosts mirror, manifest and
 * search indexes stay consistent. No import job slot is taken; the
 * per-series lock (importBounds.acquireSeriesLock, same key format as
 * seriesAddsMixin) is held per series group so series-index flushes
 * from a running import job cannot interleave with these writes.
 *
 * Identity fields (postId, id, heichelId, seriesId, parentSeriesId) can
 * never be changed through set - a differing value is a per-post error.
 * Re-applying an update whose values already match is a no-op success
 * (no write, no mirror churn): the endpoint is idempotent. Partial
 * failures never abort the batch. dryRun loads and diffs but never
 * writes. verify re-reads each written post and deep-compares the named
 * fields. No bookkeeping fields are invented: updatedAt/importedAt are
 * preserved unless the caller names them in set.
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { acquireSeriesLock, INLINE_POSTS_MAX_BYTES, PER_POST_MAX_BYTES } = require('./importBounds.js');
const { cleanClone } = require('./postValidate.js');
const ownership = require('./ownership.js');
// B"H 2026-11-10 (bulk-import speed fix): the post-import job path
// (runJobMixin) has always widened the FS3 durability budget and
// deferred the AwtsmoosDB complement refresh for its run — the update
// path never did, so EVERY native write in an update paid a full
// directory child-map flush (durableFlush's own header measures that
// flush as the dominant FS3 write cost) plus periodic full-graph
// complement verifies. That is why one update blocked the event loop
// for 30-90 seconds while a fresh post import takes well under a
// second. The update paths now hold the exact same refcounted
// batching for their whole run and flush once at the end, exactly
// like runJobMixin: crash loss stays bounded by the endpoint's
// idempotency (a lost micro-batch is a no-op re-apply).
const { deferRefresh, undeferRefresh } = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/core/allocator/refreshDeferral.js');
const { setImportBatching, clearImportBatching, flushAllPending } = require('../../../../../../ayzarim/DosDB/durableFlush.js');
const { setImportBatching: setFs3ImportBatching, clearImportBatching: clearFs3ImportBatching } = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/storeState.js');
const { mirrorPostsBulk } = require('../../packed/socialPacked.js');

/** Flush a deferred packed-mirror batch (updateOnePost collects the
 * updated documents when opts.mirrorBatch is passed). One append per
 * shard per batch instead of per-post writePacked records; on batch
 * failure falls back to the per-post writer so no post loses its
 * mirror. Returns a list of per-post mirror errors (usually empty). */
function flushMirrorBatch(routes, $i, batch) {
	const errors = [];
	if (!batch || !batch.length) return errors;
	const posts = batch.splice(0, batch.length);
	const _mt0 = Date.now();
	try {
		mirrorPostsBulk({ $i, posts, skipPriorRead: false });
		console.log('[UPDATE-TIME] mirrorBatch ms=' + (Date.now() - _mt0) + ' posts=' + posts.length);
	} catch (e) {
		for (const p of posts) {
			try { routes.writeOnePostBulk($i, p); }
			catch (e2) { errors.push({ postId: p.postId, message: 'PACKED_MIRROR_FAILED: ' + (e2.message || e2) }); }
		}
	}
	return errors;
}

// Per-request update cap: tighter than the importer's 500-post inline
// cap because every update is a load + full-document rewrite done
// synchronously in-request on a 2 GB box. Callers loop for larger runs.
const UPDATE_MAX_COUNT = 100;
const IDENTITY_FIELDS = new Set(['postId', 'id', 'heichelId', 'seriesId', 'parentSeriesId']);
const FORBIDDEN_FIELDS = new Set(['__proto__', 'constructor', 'prototype']);

/** Stable deep-equal via sorted-key JSON (values are JSON documents). */
function stableStringify(v) {
	if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'undefined';
	if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
	const keys = Object.keys(v).sort();
	return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(v[k])).join(',') + '}';
}
function deepEqual(a, b) {
	if (a === b) return true;
	return stableStringify(a) === stableStringify(b);
}
function truthy(v) { return v === true || v === 'true' || v === '1' || v === 1; }

module.exports = {

	async update() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const _authD = this.checkAuthDetailed();
		if (_authD.authError) return _authD.authError;
		const caller = _authD.caller;
		const callerScope = caller && !caller.isAdmin ? await ownership.callerAliasSet(this.$i, caller) : null;
		try { const _h = (this.$i && this.$i.headers) || {}; console.log('[AGENT-OP] update id=' + (_h['x-agent-identity'] || 'UNIDENTIFIED') + ' kind=' + (_h['x-agent-kind'] || 'UNKNOWN')); } catch (_) {}
		const body = Object.assign({}, this.$i?.$_POST || {}, this.$i?.body || {});
		const heichelId = String(body.heichelId || requestValue(this.$i, 'heichelId') || '');
		if (!heichelId) return { success: false, error: 'BAD_ARGS', message: 'heichelId is required' };
		let updates = body.updates ?? requestValue(this.$i, 'updates');
		if (typeof updates === 'string') {
			try { updates = JSON.parse(updates); } catch (_) { updates = null; }
		}
		if (!Array.isArray(updates) || updates.length === 0) {
			return { success: false, error: 'NO_UPDATES', message: 'Provide updates: [{seriesId, postId, set:{...}, unset?:[...]}]' };
		}
		if (updates.length > UPDATE_MAX_COUNT) {
			return { success: false, error: 'INLINE_TOO_LARGE', message: 'Inline updates exceed ' + UPDATE_MAX_COUNT + ' (' + updates.length + ' given). Split the batch.' };
		}
		let approxBytes = 0;
		try { approxBytes = Buffer.byteLength(JSON.stringify(updates)); } catch (_) { approxBytes = Infinity; }
		if (approxBytes > INLINE_POSTS_MAX_BYTES) {
			return { success: false, error: 'INLINE_TOO_LARGE', message: 'Inline payload exceeds ~20 MB.' };
		}
		const dryRun = truthy(body.dryRun ?? requestValue(this.$i, 'dryRun'));
		const verify = truthy(body.verify ?? requestValue(this.$i, 'verify'));

		// Group by seriesId (entries without one keep seriesId '' and are
		// resolved from the heichel-level record at load time), preserving
		// original order inside each group.
		const groups = new Map();
		updates.forEach((u, idx) => {
			const key = (u && typeof u === 'object' && u.seriesId) ? String(u.seriesId) : '';
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key).push({ u, idx });
		});

		const results = new Array(updates.length);
		const mirrorBatch = [];
		const mirrorErrors = [];
		// Hold the import durability budget for the whole request (see
		// the require block above): native writes stop paying a full
		// child-map flush each, and everything is flushed once here at
		// the end — the request reports success only after that flush.
		deferRefresh();
		setImportBatching();
		setFs3ImportBatching();
		try {
			for (const [seriesKey, items] of groups) {
				const lockKey = JSON.stringify([heichelId, seriesKey]);
				const release = await acquireSeriesLock(lockKey);
				try {
					for (const { u, idx } of items) {
						results[idx] = await this.updateOnePost(heichelId, u, { dryRun, verify, caller, callerScope, mirrorBatch });
						await new Promise(r => setImmediate(r));
					}
				} finally {
					release();
				}
				mirrorErrors.push(...flushMirrorBatch(this, this.$i, mirrorBatch));
			}
		} finally {
			mirrorErrors.push(...flushMirrorBatch(this, this.$i, mirrorBatch));
			const _ft0 = Date.now();
			flushAllPending();
			console.log('[UPDATE-TIME] flushAllPending ms=' + (Date.now() - _ft0));
			undeferRefresh();
			clearImportBatching();
			clearFs3ImportBatching();
		}

		let ok = 0, failed = 0, noop = 0;
		for (const r of results) {
			if (r && r.ok) { ok++; if (r.noop) noop++; } else failed++;
		}
		return { success: { heichelId, dryRun, verify, total: updates.length, ok, failed, noop, mirrorErrors, results } };
	},


	/** Load the native post document: series path first (the importer's
	 * primary write), heichel-level path as fallback. Null when absent. */
	async loadNativePost(heichelId, seriesId, postId) {
		const paths = [];
		if (seriesId) paths.push(`/social/heichelos/${heichelId}/series/${seriesId}/posts/${postId}`);
		paths.push(`/social/heichelos/${heichelId}/posts/${postId}`);
		for (const p of paths) {
			try {
				const doc = await this.$i.db.get(p);
				if (doc && typeof doc === 'object') return doc;
			} catch (_) { /* missing path -> try next */ }
		}
		return null;
	},


	async updateOnePost(heichelId, u, opts) {
		const _pt0 = Date.now();
		const { dryRun, verify } = opts;
		if (!u || typeof u !== 'object' || Array.isArray(u)) {
			return { postId: null, ok: false, error: 'BAD_UPDATE', message: 'update entry is not an object' };
		}
		const postId = String(u.postId || '');
		const seriesId = u.seriesId ? String(u.seriesId) : '';
		const set = (u.set && typeof u.set === 'object' && !Array.isArray(u.set)) ? u.set : {};
		const unset = Array.isArray(u.unset) ? u.unset.map(String) : [];
		if (!postId) return { postId: null, ok: false, error: 'BAD_UPDATE', message: 'postId is required' };
		const setKeys = Object.keys(set);
		if (!setKeys.length && !unset.length) {
			return { postId, ok: false, error: 'EMPTY_UPDATE', message: 'set and unset are both empty' };
		}
		for (const k of [...setKeys, ...unset]) {
			if (FORBIDDEN_FIELDS.has(k)) return { postId, ok: false, error: 'FORBIDDEN_FIELD', message: 'field not allowed: ' + k };
		}

		const existing = await this.loadNativePost(heichelId, seriesId, postId);
		console.log('[UPDATE-TIME] load ms=' + (Date.now() - _pt0) + ' post=' + postId + ' docBytes=' + (existing ? Buffer.byteLength(JSON.stringify(existing)) : -1));
		if (!existing) return { postId, ok: false, error: 'POST_NOT_FOUND', message: 'no native post at heichel ' + heichelId + (seriesId ? ' series ' + seriesId : '') };

		// Multi-user ownership (2026-10-21): a non-admin caller may only
		// update their OWN posts, and may not reassign a post's owner.
		if (opts && opts.callerScope) {
			if (!ownership.ownsPost(opts.caller, existing, opts.callerScope)) {
				return { postId, ok: false, error: 'FORBIDDEN_OWNERSHIP', message: 'post ' + postId + ' is owned by ' + (ownership.postOwnerId(existing) || 'another user') + ', not by ' + opts.caller.identity };
			}
			const newOwner = ownership.postOwnerId({ aliasId: set.aliasId, author: set.author });
			if (newOwner && newOwner !== ownership.postOwnerId(existing)) {
				return { postId, ok: false, error: 'FORBIDDEN_OWNERSHIP', message: 'set may not reassign post ownership to ' + newOwner };
			}
		}

		// Identity guard: identity fields may be repeated with their
		// current value (harmless no-op) but never changed or unset.
		for (const k of setKeys) {
			if (IDENTITY_FIELDS.has(k) && String(set[k]) !== String(existing[k] ?? '')) {
				return { postId, ok: false, error: 'IDENTITY_FIELD', message: 'set may not change identity field: ' + k };
			}
		}
		for (const k of unset) {
			if (IDENTITY_FIELDS.has(k)) return { postId, ok: false, error: 'IDENTITY_FIELD', message: 'unset may not remove identity field: ' + k };
		}

		const changed = [];
		for (const k of setKeys) {
			if (!deepEqual(existing[k], set[k])) changed.push(k);
		}
		const unsetChanged = [];
		for (const k of unset) {
			if (Object.prototype.hasOwnProperty.call(existing, k)) { changed.push(k); unsetChanged.push(k); }
		}

		if (!changed.length) return { postId, ok: true, noop: true, changed: [] };
		if (dryRun) return { postId, ok: true, dryRun: true, exists: true, wouldChange: changed, changed: [] };

		let updated;
		const _t0 = Date.now();
		try {
			updated = cleanClone(existing, 0);
			for (const k of unsetChanged) delete updated[k];
			for (const k of setKeys) updated[k] = cleanClone(set[k], 0);
			// writeNativePostOnly keys the series path off seriesId; the
			// loaded document is authoritative, the entry is the fallback.
			if (!updated.seriesId && seriesId) updated.seriesId = seriesId;
			if (!updated.heichelId) updated.heichelId = heichelId;
			if (!updated.postId) updated.postId = postId;
			const size = Buffer.byteLength(JSON.stringify(updated));
			if (size > PER_POST_MAX_BYTES) {
				return { postId, ok: false, error: 'POST_TOO_LARGE', message: 'updated post is ' + size + ' bytes (cap ' + PER_POST_MAX_BYTES + ')' };
			}
			console.log('[UPDATE-TIME] clone+size ms=' + (Date.now() - _t0) + ' bytes=' + size + ' post=' + postId);
			const _t1 = Date.now();
			await this.writeNativePostOnly(this.$i, updated);
			console.log('[UPDATE-TIME] nativeWrite ms=' + (Date.now() - _t1) + ' post=' + postId);
			// B"H 2026-11-10 (bulk-import speed fix): when the caller
			// passes a mirrorBatch, the packed mirror is deferred to
			// the caller's batched flush (one append per shard per
			// batch, no per-record key-index persist); otherwise the
			// historic per-post mirror write runs unchanged.
			if (opts && Array.isArray(opts.mirrorBatch)) opts.mirrorBatch.push(updated);
			else this.writeOnePostBulk(this.$i, updated);
		} catch (e) {
			return { postId, ok: false, error: 'WRITE_FAILED', message: String((e && e.message) || e), changed };
		}

		const result = { postId, ok: true, changed };
		if (verify) {
			const reread = await this.loadNativePost(heichelId, updated.seriesId || seriesId, postId);
			let verified = !!reread;
			if (verified) {
				for (const k of setKeys) {
					if (!deepEqual(reread[k], set[k])) { verified = false; break; }
				}
				if (verified) {
					for (const k of unsetChanged) {
						if (Object.prototype.hasOwnProperty.call(reread, k)) { verified = false; break; }
					}
				}
			}
			result.verified = verified;
			if (!verified) { result.ok = false; result.error = 'VERIFY_MISMATCH'; }
		}
		return result;
	},


	/** Shared batched-mirror flush for update callers (updateJobMixin):
	 * drains a mirrorBatch collected through updateOnePost's
	 * opts.mirrorBatch. Returns per-post mirror errors. */
	flushUpdateMirrorBatch($i, batch) {
		return flushMirrorBatch(this, $i, batch);
	}
};
