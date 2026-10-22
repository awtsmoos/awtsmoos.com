//B"H
//Blessed is He
//Boruch Hashem

/** @module NotesMixin
 * Publish-notes routes for PackedPostImportRoutes (Worker H, 2026-10-21,
 * user orders ~19:51 + ~19:57 EDT): agents attach work-order notes to
 * posts so other agents can find and work them later. Notes are
 * agent-authored TASKS; they complement the census issue-flags (flags =
 * computed state, notes = authored work orders).
 *
 * MULTI-USER AUTH MODEL (user generalization 2026-10-21 ~19:57 — the API
 * is multi-user, not admin-only; agents act AS their authorizing user):
 *   - CREATE (single + bulk): ANY authenticated user. The author is
 *     derived from the AUTH identity — a client-supplied author field is
 *     never trusted. Notes may target ANY post: they are work orders and
 *     never modify content.
 *   - READ (per-target + feed): any authenticated user. The feed is a
 *     SHARED work queue — a non-admin's feed is NOT restricted to their
 *     own notes, so agents can pick up each other's lineup work.
 *   - RESOLVE / EDIT: only the note's AUTHOR, the target post's OWNER, or
 *     an ADMIN. Resolved notes stay readable forever (audit trail).
 *   - REBUILD-INDEX: admin only (maintenance).
 * Every route goes through notesAuthenticate() below, which returns
 * { identity, isAdmin, via }. DROP-IN SEAM for Worker I's shared helper:
 * if a mixin on this prototype provides authenticate() (returning the
 * same shape, or {ok, identity, isAdmin, via}) or authorizeWrite(
 * identity, post), those are used instead of the local fallbacks — no
 * asdf-only assumption is hardcoded outside isAdminOf().
 *
 * Routes:
 *   POST /packed/notes            add ONE note
 *   POST /packed/notes/bulk       add MANY notes (bounded, partial-failure
 *                                 tolerant, per-item results)
 *   GET  /packed/notes            notes for one target
 *                                 ?heichel=<id>[&series=<id>][&postId=<id>]
 *                                 [&status=open|done|all][&limit=][&cursor=]
 *   GET  /packed/notes/feed       global work feed, newest first
 *                                 [?tag=][&heichel=][&series=][&postId=]
 *                                 [&status=open (default)|done|all]
 *                                 [&limit=][&cursor=]
 *   POST /packed/notes/resolve    {id, resolution?} — mark done;
 *                                 also accepts {note?, tags?} edits and
 *                                 {reopen:true}, same permission rule
 *   POST /packed/notes/rebuild-index — admin; regenerate derived indexes
 *
 * Note shape:
 *   { id, target: { heichelId, seriesId|null, postId|null, unit? },
 *     author, agentIdentity?, createdAt, updatedAt, status: 'open'|'done',
 *     tags: [...], note,
 *     resolvedAt?, resolvedBy?, resolution? }
 *
 * Validation is shape-only: existence of the target post is NOT required,
 * because lineup notes legitimately target held / not-yet-live content.
 *
 * Tag vocabulary (seed; free-form tags allowed beyond it):
 *   needs-lineup, missing-english, defective, held, verify, publish-ready
 * Meiri anchoring (publish-sweep report 2026-10-21): the held-reason
 * vocabulary paraphrase / run-4 / run-5 / sequence-inconsistent travels in
 * the note TEXT (and may also be used as free-form tags); anchorStatus
 * unanchored-sequence is expressed with the needs-lineup tag.
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { INLINE_POSTS_MAX_COUNT, INLINE_POSTS_MAX_BYTES } = require('./importBounds.js');
const store = require('./notesStore.js');
const crypto = require('crypto');

const TAG_SEED = ['needs-lineup', 'missing-english', 'defective', 'held', 'verify', 'publish-ready'];
const BULK_MAX = INLINE_POSTS_MAX_COUNT; // 500, the importer's inline cap
const NOTE_TEXT_MAX = 20000;
const PAGE_DEFAULT = 50;
const PAGE_MAX = 200;
// Feed scan budget: a filtered feed page never scans unboundedly; on
// budget exhaustion it returns what it has plus a nextCursor.
const FEED_SCAN_MAX = 2000;
const FEED_SCAN_MS = 10000;

/** Admin test for an identity: the operator account. Kept in ONE place so
 *  Worker I's helper can own this definition when it lands. */
