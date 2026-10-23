//B"H
//Blessed is He
//Boruch Hashem

/** @module SubmissionsMixin
 * SUBMISSIONS for PackedPostImportRoutes (Worker J, 2026-10-21, user
 * orders ~19:57-19:58 EDT: multi-user platform + submissions feature).
 *
 * A user — or their AI agent acting AS them — submits a post into
 * SOMEONE ELSE's heichel. It lands PENDING, never live. The heichel
 * owner reviews through this same API: approve publishes the post
 * (credited to the SUBMITTER) through the standard packed write path
 * (writeNativePostOnly + writeOnePostBulk, so native record, packed
 * mirrors, manifest and search indexes stay consistent); deny stores
 * a reason the submitter can read back. The owner's own agent decides
 * through these SAME endpoints acting as the owner — there is no
 * agent backdoor. Every decision appends to a per-heichel decisions
 * log with its basis (the decider's `basis` string, or the standing
 * moderation-instructions version when none is passed). Decisions are
 * reversible by the owner/admin: an approval reversal removes the
 * published post (native deletes + alias backlink delete + packed
 * tombstone, mirroring removeMixin) and the submission becomes
 * 'reverted' (it may be decided again); a denial reversal returns the
 * submission to 'pending'.
 *
 * Routes:
 *   POST /packed/submissions            submit {heichelId, seriesId, post}
 *   GET  /packed/submissions            review queue ?heichelId=&status=&limit=&cursor=
 *   GET  /packed/submissions/mine       my submissions ?status=&limit=&cursor=
 *   GET  /packed/submissions/settings   ?heichelId=  (any authenticated user:
 *                                       allowSubmissions flag; owner/admin
 *                                       also get moderation instructions)
 *   POST /packed/submissions/settings   owner/admin: {heichelId,
 *                                       allowSubmissions?, requirePostApproval?,
 *                                       moderationInstructions?}
 *   POST /packed/submissions/approve    owner/admin {id, basis?}
 *   POST /packed/submissions/deny       owner/admin {id, reason?, basis?}
 *   POST /packed/submissions/reverse    owner/admin {id, reason?, basis?}
 *   GET  /packed/submissions/decisions  owner/admin ?heichelId=&limit=&cursor=
 *
 * OWNER SETTING home: the heichel's EXISTING submissions settings
 * record (/social/heichelos/<id>/settings/submissions, see
 * heichelRolesCore.settingsPath) — extended in place with
 * allowSubmissions + moderationInstructions fields, never a parallel
 * store. DEFAULT: the existing model defaults allowPostSubmissions to
 * true, so submissions are OPEN unless the owner closes them (the
 * effective flag is allowSubmissions when set, else
 * allowPostSubmissions, else open).
 *
 * AUTH: one place — subsAuthenticate() returns {identity, isAdmin,
 * via}. DROP-IN SEAM for Worker I's shared helper: when the composed
 * prototype provides authenticate() it is preferred (same shape as
 * notesMixin). Fallback order: valid import signature (admin), any
 * valid OAuth bearer (identity = account userId; admin iff the
 * operator account asdf), operator key (admin). Agents act AS their
 * authorizing user; admin = full scope. Ownership: the caller's alias
 * set (identity + /users/<identity>/aliases) contains the heichel
 * info.author or intersects the heichel editors list.
 *
 * Storage: submissionsStore.js — one JSON file per submission under
 * <dbRoot>/socialPacked/submissions/, JSONL indexes + decisions log.
 * Queues scan indexes newest-first and load one record at a time with
 * a scan budget: memory stays O(page).
 */

const crypto = require('crypto');
const { requireMethod, requestValue } = require('./requestValues.js');
const { myOpts } = require('../../general.js');
const { settingsPath, SETTING_DEFAULTS, boolFromPayload } = require('../../heichelRolesCore.js');
const { normalizePost, cleanClone } = require('./postValidate.js');
const { PER_POST_MAX_BYTES } = require('./importBounds.js');
const store = require('./submissionsStore.js');

const PAGE_DEFAULT = 50;
const PAGE_MAX = 200;
const SCAN_MAX = 2000;
const SCAN_MS = 10000;
const STATUSES = ['pending', 'approved', 'denied', 'reverted'];
const INSTRUCTIONS_MAX = 20000;
const REASON_MAX = 2000;

