// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedBulkImportRoutes
 * @description
 * PATH2 per-post bulk import for the Chassidus corpus (2026-10-05 fix).
 *
 * WHY THIS EXISTS: the per-comment write path (one inode per comment) is
 * PHYSICALLY NON-VIABLE at this scale — every flush() serializes the entire
 * inode manifest as one JSON string, and ~1.5M+ new inodes blows past V8's
 * ~512MB string limit mid-import, risking production DB corruption. The
 * 17.5 GB social.richComments.v1.fs.awtsdb on production is the residue of
 * exactly that failure (2026-09-29 v1 attempt).
 *
 * PATH2 writes ONE PACKED FILE PER POST:
 *   /ikar/social/chassidus_translations/<aliasId>/<postId>.json
 *   = {postId, seriesId, aliasId, heichelId, commentCount, comments[]}
 * 1,494 files + 1 ID index ≈ 1,510 new inodes ≈ 600 KB of manifest.
 * Trivially safe on any machine.
 *
 * Read side: additive fallback patches already deployed to
 * richCommentReader.js (indexedIds unions per-post IDs) and
 * richCommentAccess.js (getComment / getCommentByUnique fall back to
 * per-post files). Standard lookups run first; fallbacks trigger on miss.
 *
 * Routes (mounted under /api/social by the packed composer):
 *   POST /packed/import/bulk/start   — start a bulk import job
 *   GET  /packed/import/bulk/status  — ?job=<id> poll one job
 *   GET  /packed/import/bulk/jobs   — list recent jobs
 *   POST /packed/import/bulk/cancel — {job} request cancellation
 *
 * Job kinds:
 *   perPost    — write one post's comments as a single packed file.
 *                Body: {kind:'perPost', seriesId, postId, aliasId, heichelId?,
 *                       dryRun?, items?|payloadFile?, maxComments?, timeBudgetMs?}
 *   perPostIndex — (re)build /ikar/social/chassidus_translations/_index/
 *                commentIdToPost.json from all per-post files. Run once after
 *                all perPost jobs. Body: {kind:'perPostIndex', dryRun?}
 *   translation|summary|ocrFix — legacy per-comment kinds, RETIRED for the
 *                Chassidus corpus (kept for API compatibility; perPost is the
 *                only viable path at this scale).
 *
 * Safety: operator-key authorization (fail-closed), dry-run mode, bounded
 * batch size + per-job time budget (pause/resume), idempotent per-post file
 * union by comment ID, exactly one running job, strict payload validation.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const packed = require('../../comments/richDb/PackedStore.js');
const paths = require('../../comments/richCommentPaths.js');
const { noteImportedComments } = require('../../search/rag/pendingCommentVectors.js');
const { requireMethod, requestValue } = require('./requestValues.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

// ---------------------------------------------------------------------------
// Per-post packed layout
// ---------------------------------------------------------------------------
const CHASSIDUS_BASE = '/ikar/social/chassidus_translations';
const CHASSIDUS_INDEX = CHASSIDUS_BASE + '/_index/commentIdToPost.json';

function perPostPath(aliasId, postId) {
	return CHASSIDUS_BASE + '/' + aliasId + '/' + postId + '.json';
}

// ---------------------------------------------------------------------------
// Job registry (in-process; survives as long as the server process lives).
// ---------------------------------------------------------------------------
const jobs = new Map();
const MAX_JOBS = 50;

function newJobId() {
	return 'bulk_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex');
}

function setJob(job) {
	jobs.set(job.id, job);
	if (jobs.size > MAX_JOBS) jobs.delete([...jobs.keys()][0]);
}

function getJob(id) { return jobs.get(id) || null; }

function runningJob() {
	for (const j of jobs.values()) if (j.status === 'running') return j;
	return null;
}

function yieldTick() { return new Promise(resolve => setImmediate(resolve)); }

// ---------------------------------------------------------------------------
// OOM guards (2026-10-09 fix for the 2026-09-30 bulk-import quarantine).
//
// The 1.9 GB production Node server was OOM-killed by POSTs carrying large
// inline `items` arrays: the JSON body parses to 3-5x its wire size in JS
// objects, then gets copied into job.spec.items, comments[], merged[], and
// the serialized output — 4-5x memory amplification on top of the ~1 GB
// baseline. The publishAll path (chunked /stage upload + one-file-at-a-time
// streaming) is the blessed path for large imports and is NOT gated here.
// ---------------------------------------------------------------------------
const INLINE_ITEMS_MAX_COUNT = 2000;          // hard cap on inline items per perPost job
const INLINE_ITEMS_MAX_BYTES = 2 * 1024 * 1024; // 2 MB estimated wire size cap
const HEAP_GUARD_BYTES = 1200 * 1024 * 1024;    // refuse new jobs above 1.2 GB heap

