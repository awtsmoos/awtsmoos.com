// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedBulkImportRoutes
 * @description
 * The Awtsmoos gives the Chassidus import a proper API: bulk translation,
 * summary, and OCR-fix imports run IN-PROCESS through the server's already-held
 * exclusive packed-store lock, so there is no lock contention, no BUSY errors,
 * and no need to stop the server.
 *
 * This replaces the standalone import scripts, which cannot run while the
 * server holds the packed-store exclusive lock (AWTSMOOS_DB_LOCK_BUSY).
 *
 * Content kinds (one endpoint shape, `kind` field):
 *   translation — phrase translations under the per-corpus translation aliases
 *   summary     — post summaries under DEDICATED summary aliases (never mixed
 *                 into translation aliases)
 *   ocrFix      — Hebrew source-text repairs applied to post records
 *
 * Routes (mounted under /api/social by the packed composer):
 *   POST /packed/import/bulk/start   — start a bulk import job {kind, seriesId, postId, aliasId, items?|payloadFile?, dryRun?}
 *   GET  /packed/import/bulk/status  — ?job=<id> poll one job
 *   GET  /packed/import/bulk/jobs   — list recent jobs
 *   POST /packed/import/bulk/cancel — {job} request cancellation
 *
 * Safety: operator-key authorization (fail-closed), dry-run mode, bounded
 * batch size + per-job time budget (pause/resume), idempotent comment-ID skip,
 * exactly one running job, strict payload validation, alias-index updates so
 * every imported comment appears on its alias profile.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const packed = require('../../comments/richDb/PackedStore.js');