function cleanId(v, max = 300) {
	if (v === null || v === undefined) return '';
	const s = String(v).trim();
	if (!s || s.length > max) return '';
	if (/[/\\\0]/.test(s)) return '';
	return s;
}

function isAdminOf(identity, entry) {
	const userId = String((entry && entry.userId) || identity || '');
	const accountId = String((entry && (entry.accountId || entry.userId)) || identity || '');
	return userId === 'asdf' && accountId === 'asdf';
}

function pageParams($i) {
	let limit = parseInt(requestValue($i, 'limit'), 10);
	if (!Number.isFinite(limit) || limit <= 0) limit = PAGE_DEFAULT;
	limit = Math.min(limit, PAGE_MAX);
	let offset = 0;
	const cursor = String(requestValue($i, 'cursor') || '');
	if (cursor) {
		try {
			const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
			const o = Number(parsed && parsed.o);
			if (Number.isFinite(o) && o > 0) offset = Math.floor(o);
		} catch (_) { /* bad cursor: start over */ }
	}
	return { limit, offset };
}

function encodeCursor(offset) {
	return Buffer.from(JSON.stringify({ v: 1, o: offset }), 'utf8').toString('base64url');
}

/** Public projection of a submission record (post payload included for
 *  owner queue + submitter's own list; both are authorized readers). */
function recordView(rec) {
	if (!rec) return null;
	return {
		id: rec.id,
		targetHeichel: rec.targetHeichel,
		targetSeries: rec.targetSeries,
		status: rec.status,
		submitterIdentity: rec.submitterIdentity,
		submitterAliasId: rec.submitterAliasId,
		postId: rec.postId || null,
		resultPostId: rec.resultPostId || null,
		denyReason: rec.status === 'denied' ? (rec.denyReason || null) : null,
		createdAt: rec.createdAt,
		updatedAt: rec.updatedAt,
		history: Array.isArray(rec.history) ? rec.history : [],
		post: rec.post || null
	};
}