function isAdminOf(identity, entry) {
	const userId = String((entry && entry.userId) || identity || '');
	const accountId = String((entry && (entry.accountId || entry.userId)) || identity || '');
	return userId === 'asdf' && accountId === 'asdf';
}

function cleanId(v, max = 300) {
	if (v === null || v === undefined) return '';
	const s = String(v).trim();
	if (!s || s.length > max) return '';
	if (/[/\\\0]/.test(s)) return '';
	return s;
}

function cleanTags(raw) {
	if (raw === null || raw === undefined) return [];
	let arr = raw;
	if (typeof arr === 'string') { try { arr = JSON.parse(arr); } catch (_) { arr = arr.split(','); } }
	if (!Array.isArray(arr)) return null; // caller treats null as BAD_TAGS
	const out = [];
	for (const t of arr) {
		const s = String(t || '').trim().toLowerCase();
		if (!s || s.length > 64) continue;
		if (!out.includes(s)) out.push(s);
		if (out.length >= 20) break;
	}
	return out;
}

/** Validate + normalize one note payload. Returns fields or {error}. */
function validateNotePayload(raw) {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
		return { error: 'BAD_NOTE', message: 'note entry is not an object' };
	}
	// Target may be nested ({target:{...}}) or flat ({heichelId,...}).
	// NOTE: raw.author is deliberately never read (auth identity rules).
	const t = (raw.target && typeof raw.target === 'object') ? raw.target : raw;
	const heichelId = cleanId(t.heichelId ?? t.heichel);
	if (!heichelId) return { error: 'BAD_TARGET', message: 'target.heichelId is required (<=300 chars, no slashes)' };
	let seriesId = null, postId = null;
	if (t.seriesId !== undefined && t.seriesId !== null && String(t.seriesId) !== '') {
		seriesId = cleanId(t.seriesId);
		if (!seriesId) return { error: 'BAD_TARGET', message: 'target.seriesId is invalid' };
	}
	if (t.postId !== undefined && t.postId !== null && String(t.postId) !== '') {
		postId = cleanId(t.postId);
		if (!postId) return { error: 'BAD_TARGET', message: 'target.postId is invalid' };
	}
	const text = (raw.note === null || raw.note === undefined) ? '' : String(raw.note);
	if (!text.trim() || text.length > NOTE_TEXT_MAX) {
		return { error: 'BAD_NOTE', message: 'note text is required (1..' + NOTE_TEXT_MAX + ' chars)' };
	}
	const tags = cleanTags(raw.tags);
	if (tags === null) return { error: 'BAD_TAGS', message: 'tags must be an array of strings' };
	const target = { heichelId, seriesId, postId };
	if (t.unit !== undefined && t.unit !== null && String(t.unit) !== '') {
		const unit = String(t.unit);
		if (unit.length > 200 || /[/\\\0]/.test(unit)) return { error: 'BAD_TARGET', message: 'target.unit is invalid' };
		target.unit = unit;
	}
	return { target, note: text, tags };
}

function pageParams($i) {
	let limit = parseInt(requestValue($i, 'limit'), 10);
	if (!Number.isFinite(limit) || limit <= 0) limit = PAGE_DEFAULT;
	limit = Math.min(limit, PAGE_MAX);
	const cursor = String(requestValue($i, 'cursor') || '');
	return { limit, cursor };
}