const paths = require('../../comments/richCommentPaths.js');
const { indexAliasComment } = require('../../comments/aliasCommentIndex.js');
const { noteImportedComments } = require('../../search/rag/pendingCommentVectors.js');
const { requireMethod, requestValue } = require('./requestValues.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

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

function validateOcrItem(item, idx) {
	if (!item || typeof item !== 'object') return 'ocr item ' + idx + ': not an object';
	for (const k of ['section', 'phrase', 'from', 'to']) {
		if (item[k] === undefined || item[k] === null || item[k] === '') return 'ocr item ' + idx + ': missing ' + k;
	}
	if (typeof item.from !== 'string' || typeof item.to !== 'string') return 'ocr item ' + idx + ': from/to must be strings';
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

	// -- import core ----------------------------------------------------------
	readExisting(db, target) {
		try {
			const status = db.fs.stat(target);
			if (!status || !status.exists || status.type !== 'file') return null;
			return awts.deserializeBinary(db.fs.readRange(target, 0, status.size));
		} catch (_) { return null; }
	}

	mergeIndex(db, target, idSet) {
		if (!idSet || idSet.size === 0) return 0;
		let arr;
		try {
			const status = db.fs.stat(target);
			if (status && status.exists && status.type === 'file') {
				const v = awts.deserializeBinary(db.fs.readRange(target, 0, status.size));
				arr = Array.isArray(v) ? v : [];
			} else arr = [];
		} catch (_) { arr = []; }
		const have = new Set(arr);
		let added = 0;
		for (const id of idSet) {
			if (!have.has(id)) { arr.push(id); have.add(id); added++; }
		}
		if (added > 0) db.fs.write(target, awts.serializeArray(arr));
		return added;
	}

	async importComments($i, job, items, ctx) {
		const { heichelId, seriesId, postId, aliasId, kind } = ctx;
		// The server already holds the exclusive lock; open() returns the cached
		// in-process handle — never a second writable store.
		const db = packed.open($i);
		const rootsAdd = new Set();
		const verseAdd = new Map();
		const subAdd = new Map();
		const vectorRows = [];
		const now = Date.now();
		let flushCounter = 0;
		const flushVectorRows = () => {
			if (vectorRows.length === 0) return;
			const rows = vectorRows.splice(0, vectorRows.length);
			// Fire-and-forget: pending semantic vectors for newly imported
			// comments; idempotent by comment key, never blocks the import.
			noteImportedComments({ $i, rows, aliasId }).catch(() => {});
		};
		for (let n = 0; n < items.length; n++) {
			if (job.cancelRequested) return 'cancelled';
			if (job.wrote + job.skipped >= job.maxComments) return 'paused-budget';
			if (Date.now() - job.startedAt > job.timeBudgetMs) return 'paused-budget';
			const item = items[n];
			const commentId = String(commentIdFor(item, ctx));
			const verseSection = String(item.dayuh.verseSection);
			const subsectionId = String(item.dayuh.subsectionId);
			const cPath = paths.commentPath({ heichelId, postId, verseSection, subsectionId, commentId });
			let existing = null;
			try { existing = this.readExisting(db, cPath); } catch (_) { existing = null; }
			if (existing && existing.id) { job.skipped++; continue; }
			if (job.dryRun) { job.wrote++; continue; }
			const comment = {
				id: commentId, heichelId, postId, entityId: postId, seriesId,
				parentId: '', parentSectionId: '', parentType: 'entity',
				aliasId, author: aliasId, content: item.content,
				verseSection, subsectionId,
				dayuh: { ...item.dayuh, kind: kind || item.dayuh.kind || 'translation' },
				importedFrom: 'bulk-import-api', importedAt: now, createdAt: now, updatedAt: now, deleted: false,
			};
			db.fs.write(cPath, awts.serializeJSON(comment));
			db.fs.write(paths.uniquePath({ commentId }), awts.serializeJSON({ heichelId, postId, seriesId }));
			rootsAdd.add(commentId);
			if (!verseAdd.has(verseSection)) verseAdd.set(verseSection, new Set());
			verseAdd.get(verseSection).add(commentId);
			if (!subAdd.has(subsectionId)) subAdd.set(subsectionId, new Set());
			subAdd.get(subsectionId).add(commentId);
			// Alias profile index: every imported comment must be discoverable
			// on its alias profile, organized by series → post.
			try { await indexAliasComment({ $i, comment }); } catch (e) {
				job.errors.push({ commentId, message: 'alias-index: ' + e.message });
			}
			// Pending semantic-search vectors (batched, fire-and-forget).
			vectorRows.push({
				commentId, aliasId, seriesId, postId,
				verseSection, subsectionId, content: item.content,
			});
			if (vectorRows.length >= 200) flushVectorRows();
			job.wrote++;
			if (++flushCounter % 50 === 0 && db.fs.flush) db.fs.flush();
			if (n % 200 === 199) { job.updatedAt = Date.now(); setJob(job); await yieldTick(); }
		}
		flushVectorRows();
		if (!job.dryRun) {
			const base = { heichelId, postId };
			this.mergeIndex(db, paths.rootChildrenPath(base), rootsAdd);
			for (const [v, s] of verseAdd) this.mergeIndex(db, paths.verseIndexPath({ ...base, verseSection: v }), s);
			for (const [s, set] of subAdd) this.mergeIndex(db, paths.subsectionIndexPath({ ...base, subsectionId: s }), set);
			if (db.fs.flush) db.fs.flush();
		}
		return 'ok';
	}

	async importOcrFixes($i, job, items, ctx) {
		// OCR fixes patch Hebrew source text inside post records through the
		// production post write path. Real (non-dry-run) execution requires the
		// post patcher; dry-run validates the payload shape and counts.
		for (let n = 0; n < items.length; n++) {
			if (job.cancelRequested) return 'cancelled';
			if (Date.now() - job.startedAt > job.timeBudgetMs) return 'paused-budget';
			if (job.dryRun) { job.wrote++; continue; }
			return 'ocr-patcher-missing';
		}
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
			const outcome = kind === 'ocrFix'
				? await this.importOcrFixes($i, job, items, ctx)
				: await this.importComments($i, job, items, ctx);
			if (outcome === 'cancelled') job.status = 'cancelled';
			else if (outcome === 'paused-budget') job.status = 'paused';
			else if (outcome === 'ocr-patcher-missing') {
				job.status = 'failed';
				job.errors.push({ message: 'OCR_PATCHER_MISSING: real ocrFix execution is not wired yet; dryRun only.' });
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
	 * Body: { operatorKey, kind, seriesId, postId, aliasId, heichelId?, dryRun?, items?|payloadFile?, maxComments?, timeBudgetMs? }
	 */
	async start() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const body = this.$i?.body || {};
		for (const k of ['kind', 'seriesId', 'postId', 'aliasId']) {
			if (body[k] === undefined || body[k] === null || body[k] === '') {
				const v = requestValue(this.$i, k);
				if (v) body[k] = v;
			}
		}
		const kind = body.kind || 'translation';
		const seriesId = body.seriesId;
		const postId = body.postId;
		const aliasId = body.aliasId;
		const heichelId = body.heichelId || requestValue(this.$i, 'heichelId') || 'ikar';
		const dryRun = !!(body.dryRun ?? (requestValue(this.$i, 'dryRun') === 'true' || requestValue(this.$i, 'dryRun') === true));
		if (!['translation', 'summary', 'ocrFix'].includes(kind)) {
			return { success: false, error: 'BAD_KIND', message: 'kind must be translation|summary|ocrFix' };
		}
		if (!seriesId || !postId || !aliasId) {
			return { success: false, error: 'MISSING_PARAMS', message: 'seriesId, postId and aliasId are required' };
		}
		// Never mix summaries into translation aliases (or vice versa).
		const aliasLower = String(aliasId).toLowerCase();
		if (kind === 'summary' && aliasLower.includes('translation')) {
			return { success: false, error: 'ALIAS_KIND_MISMATCH', message: 'summaries must use a dedicated summary alias, not a translation alias' };
		}
		if (kind === 'translation' && aliasLower.includes('summar')) {
			return { success: false, error: 'ALIAS_KIND_MISMATCH', message: 'translations must use a translation alias, not a summary alias' };
		}
		const loaded = this.loadItems(body);
		if (loaded.error) return loaded.error;
		const items = loaded.items;
		for (let n = 0; n < items.length; n++) {
			const err = kind === 'ocrFix' ? validateOcrItem(items[n], n) : validateCommentItem(items[n], n);
			if (err) return { success: false, error: 'ITEM_INVALID', message: err };
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