module.exports = {

	// -- authentication (ONE place; Worker I drop-in seam) -------------------
	async subsAuthenticate() {
		if (typeof this.authenticate === 'function') {
			try {
				const shared = await this.authenticate();
				if (shared && (shared.identity || shared.ok)) {
					return { identity: String(shared.identity || ''), isAdmin: !!shared.isAdmin, via: String(shared.via || 'shared') };
				}
				if (shared && shared.success === false) return { error: shared };
			} catch (_) { /* fall through to the local implementation */ }
		}
		if (typeof this.checkSignatureAuth === 'function') {
			const sigResult = this.checkSignatureAuth();
			if (sigResult === null) return { identity: 'import-signature', isAdmin: true, via: 'signature' };
			if (sigResult !== 'NO_ATTEMPT') return { error: sigResult };
		}
		try {
			const { readBearer } = require('../../../../oauth/core/tokenReader.js');
			const resolved = readBearer(this.$i);
			if (resolved && resolved.ok) {
				const entry = resolved.entry || {};
				const identity = String(entry.userId || entry.accountId || '');
				if (identity) return { identity, isAdmin: isAdminOf(identity, entry), via: 'oauth' };
			}
		} catch (_) { /* no bearer */ }
		const expected = process.env.AWTSMOOS_IMPORT_KEY;
		if (expected) {
			const given = requestValue(this.$i, 'operatorKey') || this.$i?.body?.operatorKey || '';
			if (given) {
				const a = Buffer.from(String(given));
				const b = Buffer.from(String(expected));
				if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
					return { identity: 'operator', isAdmin: true, via: 'operator-key' };
				}
				return { error: { success: false, error: 'FORBIDDEN', message: 'Invalid operatorKey.' } };
			}
		}
		return { error: { success: false, error: 'UNAUTHENTICATED', message: 'A valid Awtsmoos account bearer <redacted> is required.' } };
	},

	/** The caller's alias set: identity itself + its account aliases. */
	async subsAliases(authn) {
		const scope = new Set([authn.identity]);
		try {
			const list = await this.$i.db.get(`/users/${authn.identity}/aliases/`, myOpts(this.$i));
			if (Array.isArray(list)) for (const a of list) if (a) scope.add(String(a));
		} catch (_) { /* identity-only scope, fail closed */ }
		return scope;
	},

	async subsHeichelInfo(heichelId) {
		try {
			const info = await this.$i.db.get(`/social/heichelos/${heichelId}/info`);
			return (info && typeof info === 'object') ? info : null;
		} catch (_) { return null; }
	},

	/** Owner = admin, or caller alias set holds the author / an editor. */
	async subsIsOwner(authn, heichelId, info) {
		if (authn.isAdmin) return true;
		const aliases = await this.subsAliases(authn);
		const inf = info || await this.subsHeichelInfo(heichelId);
		if (inf && inf.author && aliases.has(String(inf.author))) return true;
		try {
			const editors = await this.$i.db.get(`/social/heichelos/${heichelId}/editors`);
			if (Array.isArray(editors)) {
				for (const e of editors) if (aliases.has(String(e))) return true;
			}
		} catch (_) { /* no editors list */ }
		return false;
	},

	/** Merged heichel submission settings (existing record + defaults). */
	async subsReadSettings(heichelId) {
		let saved = null;
		try { saved = await this.$i.db.get(settingsPath({ heichelId })); } catch (_) { /* defaults */ }
		return { ...SETTING_DEFAULTS, ...(saved && typeof saved === 'object' ? saved : {}) };
	},

	subsSubmissionsOpen(settings) {
		if (typeof settings.allowSubmissions === 'boolean') return settings.allowSubmissions;
		return settings.allowPostSubmissions !== false;
	},

	subsDefaultBasis(authn, settings) {
		if (settings && typeof settings.moderationInstructions === 'string' && settings.moderationInstructions.trim()) {
			return 'owner-instructions v' + (settings.instructionsVersion || 1);
		}
		return authn.isAdmin ? 'admin-review' : 'owner-review';
	},

	subsBody() {
		return Object.assign({}, this.$i?.$_POST || {}, this.$i?.body || {});
	},

	/** Load a page of records from an id list (newest first), applying a
	 *  status filter with a bounded scan. Returns {items, nextCursor}. */
	subsPage(idsDesc, offset, limit, statusWanted) {
		const started = Date.now();
		const items = [];
		let scanned = 0;
		let i = offset;
		for (; i < idsDesc.length; i++) {
			if (items.length >= limit) break;
			if (scanned >= SCAN_MAX || (Date.now() - started) > SCAN_MS) break;
			scanned++;
			const rec = store.readRecord(this.$i, idsDesc[i]);
			if (!rec) continue;
			if (statusWanted && rec.status !== statusWanted) continue;
			items.push(recordView(rec));
		}
		const hasMore = i < idsDesc.length && (items.length >= limit || scanned >= SCAN_MAX || (Date.now() - started) > SCAN_MS);
		return { items, nextCursor: hasMore ? encodeCursor(i) : null, scanned };
	},

	// -- settings -------------------------------------------------------------
	async getSubmissionSettings() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const authn = await this.subsAuthenticate();
		if (authn.error) return authn.error;
		const heichelId = cleanId(requestValue(this.$i, 'heichelId') || requestValue(this.$i, 'heichel'));
		if (!heichelId) return { success: false, error: 'BAD_ARGS', message: 'heichelId is required' };
		const info = await this.subsHeichelInfo(heichelId);
		if (!info) return { success: false, error: 'HEICHEL_NOT_FOUND', message: 'No heichel ' + heichelId };
		const settings = await this.subsReadSettings(heichelId);
		const owner = await this.subsIsOwner(authn, heichelId, info);
		const out = {
			heichelId,
			allowSubmissions: this.subsSubmissionsOpen(settings),
			allowPostSubmissions: settings.allowPostSubmissions !== false,
			requirePostApproval: settings.requirePostApproval !== false,
			isOwner: owner,
			isAdmin: !!authn.isAdmin,
			caller: authn.identity
		};
		if (owner) {
			out.moderationInstructions = typeof settings.moderationInstructions === 'string' ? settings.moderationInstructions : '';
			out.instructionsVersion = settings.instructionsVersion || 0;
			out.instructionsUpdatedAt = settings.instructionsUpdatedAt || null;
			out.instructionsUpdatedBy = settings.instructionsUpdatedBy || null;
		}
		return { success: out };
	},

	async setSubmissionSettings() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const authn = await this.subsAuthenticate();
		if (authn.error) return authn.error;
		const body = this.subsBody();
		const heichelId = cleanId(body.heichelId || requestValue(this.$i, 'heichelId'));
		if (!heichelId) return { success: false, error: 'BAD_ARGS', message: 'heichelId is required' };
		const info = await this.subsHeichelInfo(heichelId);
		if (!info) return { success: false, error: 'HEICHEL_NOT_FOUND', message: 'No heichel ' + heichelId };
		if (!await this.subsIsOwner(authn, heichelId, info)) {
			return { success: false, error: 'NOT_AUTHORIZED', message: 'Only the heichel owner (or admin) may change submission settings.' };
		}
		const current = await this.subsReadSettings(heichelId);
		const next = { ...current };
		if (body.allowSubmissions !== undefined || body.allowPostSubmissions !== undefined) {
			const v = boolFromPayload(body.allowSubmissions !== undefined ? body.allowSubmissions : body.allowPostSubmissions, this.subsSubmissionsOpen(current));
			next.allowSubmissions = v;
			next.allowPostSubmissions = v;
		}
		if (body.requirePostApproval !== undefined) {
			next.requirePostApproval = boolFromPayload(body.requirePostApproval, current.requirePostApproval !== false);
		}
		if (body.moderationInstructions !== undefined) {
			const text = body.moderationInstructions === null ? '' : String(body.moderationInstructions);
			if (text.length > INSTRUCTIONS_MAX) {
				return { success: false, error: 'INSTRUCTIONS_TOO_LONG', message: 'moderationInstructions exceeds ' + INSTRUCTIONS_MAX + ' chars' };
			}
			if (text !== (current.moderationInstructions || '')) {
				next.moderationInstructions = text;
				next.instructionsVersion = (current.instructionsVersion || 0) + 1;
				next.instructionsUpdatedAt = Date.now();
				next.instructionsUpdatedBy = authn.identity;
			}
		}
		await this.$i.db.write(settingsPath({ heichelId }), next);
		return {
			success: {
				heichelId,
				allowSubmissions: this.subsSubmissionsOpen(next),
				requirePostApproval: next.requirePostApproval !== false,
				moderationInstructions: next.moderationInstructions || '',
				instructionsVersion: next.instructionsVersion || 0,
				updatedBy: authn.identity
			}
		};
	},

	// -- submit -----------------------------------------------------------------
	async submitSubmission() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const authn = await this.subsAuthenticate();
		if (authn.error) return authn.error;
		const body = this.subsBody();
		const heichelId = cleanId(body.heichelId || body.targetHeichel);
		const seriesId = cleanId(body.seriesId || body.targetSeries);
		const post = (body.post && typeof body.post === 'object' && !Array.isArray(body.post)) ? body.post : null;
		if (!heichelId || !seriesId || !post) {
			return { success: false, error: 'BAD_ARGS', message: 'Provide {heichelId, seriesId, post:{...}}' };
		}
		const info = await this.subsHeichelInfo(heichelId);
		if (!info) return { success: false, error: 'HEICHEL_NOT_FOUND', message: 'No heichel ' + heichelId };
		const settings = await this.subsReadSettings(heichelId);
		if (!this.subsSubmissionsOpen(settings)) {
			return { success: false, error: 'SUBMISSIONS_CLOSED', message: 'This heichel does not accept submissions.' };
		}
		// Credit: the submitter's alias — an explicitly requested alias is
		// honored only when the caller actually owns it.
		const aliases = await this.subsAliases(authn);
		const requested = cleanId(body.aliasId || post.aliasId || '', 200);
		let submitterAliasId = authn.identity;
		if (requested && aliases.has(requested)) submitterAliasId = requested;
		else {
			for (const a of aliases) { if (a !== authn.identity) { submitterAliasId = a; break; } }
		}
		let cleanPost;
		try { cleanPost = cleanClone(post, 0); } catch (_) {
			return { success: false, error: 'BAD_POST', message: 'post payload is not JSON-clean' };
		}
		const now = Date.now();
		const postId = cleanId(cleanPost.postId || cleanPost.id || '', 300) || ('subpost_' + now.toString(36) + '_' + crypto.randomBytes(4).toString('hex'));
		cleanPost.postId = postId;
		cleanPost.id = cleanPost.id || postId;
		const size = Buffer.byteLength(JSON.stringify(cleanPost));
		if (size > PER_POST_MAX_BYTES) {
			return { success: false, error: 'POST_TOO_LARGE', message: 'post is ' + size + ' bytes (cap ' + PER_POST_MAX_BYTES + ')' };
		}
		const rec = {
			id: store.newSubmissionId(now),
			targetHeichel: heichelId,
			targetSeries: seriesId,
			postId,
			post: cleanPost,
			submitterIdentity: authn.identity,
			submitterAliasId,
			submitterVia: authn.via,
			status: 'pending',
			createdAt: now,
			updatedAt: now,
			resultPostId: null,
			denyReason: null,
			history: [{ action: 'submitted', by: authn.identity, via: authn.via, at: now }]
		};
		store.writeRecord(this.$i, rec);
		store.indexSubmission(this.$i, rec);
		return { success: { submission: recordView(rec) } };
	},

	// -- submitter's own list ---------------------------------------------------
	async listMySubmissions() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const authn = await this.subsAuthenticate();
		if (authn.error) return authn.error;
		const statusWanted = String(requestValue(this.$i, 'status') || '');
		if (statusWanted && !STATUSES.includes(statusWanted)) {
			return { success: false, error: 'BAD_STATUS', message: 'status must be one of ' + STATUSES.join(', ') };
		}
		const { limit, offset } = pageParams(this.$i);
		const ids = store.listSubmitterIdsDesc(this.$i, authn.identity);
		const page = this.subsPage(ids, offset, limit, statusWanted || null);
		return { success: { caller: authn.identity, count: page.items.length, submissions: page.items, nextCursor: page.nextCursor } };
	},

	// -- owner review queue -------------------------------------------------------
	async listSubmissionQueue() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const authn = await this.subsAuthenticate();
		if (authn.error) return authn.error;
		const heichelId = cleanId(requestValue(this.$i, 'heichelId') || requestValue(this.$i, 'heichel'));
		if (!heichelId) return { success: false, error: 'BAD_ARGS', message: 'heichelId is required' };
		const info = await this.subsHeichelInfo(heichelId);
		if (!info) return { success: false, error: 'HEICHEL_NOT_FOUND', message: 'No heichel ' + heichelId };
		if (!await this.subsIsOwner(authn, heichelId, info)) {
			return { success: false, error: 'NOT_AUTHORIZED', message: 'Only the heichel owner (or admin) may read the review queue.' };
		}
		const statusWanted = String(requestValue(this.$i, 'status') || 'pending');
		if (statusWanted !== 'all' && !STATUSES.includes(statusWanted)) {
			return { success: false, error: 'BAD_STATUS', message: 'status must be one of ' + STATUSES.join(', ') + ', all' };
		}
		const { limit, offset } = pageParams(this.$i);
		const ids = store.listHeichelIdsDesc(this.$i, heichelId);
		const page = this.subsPage(ids, offset, limit, statusWanted === 'all' ? null : statusWanted);
		return { success: { heichelId, status: statusWanted, count: page.items.length, submissions: page.items, nextCursor: page.nextCursor } };
	},

	// -- decisions ------------------------------------------------------------------
	/** Shared loader for decide/reverse: auth + record + owner gate. */
	async subsLoadForDecision(body) {
		const authn = await this.subsAuthenticate();
		if (authn.error) return { error: authn.error };
		const id = store.safeId(String(body.id || body.submissionId || ''));
		if (!id) return { error: { success: false, error: 'BAD_ARGS', message: 'id (a submission id) is required' } };
		const rec = store.readRecord(this.$i, id);
		if (!rec) return { error: { success: false, error: 'SUBMISSION_NOT_FOUND', message: 'No submission ' + id } };
		const info = await this.subsHeichelInfo(rec.targetHeichel);
		if (!await this.subsIsOwner(authn, rec.targetHeichel, info)) {
			return { error: { success: false, error: 'NOT_AUTHORIZED', message: 'Only the heichel owner (or admin) may decide submissions.' } };
		}
		return { authn, rec };
	},

	subsLogDecision(rec, decision, authn, extra) {
		const settingsEntry = {
			submissionId: rec.id,
			heichelId: rec.targetHeichel,
			seriesId: rec.targetSeries,
			postId: rec.resultPostId || rec.postId,
			decision,
			decidedBy: authn.identity,
			via: authn.via,
			basis: extra.basis,
			at: Date.now()
		};
		if (extra.reason) settingsEntry.reason = extra.reason;
		store.appendDecision(this.$i, settingsEntry);
		return settingsEntry;
	},

	async approveSubmission() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const body = this.subsBody();
		const loaded = await this.subsLoadForDecision(body);
		if (loaded.error) return loaded.error;
		const { authn, rec } = loaded;
		if (rec.status !== 'pending' && rec.status !== 'reverted') {
			return { success: false, error: 'ALREADY_DECIDED', message: 'Submission is ' + rec.status + '; reverse it before deciding again.' };
		}
		const settings = await this.subsReadSettings(rec.targetHeichel);
		const basis = String(body.basis || '').slice(0, 500) || this.subsDefaultBasis(authn, settings);
		const now = Date.now();
		let post;
		try {
			post = normalizePost(cleanClone(rec.post, 0), rec.targetHeichel, now);
		} catch (e) {
			return { success: false, error: 'BAD_POST', message: String((e && e.message) || e) };
		}
		post.heichelId = rec.targetHeichel;
		post.seriesId = rec.targetSeries;
		post.parentSeriesId = rec.targetSeries;
		post.aliasId = rec.submitterAliasId;
		if (!post.author) post.author = rec.submitterAliasId;
		post.submittedBy = rec.submitterIdentity;
		post.submitterAliasId = rec.submitterAliasId;
		post.submittedAt = rec.createdAt;
		post.submissionId = rec.id;
		post.approvedBy = authn.identity;
		post.approvedAt = now;
		try {
			await this.writeNativePostOnly(this.$i, post);
			await this.writeOnePostBulk(this.$i, post);
			await this.$i.db.write(
				`/social/aliases/${post.aliasId}/postsSubmitted/inHeichel/${rec.targetHeichel}/inSeries/${rec.targetSeries}/${post.postId}`,
				{ postId: post.postId, aliasId: post.aliasId, heichelId: rec.targetHeichel, seriesId: rec.targetSeries, linkedAt: now, by: 'submissions-api' });
		} catch (e) {
			return { success: false, error: 'PUBLISH_FAILED', message: String((e && e.message) || e) };
		}
		rec.status = 'approved';
		rec.resultPostId = post.postId;
		rec.denyReason = null;
		rec.updatedAt = now;
		rec.history.push({ action: 'approved', by: authn.identity, via: authn.via, at: now, basis, postId: post.postId });
		store.writeRecord(this.$i, rec);
		const logEntry = this.subsLogDecision(rec, 'approved', authn, { basis });
		return { success: { submission: recordView(rec), postId: post.postId, decision: logEntry } };
	},

	async denySubmission() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const body = this.subsBody();
		const loaded = await this.subsLoadForDecision(body);
		if (loaded.error) return loaded.error;
		const { authn, rec } = loaded;
		if (rec.status !== 'pending' && rec.status !== 'reverted') {
			return { success: false, error: 'ALREADY_DECIDED', message: 'Submission is ' + rec.status + '; reverse it before deciding again.' };
		}
		const settings = await this.subsReadSettings(rec.targetHeichel);
		const basis = String(body.basis || '').slice(0, 500) || this.subsDefaultBasis(authn, settings);
		const reason = body.reason === undefined || body.reason === null ? null : String(body.reason).slice(0, REASON_MAX);
		const now = Date.now();
		rec.status = 'denied';
		rec.denyReason = reason;
		rec.updatedAt = now;
		rec.history.push({ action: 'denied', by: authn.identity, via: authn.via, at: now, basis, reason });
		store.writeRecord(this.$i, rec);
		const logEntry = this.subsLogDecision(rec, 'denied', authn, { basis, reason });
		return { success: { submission: recordView(rec), decision: logEntry } };
	},

	/** Remove a published submission post end to end (mirrors removeMixin:
	 *  native records, alias backlink, packed tombstone). */
	async subsRemovePublished(rec) {
		const h = rec.targetHeichel, s = rec.targetSeries, pid = rec.resultPostId || rec.postId;
		const removed = [];
		try { await this.$i.db.delete(`/social/heichelos/${h}/series/${s}/posts/${pid}`); removed.push('native-series'); } catch (_) { /* may not exist */ }
		try { await this.$i.db.delete(`/social/heichelos/${h}/posts/${pid}`); removed.push('native'); } catch (_) { /* may not exist */ }
		if (rec.submitterAliasId) {
			try {
				await this.$i.db.delete(`/social/aliases/${rec.submitterAliasId}/postsSubmitted/inHeichel/${h}/inSeries/${s}/${pid}`);
				removed.push('backlink');
			} catch (_) { /* backlink may not exist */ }
		}
		try {
			const { writePacked } = require('../../packed/socialPacked.js');
			const { logicalKey } = require('../../packed/shardPaths.js');
			writePacked({ $i: this.$i, shard: 'core', key: logicalKey(['posts', h, pid]), value: null, op: 'del', meta: { kind: 'postTombstone' } });
			removed.push('packed-tombstone');
		} catch (_) { /* non-fatal, mirrors removeMixin */ }
		return removed;
	},

	async reverseSubmission() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const body = this.subsBody();
		const loaded = await this.subsLoadForDecision(body);
		if (loaded.error) return loaded.error;
		const { authn, rec } = loaded;
		if (rec.status !== 'approved' && rec.status !== 'denied') {
			return { success: false, error: 'NOT_DECIDED', message: 'Submission is ' + rec.status + '; only an approved or denied submission can be reversed.' };
		}
		const settings = await this.subsReadSettings(rec.targetHeichel);
		const basis = String(body.basis || '').slice(0, 500) || this.subsDefaultBasis(authn, settings);
		const reason = body.reason === undefined || body.reason === null ? null : String(body.reason).slice(0, REASON_MAX);
		const now = Date.now();
		const was = rec.status;
		let removed = [];
		if (was === 'approved') {
			removed = await this.subsRemovePublished(rec);
			rec.status = 'reverted';
			rec.revertedPostId = rec.resultPostId || rec.postId;
			rec.resultPostId = null;
		} else {
			rec.status = 'pending';
			rec.denyReason = null;
		}
		rec.updatedAt = now;
		rec.history.push({ action: 'reversed', from: was, by: authn.identity, via: authn.via, at: now, basis, reason, removed });
		store.writeRecord(this.$i, rec);
		const logEntry = this.subsLogDecision(rec, 'reversal-of-' + was, authn, { basis, reason });
		return { success: { submission: recordView(rec), reversedFrom: was, removed, decision: logEntry } };
	},

	async listSubmissionDecisions() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const authn = await this.subsAuthenticate();
		if (authn.error) return authn.error;
		const heichelId = cleanId(requestValue(this.$i, 'heichelId') || requestValue(this.$i, 'heichel'));
		if (!heichelId) return { success: false, error: 'BAD_ARGS', message: 'heichelId is required' };
		const info = await this.subsHeichelInfo(heichelId);
		if (!info) return { success: false, error: 'HEICHEL_NOT_FOUND', message: 'No heichel ' + heichelId };
		if (!await this.subsIsOwner(authn, heichelId, info)) {
			return { success: false, error: 'NOT_AUTHORIZED', message: 'Only the heichel owner (or admin) may read the decisions log.' };
		}
		const { limit, offset } = pageParams(this.$i);
		const all = store.listDecisionsDesc(this.$i, heichelId);
		const items = all.slice(offset, offset + limit);
		return {
			success: {
				heichelId, count: items.length, decisions: items,
				nextCursor: (offset + limit < all.length) ? encodeCursor(offset + limit) : null
			}
		};
	},

	/** Route dispatchers (one map entry per path; method split inside). */
	async submissionsRoot() {
		if (this.$i.request.method === 'POST') return this.submitSubmission();
		if (this.$i.request.method === 'GET') return this.listSubmissionQueue();
		return { success: false, error: 'BAD_METHOD', message: 'Use POST (submit) or GET (queue).' };
	},

	async submissionsSettingsRoute() {
		if (this.$i.request.method === 'POST') return this.setSubmissionSettings();
		if (this.$i.request.method === 'GET') return this.getSubmissionSettings();
		return { success: false, error: 'BAD_METHOD', message: 'Use GET (read) or POST (owner update).' };
	}
};