function statusWanted($i, fallback) {
	const s = String(requestValue($i, 'status') || fallback || 'all').toLowerCase();
	return (s === 'open' || s === 'done' || s === 'all') ? s : null;
}

module.exports = {

	/** Authenticate the request for the notes routes.
	 *  Returns { identity, isAdmin, via } or { error: <response object> }.
	 *  DROP-IN: prefers Worker I's shared authenticate() when the composed
	 *  prototype provides one; the local fallback accepts, in order:
	 *  valid import signature (admin, via 'signature' — signature auth is
	 *  op-bound, so a bad/unknown-op attempt fails closed), any valid
	 *  OAuth bearer (via 'oauth'; admin iff the operator account), and the
	 *  operator key (admin, via 'operator-key'). */
	async notesAuthenticate() {
		if (typeof this.authenticate === 'function') {
			try {
				const shared = await this.authenticate();
				if (shared && (shared.identity || shared.ok)) {
					return { identity: String(shared.identity || ''), isAdmin: !!shared.isAdmin, via: String(shared.via || 'shared') };
				}
				if (shared && shared.success === false) return { error: shared };
			} catch (_) { /* fall through to the local implementation */ }
		}
		// Signature attempt? Fail closed on a bad one (mirrors checkAuth).
		if (typeof this.checkSignatureAuth === 'function') {
			const sigResult = this.checkSignatureAuth();
			if (sigResult === null) return { identity: 'import-signature', isAdmin: true, via: 'signature' };
			if (sigResult !== 'NO_ATTEMPT') return { error: sigResult };
		}
		// OAuth bearer: ANY valid account holder is authenticated.
		try {
			const { readBearer } = require('../../../../oauth/core/tokenReader.js');
			const resolved = readBearer(this.$i);
			if (resolved && resolved.ok) {
				const entry = resolved.entry || {};
				const identity = String(entry.userId || entry.accountId || '');
				if (identity) return { identity, isAdmin: isAdminOf(identity, entry), via: 'oauth' };
			}
		} catch (_) { /* no bearer */ }
		// Operator key (admin).
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
		return { error: { success: false, error: 'UNAUTHENTICATED', message: 'A valid Awtsmoos account bearer token is required.' } };
	},

	/** May authn resolve/edit this note? Author, target-post owner, admin.
	 *  DROP-IN: prefers Worker I's authorizeWrite(identity, post) for the
	 *  owner test when the prototype provides it. */
	async notesCanModify(authn, note) {
		if (!authn || !note) return false;
		if (authn.isAdmin) return true;
		if (note.author && note.author === authn.identity) return true;
		// Owner of the target post?
		const post = await this.notesLoadTargetPost(note.target);
		if (!post) return false; // held / not-yet-live target: author+admin only
		if (typeof this.authorizeWrite === 'function') {
			try { return !!(await this.authorizeWrite(authn.identity, post)); } catch (_) { return false; }
		}
		const owners = [post.aliasId, post.author, post.ownerId, post.userId, post.createdBy];
		return owners.some(o => o !== null && o !== undefined && String(o) === authn.identity);
	},

	/** Load the target post's native record (series path first, then
	 *  heichel-level), mirroring updateMixin.loadNativePost. */
	async notesLoadTargetPost(target) {
		if (!target || !target.postId || !this.$i?.db?.get) return null;
		const paths = [];
		if (target.seriesId) paths.push(`/social/heichelos/${target.heichelId}/series/${target.seriesId}/posts/${target.postId}`);
		paths.push(`/social/heichelos/${target.heichelId}/posts/${target.postId}`);
		for (const p of paths) {
			try {
				const doc = await this.$i.db.get(p);
				if (doc && typeof doc === 'object') return doc;
			} catch (_) { /* try next */ }
		}
		return null;
	},

	notesLog(op) {
		try {
			const _h = (this.$i && this.$i.headers) || {};
			console.log('[AGENT-OP] notes:' + op + ' id=' + (_h['x-agent-identity'] || 'UNIDENTIFIED') + ' kind=' + (_h['x-agent-kind'] || 'UNKNOWN'));
		} catch (_) {}
	},

	buildNote(fields, authn) {
		const now = Date.now();
		const note = {
			id: store.newNoteId(now),
			target: fields.target,
			author: authn.identity,
			createdAt: now,
			updatedAt: now,
			status: 'open',
			tags: fields.tags,
			note: fields.note,
		};
		const agent = String(((this.$i && this.$i.headers) || {})['x-agent-identity'] || '').trim();
		if (agent) note.agentIdentity = agent;
		return note;
	},

	/** /packed/notes — ONE path, two verbs: POST adds one note, GET reads
	 *  the notes for one target. Dispatches on the request method. */
	async notesRoute() {
		const m = this.$i?.request?.method;
		if (m === 'POST') return this.notesAdd();
		if (m === 'GET') return this.notesForTarget();
		return requireMethod(this.$i, 'GET'); // BAD_METHOD for anything else
	},

	/** POST /packed/notes — add ONE note. Any authenticated user. */
	async notesAdd() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const authn = await this.notesAuthenticate();
		if (authn.error) return authn.error;
		this.notesLog('add');
		const body = Object.assign({}, this.$i?.$_POST || {}, this.$i?.body || {});
		const v = validateNotePayload(body);
		if (v.error) return { success: false, error: v.error, message: v.message };
		try {
			const note = store.createNote(this.$i, this.buildNote(v, authn));
			return { success: { note } };
		} catch (e) {
			return { success: false, error: 'WRITE_FAILED', message: String((e && e.message) || e) };
		}
	},

	/** POST /packed/notes/bulk {notes:[...]} (a bare array body also works).
	 *  Bounded batch, partial-failure tolerant: per-item results, one bad
	 *  item never fails the batch. Built for the ~20k Meiri lineup tasks:
	 *  each item is one small atomic file write + one index append. */
	async notesBulk() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const authn = await this.notesAuthenticate();
		if (authn.error) return authn.error;
		this.notesLog('bulk');
		const body = Object.assign({}, this.$i?.$_POST || {}, this.$i?.body || {});
		let items = body.notes ?? requestValue(this.$i, 'notes');
		if (typeof items === 'string') { try { items = JSON.parse(items); } catch (_) { items = null; } }
		if (!Array.isArray(items) || items.length === 0) {
			return { success: false, error: 'NO_NOTES', message: 'Provide notes: [{target:{heichelId,seriesId?,postId?,unit?}, note, tags?}]' };
		}
		if (items.length > BULK_MAX) {
			return { success: false, error: 'INLINE_TOO_LARGE', message: 'Inline notes exceed ' + BULK_MAX + ' (' + items.length + ' given). Split the batch.' };
		}
		let approxBytes = 0;
		try { approxBytes = Buffer.byteLength(JSON.stringify(items)); } catch (_) { approxBytes = Infinity; }
		if (approxBytes > INLINE_POSTS_MAX_BYTES) {
			return { success: false, error: 'INLINE_TOO_LARGE', message: 'Inline payload exceeds ~20 MB.' };
		}
		const results = new Array(items.length);
		let ok = 0, failed = 0;
		for (let idx = 0; idx < items.length; idx++) {
			const v = validateNotePayload(items[idx]);
			if (v.error) { results[idx] = { index: idx, ok: false, error: v.error, message: v.message }; failed++; continue; }
			try {
				const note = store.createNote(this.$i, this.buildNote(v, authn));
				results[idx] = { index: idx, ok: true, id: note.id };
				ok++;
			} catch (e) {
				results[idx] = { index: idx, ok: false, error: 'WRITE_FAILED', message: String((e && e.message) || e) };
				failed++;
			}
			if (idx % 25 === 24) await new Promise(r => setImmediate(r)); // keep the loop breathing on a 2 GB box
		}
		return { success: { total: items.length, ok, failed, results } };
	},

	/** GET /packed/notes?heichel=&series=&postId= — notes for ONE target,
	 *  newest first, cursor-paginated (cursor = last note id returned).
	 *  Any authenticated user; the work queue is shared. */
	async notesForTarget() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const authn = await this.notesAuthenticate();
		if (authn.error) return authn.error;
		this.notesLog('target');
		const heichelId = cleanId(requestValue(this.$i, 'heichel') || requestValue(this.$i, 'heichelId'));
		if (!heichelId) return { success: false, error: 'BAD_ARGS', message: 'heichel (or heichelId) is required; use /packed/notes/feed for the global feed' };
		const seriesId = cleanId(requestValue(this.$i, 'series') || requestValue(this.$i, 'seriesId')) || null;
		const postId = cleanId(requestValue(this.$i, 'postId')) || null;
		const status = statusWanted(this.$i, 'all');
		if (!status) return { success: false, error: 'BAD_ARGS', message: 'status must be open, done or all' };
		const { limit, cursor } = pageParams(this.$i);
		const ids = store.listTargetIdsDesc(this.$i, { heichelId, seriesId, postId });
		let start = 0;
		if (cursor) { const at = ids.indexOf(cursor); start = at >= 0 ? at + 1 : 0; }
		const out = [];
		let lastSeen = null, i = start;
		for (; i < ids.length && out.length < limit; i++) {
			const note = store.readNoteFile(this.$i, ids[i]);
			if (!note) continue; // stale index line
			lastSeen = note.id;
			if (status !== 'all' && note.status !== status) continue;
			out.push(note);
		}
		const nextCursor = (i < ids.length && out.length) ? lastSeen : null;
		return { success: { target: { heichelId, seriesId, postId }, count: out.length, notes: out, nextCursor } };
	},

	/** GET /packed/notes/feed — the global work feed (shared queue).
	 *  Filters: tag, heichel, series, postId, status (default open).
	 *  Streamed scan over note ids newest-first, bounded budget + cursor. */
	async notesFeed() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const authn = await this.notesAuthenticate();
		if (authn.error) return authn.error;
		this.notesLog('feed');
		const status = statusWanted(this.$i, 'open');
		if (!status) return { success: false, error: 'BAD_ARGS', message: 'status must be open, done or all' };
		const tag = String(requestValue(this.$i, 'tag') || '').trim().toLowerCase();
		const heichel = cleanId(requestValue(this.$i, 'heichel') || requestValue(this.$i, 'heichelId'));
		const series = cleanId(requestValue(this.$i, 'series') || requestValue(this.$i, 'seriesId'));
		const postId = cleanId(requestValue(this.$i, 'postId'));
		const { limit, cursor } = pageParams(this.$i);
		const ids = store.listNoteIdsDesc(this.$i);
		let start = 0;
		if (cursor) { const at = ids.indexOf(cursor); start = at >= 0 ? at + 1 : 0; }
		const out = [];
		const startedAt = Date.now();
		let scanned = 0, lastSeen = null, i = start;
		for (; i < ids.length; i++) {
			if (out.length >= limit) break;
			if (scanned >= FEED_SCAN_MAX || Date.now() - startedAt > FEED_SCAN_MS) break;
			scanned++;
			const note = store.readNoteFile(this.$i, ids[i]);
			if (!note) continue;
			lastSeen = note.id;
			if (status !== 'all' && note.status !== status) continue;
			if (tag && !(Array.isArray(note.tags) && note.tags.includes(tag))) continue;
			if (heichel && note.target?.heichelId !== heichel) continue;
			if (series && note.target?.seriesId !== series) continue;
			if (postId && note.target?.postId !== postId) continue;
			out.push(note);
			if (out.length % 10 === 0) await new Promise(r => setImmediate(r));
		}
		const exhausted = i >= ids.length;
		const nextCursor = exhausted ? null : lastSeen;
		return { success: { count: out.length, scanned, notes: out, nextCursor, filters: { tag: tag || null, heichel: heichel || null, series: series || null, postId: postId || null, status } } };
	},

	/** POST /packed/notes/resolve {id, resolution?} — mark done. Also
	 *  accepts edits ({note?, tags?}) and {reopen:true} under the SAME
	 *  permission rule: author, target-post owner, or admin. The note
	 *  stays readable forever (audit trail); feeds default to open-only. */
	async notesResolve() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const authn = await this.notesAuthenticate();
		if (authn.error) return authn.error;
		this.notesLog('resolve');
		const body = Object.assign({}, this.$i?.$_POST || {}, this.$i?.body || {});
		const id = cleanId(body.id || requestValue(this.$i, 'id'), 120);
		if (!id || !/^note_[A-Za-z0-9_-]+$/.test(id)) {
			return { success: false, error: 'BAD_ARGS', message: 'id (a note id) is required' };
		}
		const note = store.readNoteFile(this.$i, id);
		if (!note) return { success: false, error: 'NOTE_NOT_FOUND', message: 'no note with id ' + id };
		if (!(await this.notesCanModify(authn, note))) {
			return { success: false, error: 'FORBIDDEN', message: 'Only the note author, the target post owner, or an admin may resolve or edit this note.' };
		}
		const reopen = body.reopen === true || body.reopen === 'true' || body.reopen === 1;
		let changed = false;
		if (body.note !== undefined && body.note !== null && String(body.note) !== note.note) {
			const text = String(body.note);
			if (!text.trim() || text.length > NOTE_TEXT_MAX) return { success: false, error: 'BAD_NOTE', message: 'note text must be 1..' + NOTE_TEXT_MAX + ' chars' };
			note.note = text; changed = true;
		}
		if (body.tags !== undefined) {
			const tags = cleanTags(body.tags);
			if (tags === null) return { success: false, error: 'BAD_TAGS', message: 'tags must be an array of strings' };
			note.tags = tags; changed = true;
		}
		if (reopen) {
			if (note.status !== 'open') {
				note.status = 'open';
				delete note.resolvedAt; delete note.resolvedBy; delete note.resolution;
				note.reopenedBy = authn.identity;
				changed = true;
			}
		} else if (note.status !== 'done') {
			const resolution = (body.resolution === null || body.resolution === undefined) ? '' : String(body.resolution);
			if (resolution.length > NOTE_TEXT_MAX) return { success: false, error: 'BAD_ARGS', message: 'resolution too long' };
			note.status = 'done';
			note.resolvedAt = Date.now();
			note.resolvedBy = authn.identity;
			if (resolution) note.resolution = resolution;
			changed = true;
		} else if (!changed) {
			return { success: { note, alreadyDone: true } };
		}
		note.updatedAt = Date.now();
		note.lastEditedBy = authn.identity;
		try {
			store.writeNoteFile(this.$i, note);
		} catch (e) {
			return { success: false, error: 'WRITE_FAILED', message: String((e && e.message) || e) };
		}
		return { success: { note } };
	},

	/** POST /packed/notes/rebuild-index — ADMIN ONLY. Regenerate the
	 *  derived per-target indexes from the note files (proof the index
	 *  is rebuildable from the records). */
	async notesRebuildIndex() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const authn = await this.notesAuthenticate();
		if (authn.error) return authn.error;
		if (!authn.isAdmin) return { success: false, error: 'FORBIDDEN', message: 'Index rebuild is admin-only.' };
		this.notesLog('rebuild-index');
		try {
			const r = store.rebuildIndexes(this.$i);
			return { success: { rebuilt: true, notes: r.notes, targets: r.targets, tagSeed: TAG_SEED } };
		} catch (e) {
			return { success: false, error: 'REBUILD_FAILED', message: String((e && e.message) || e) };
		}
	},
};