function heapTooHigh() {
	try {
		const mu = process.memoryUsage();
		return mu.heapUsed > HEAP_GUARD_BYTES;
	} catch (_) {
		return false;
	}
}

function memoryGuardError() {
	return {
		success: false,
		error: 'SERVER_MEMORY_HIGH',
		message: 'Server heap is above the safe threshold for new import jobs. Retry shortly.',
	};
}

function jobLogPath($i) {
	const dir = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'bulk-import-jobs.log');
}

function appendJobLog($i, entry) {
	try {
		fs.appendFileSync(jobLogPath($i), JSON.stringify({ at: Date.now(), ...entry }) + '\n');
	} catch (_) { /* best effort */ }
}

// ---------------------------------------------------------------------------
// Comment IDs: the live convention is BH_<ts>_<hex>_commentBy_<aliasId>.
// Payloads that already carry an `id` keep it. Otherwise we derive a
// DETERMINISTIC id in the same shape from the item content, so retries and
// resume compute the identical id and the idempotent skip stays correct.
// ---------------------------------------------------------------------------
function deterministicCommentId(item, ctx) {
	const h = crypto.createHash('sha256');
	h.update(String(ctx.postId) + '\n');
	h.update(String(item.dayuh.verseSection) + '\n');
	h.update(String(item.dayuh.subsectionId) + '\n');
	h.update(String(item.content));
	const hex = h.digest('hex');
	// decimal-ish timestamp part derived from the hash (13 digits, like Date.now())
	const tsPart = String(BigInt('0x' + hex.slice(0, 12)) % 9000000000000n + 1000000000000n);
	return 'BH_' + tsPart + '_' + hex.slice(12, 28) + '_commentBy_' + ctx.aliasId;
}

function commentIdFor(item, ctx) {
	if (item.id && typeof item.id === 'string' && item.id.length > 0) return item.id;
	if (item.commentId && typeof item.commentId === 'string' && item.commentId.length > 0) return item.commentId;
	return deterministicCommentId(item, ctx);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function validateCommentItem(item, idx) {
	if (!item || typeof item !== 'object') return 'item ' + idx + ': not an object';
	if (typeof item.content !== 'string' || item.content.length === 0) return 'item ' + idx + ': empty content';
	const d = item.dayuh;
	if (!d || typeof d !== 'object') return 'item ' + idx + ': missing dayuh';
	if (d.verseSection === undefined || d.verseSection === null || d.verseSection === '') return 'item ' + idx + ': missing dayuh.verseSection';
	if (d.subsectionId === undefined || d.subsectionId === null || d.subsectionId === '') return 'item ' + idx + ': missing dayuh.subsectionId';
	return null;
}

/**
 * Flattens the accepted payload shapes into a plain item array:
 *   { commentArray: [...] }            — prepared local payloads
 *   { items: [...] }                   — inline jobs
 *   { "0": [...], "1": [...] }         — section-keyed staged payloads
 *   [...]                              — bare array
 */
function flattenPayload(parsed) {
	if (Array.isArray(parsed)) return parsed;
	if (!parsed || typeof parsed !== 'object') return null;
	if (Array.isArray(parsed.commentArray)) return parsed.commentArray;
	if (Array.isArray(parsed.items)) return parsed.items;
	const out = [];
	for (const k of Object.keys(parsed)) {
		const v = parsed[k];
		if (Array.isArray(v)) for (const item of v) out.push(item);
	}
	return out;
}

function buildComment(item, ctx, now) {
	const commentId = String(commentIdFor(item, ctx));
	const verseSection = String(item.dayuh.verseSection);
	const subsectionId = String(item.dayuh.subsectionId);
	return {
		id: commentId, heichelId: ctx.heichelId, postId: ctx.postId, entityId: ctx.postId,
		seriesId: ctx.seriesId,
		parentId: '', parentSectionId: '', parentType: 'entity',
		aliasId: ctx.aliasId, author: ctx.aliasId, content: item.content,
		verseSection, subsectionId,
		dayuh: { ...item.dayuh, kind: 'translation' },
		importedFrom: 'bulk-import-api-perpost', importedAt: now, createdAt: now, updatedAt: now, deleted: false,
	};
}

class PackedBulkImportRoutes {
	/** @param {Object} $i - Active Awtsmoos request interface. */
	constructor($i) {
		this.$i = $i;
	}

	// -- authorization -------------------------------------------------------
	// Fail-closed operator key: the request must carry operatorKey matching
	// process.env.AWTSMOOS_BULK_IMPORT_KEY. When the env var is unset, every
	// call is rejected — never an open import door.
	checkAuth() {
		const expected = process.env.AWTSMOOS_BULK_IMPORT_KEY;
		if (!expected) {
			return { success: false, error: 'IMPORT_NOT_CONFIGURED', message: 'Bulk import operator key is not configured on this server.' };
		}
		const given = requestValue(this.$i, 'operatorKey') || this.$i?.body?.operatorKey || '';
		if (!given) return { success: false, error: 'FORBIDDEN', message: 'operatorKey is required.' };
		const a = Buffer.from(String(given));
		const b = Buffer.from(String(expected));
		if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
			return { success: false, error: 'FORBIDDEN', message: 'Invalid operatorKey.' };
		}
		return null;
	}

	// -- payload loading ------------------------------------------------------
	loadItems(body) {
		let items = body.items;
		if (body.payloadFile) {
			const allowedRoots = [
				'social/heichelos/ikar/comments/atSeries',
				'social/heichelos/ikar/comments/atPayloads',
			];
			const dbRoot = this.$i?.db?.directory || this.$i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
			const p = path.resolve(dbRoot, String(body.payloadFile));
			const ok = allowedRoots.some(r => p.startsWith(path.resolve(dbRoot, r) + path.sep) || p === path.resolve(dbRoot, r));
			if (!ok) return { error: { success: false, error: 'PAYLOAD_PATH_REJECTED', message: 'payloadFile must live under the staged comments directory.' } };
			let parsed;
			try {
				parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
			} catch (e) {
				return { error: { success: false, error: 'PAYLOAD_UNREADABLE', message: e.message } };
			}
			items = flattenPayload(parsed);
		} else {
			items = flattenPayload(items);
		}
		if (!Array.isArray(items) || items.length === 0) {
			return { error: { success: false, error: 'NO_ITEMS', message: 'No importable items found.' } };
		}
		return { items };
	}

	// -- per-post import core (PATH2) ------------------------------------------
	readPerPostFile(db, aliasId, postId) {
		try {
			const target = perPostPath(aliasId, postId);
			const status = db.fs.stat(target);
			if (!status || !status.exists || status.type !== 'file') return null;
			return awts.deserializeBinary(db.fs.readRange(target, 0, status.size));
		} catch (_) { return null; }
	}

	async importPerPost($i, job, items, ctx) {
		const { heichelId, seriesId, postId, aliasId } = ctx;
		// The server already holds the exclusive lock; open() returns the cached
		// in-process handle — never a second writable store.
		const db = packed.open($i);
		const now = Date.now();
		const vectorRows = [];
		const flushVectorRows = () => {
			if (vectorRows.length === 0) return;
			const rows = vectorRows.splice(0, vectorRows.length);
			// Fire-and-forget: pending semantic vectors for newly imported
			// comments; idempotent by comment key, never blocks the import.
			noteImportedComments({ $i, rows, aliasId }).catch(() => {});
		};
		// Build the full comment list for this post (validates + derives IDs).
		const comments = [];
		for (let n = 0; n < items.length; n++) {
			if (job.cancelRequested) return 'cancelled';
			if (Date.now() - job.startedAt > job.timeBudgetMs) return 'paused-budget';
			const comment = buildComment(items[n], ctx, now);
			comments.push(comment);
			if (!job.dryRun) {
				vectorRows.push({
					commentId: comment.id, aliasId, seriesId, postId,
					verseSection: comment.verseSection, subsectionId: comment.subsectionId,
					content: comment.content,
				});
			}
			if (n % 200 === 199) { job.updatedAt = Date.now(); setJob(job); await yieldTick(); }
		}
		if (job.dryRun) {
			job.wrote = comments.length;
			flushVectorRows();
			return 'ok';
		}
		// Idempotent union: merge with any existing per-post file by comment ID.
		const existing = this.readPerPostFile(db, aliasId, postId);
		const seen = new Set();
		const merged = [];
		if (existing && Array.isArray(existing.comments)) {
			for (const c of existing.comments) {
				if (c && c.id && !seen.has(c.id)) { seen.add(c.id); merged.push(c); }
			}
		}
		let added = 0;
		for (const c of comments) {
			if (seen.has(c.id)) { job.skipped++; continue; }
			seen.add(c.id); merged.push(c); added++;
		}
		const postData = {
			postId, seriesId, aliasId, heichelId,
			commentCount: merged.length,
			comments: merged,
		};
		db.fs.write(perPostPath(aliasId, postId), awts.serializeJSON(postData));
		if (db.fs.flush) db.fs.flush();
		flushVectorRows();
		job.wrote = added;
		return 'ok';
	}

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

	async runJob($i, job) {
		const { kind, seriesId, postId, aliasId, heichelId, items } = job.spec;
		job.status = 'running';
		job.startedAt = Date.now();
		setJob(job);
		appendJobLog($i, { jobId: job.id, event: 'started', kind, seriesId, postId, aliasId, itemCount: items.length, dryRun: !!job.dryRun });
		try {
			const ctx = { heichelId, seriesId, postId, aliasId, kind };
			let outcome;
			if (kind === 'perPost') outcome = await this.importPerPost($i, job, items, ctx);
			else if (kind === 'perPostIndex') outcome = await this.buildPerPostIndex($i, job);
			else outcome = 'retired-kind';
			if (outcome === 'cancelled') job.status = 'cancelled';
			else if (outcome === 'paused-budget') job.status = 'paused';
			else if (outcome === 'failed') job.status = 'failed';
			else if (outcome === 'retired-kind') {
				job.status = 'failed';
				job.errors.push({ message: 'KIND_RETIRED: per-comment kinds (translation/summary/ocrFix) are retired for this corpus — use kind=perPost (PATH2). The per-comment write path is physically non-viable at this scale.' });
			} else job.status = 'done';
		} catch (e) {
			job.status = 'failed';
			job.errors.push({ message: e.message, stack: e.stack });
		}
		job.finishedAt = Date.now();
		job.durationMs = job.finishedAt - job.startedAt;
		setJob(job);
		appendJobLog($i, {
			jobId: job.id, event: job.status,
			wrote: job.wrote, skipped: job.skipped,
			errors: job.errors.length, durationMs: job.durationMs,
		});
	}

	// -- routes ----------------------------------------------------------------
	/**
	 * POST /packed/import/bulk/start
	 * Body: { operatorKey, kind, seriesId?, postId?, aliasId?, heichelId?, dryRun?, items?|payloadFile?, maxComments?, timeBudgetMs? }
	 *   kind=perPost      — seriesId, postId, aliasId required
	 *   kind=perPostIndex — no post params; rebuilds the commentId→postId index
	 */
	async start() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		// OOM guard: refuse new jobs when the heap is already hot.
		if (heapTooHigh()) return memoryGuardError();
		const body = this.$i?.body || {};
		for (const k of ['kind', 'seriesId', 'postId', 'aliasId']) {
			if (body[k] === undefined || body[k] === null || body[k] === '') {
				const v = requestValue(this.$i, k);
				if (v) body[k] = v;
			}
		}
		const kind = body.kind || 'perPost';
		const seriesId = body.seriesId;
		const postId = body.postId;
		const aliasId = body.aliasId;
		const heichelId = body.heichelId || requestValue(this.$i, 'heichelId') || 'ikar';
		const dryRun = !!(body.dryRun ?? (requestValue(this.$i, 'dryRun') === 'true' || requestValue(this.$i, 'dryRun') === true));
		if (!['perPost', 'perPostIndex', 'translation', 'summary', 'ocrFix'].includes(kind)) {
			return { success: false, error: 'BAD_KIND', message: 'kind must be perPost|perPostIndex' };
		}
		let items = [];
		if (kind === 'perPost') {
			if (!seriesId || !postId || !aliasId) {
				return { success: false, error: 'MISSING_PARAMS', message: 'seriesId, postId and aliasId are required for kind=perPost' };
			}
			// OOM gate: inline items are for SMALL payloads only. Large imports
			// must use the chunked /packed/import/bulk/stage upload + kind=publishAll,
			// which streams one payload file at a time with bounded memory.
			// (2026-09-30 quarantine: inline 98 MB payloads OOM-killed production.)
			const hasInlineItems = body.items !== undefined && body.items !== null && !body.payloadFile;
			if (hasInlineItems) {
				const inlineCount = Array.isArray(body.items) ? body.items.length : 0;
				if (inlineCount > INLINE_ITEMS_MAX_COUNT) {
					return {
						success: false, error: 'INLINE_TOO_LARGE',
						message: 'Inline items exceed ' + INLINE_ITEMS_MAX_COUNT + ' (' + inlineCount + ' given). Use POST /packed/import/bulk/stage (chunked upload) + kind=publishAll for large imports.',
					};
				}
			}
			const loaded = this.loadItems(body);
			if (loaded.error) return loaded.error;
			items = loaded.items;
			// Byte-size gate (catches deep/large individual items the count misses).
			if (hasInlineItems) {
				let approxBytes = 0;
				for (let n = 0; n < items.length; n++) {
					const c = items[n] && typeof items[n].content === 'string' ? items[n].content.length : 0;
					approxBytes += c;
					if (approxBytes > INLINE_ITEMS_MAX_BYTES) {
						return {
							success: false, error: 'INLINE_TOO_LARGE',
							message: 'Inline payload exceeds ~2 MB. Use POST /packed/import/bulk/stage (chunked upload) + kind=publishAll for large imports.',
						};
					}
				}
			}
			for (let n = 0; n < items.length; n++) {
				const err = validateCommentItem(items[n], n);
				if (err) return { success: false, error: 'ITEM_INVALID', message: err };
			}
		}
		const busy = runningJob();
		if (busy) return { success: false, error: 'JOB_ALREADY_RUNNING', jobId: busy.id };
		const job = {
			id: newJobId(), status: 'queued', dryRun,
			spec: { kind, heichelId, seriesId, postId, aliasId, items },
			maxComments: Math.min(Number(body.maxComments) > 0 ? Math.floor(Number(body.maxComments)) : 200000, 500000),
			timeBudgetMs: Math.min(Number(body.timeBudgetMs) > 0 ? Math.floor(Number(body.timeBudgetMs)) : 20 * 60 * 1000, 60 * 60 * 1000),
			totalItems: items.length, wrote: 0, skipped: 0, errors: [],
			cancelRequested: false, createdAt: Date.now(), updatedAt: Date.now(),
			startedAt: null, finishedAt: null, durationMs: null,
		};
		setJob(job);
		// Fire and forget — the job updates its own record; poll via status.
		this.runJob(this.$i, job).catch(() => {});
		return { success: { jobId: job.id, status: job.status, kind, dryRun, totalItems: items.length } };
	}

	/** GET /packed/import/bulk/status?job=<id> */
	async status() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const jobId = requestValue(this.$i, 'job');
		const job = getJob(jobId);
		if (!job) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		const { spec, ...rest } = job;
		return { success: { ...rest, kind: spec.kind, seriesId: spec.seriesId, postId: spec.postId, aliasId: spec.aliasId, totalItems: spec.totalItems } };
	}

	/** GET /packed/import/bulk/jobs */
	async list() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		return {
			success: [...jobs.values()]
				.sort((a, b) => b.createdAt - a.createdAt)
				.map(j => ({
					id: j.id, status: j.status, kind: j.spec.kind, dryRun: j.dryRun,
					seriesId: j.spec.seriesId, postId: j.spec.postId, aliasId: j.spec.aliasId,
					totalItems: j.totalItems, wrote: j.wrote, skipped: j.skipped,
					errors: j.errors.length, durationMs: j.durationMs,
				}))
		};
	}

	/** POST /packed/import/bulk/cancel {job} */
	async cancel() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const jobId = requestValue(this.$i, 'job') || this.$i?.body?.job;
		const job = getJob(jobId);
		if (!job) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		if (job.status !== 'running' && job.status !== 'queued') {
			return { success: false, error: 'JOB_NOT_RUNNING', status: job.status };
		}
		job.cancelRequested = true;
		job.updatedAt = Date.now();
		setJob(job);
		return { success: { jobId, cancelRequested: true } };
	}

	/** @returns {Object<string,Function>} Packed bulk-import route map. */
	routes() {
		return {
			'/packed/import/bulk/start': this.start.bind(this),
			'/packed/import/bulk/status': this.status.bind(this),
			'/packed/import/bulk/jobs': this.list.bind(this),
			'/packed/import/bulk/cancel': this.cancel.bind(this),
		};
	}
}

module.exports = { PackedBulkImportRoutes };

// ---------------------------------------------------------------------------
// Additive extension point for the one-call bulk publisher (Yaakov directive).
// Shares the job registry / auth plumbing with the BulkPublishAllRoutes
// subclass in ./bulkPublishAllRoutes.js (loaded below). No behavior change:
// existing kinds flow exactly as before when publishAll is not used.
// ---------------------------------------------------------------------------
const __bulkPlumbing = { newJobId, setJob, runningJob, appendJobLog, yieldTick, perPostPath };
module.exports = { PackedBulkImportRoutes, __bulkPlumbing };
try { require('./bulkPublishAllRoutes.js'); } catch (_) {}
