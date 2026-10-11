// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedPostImportRoutes
 * @description
 * Post-document bulk import for the Awtsmoos.com corpus (Yaakov 2026-10-09:
 * "build the endpoints so the VM never needs the tunnel again").
 *
 * WHY THIS EXISTS: the existing packed bulk endpoint
 * (POST /packed/import/bulk/start) imports COMMENT records only — it cannot
 * create or update post documents at all. This route is the missing piece:
 * it takes full post documents (Hebrew phrases, English phrases, overviews,
 * summaries, metadata) and writes them as native AwtsmoosDB records.
 *
 * Write path: mirrorPost() from ../packed/socialPacked.js — the same hybrid
 * packed writer used by post migrations. In production (no $i.db.directory)
 * every record goes through the native AwtsmoosDB shard store (store.put);
 * nothing is stored as a JSON string or a gzip blob. The full post lands in
 * the `core` shard, a compact mirror in `allPosts`, plus manifest, search
 * indexes and an audit event — exactly what the readers expect.
 *
 * Routes (mounted under /api/social by the packed composer):
 *   POST /packed/import/posts/start   — start a post import job
 *   GET  /packed/import/posts/status  — ?job=<id> poll one job
 *   GET  /packed/import/posts/jobs    — list recent jobs
 *   POST /packed/import/posts/cancel  — {job} request cancellation
 *
 * Start body:
 *   { operatorKey, heichelId?, dryRun?,
 *     posts?: [...] }                  — inline, SMALL batches only
 *   { operatorKey, heichelId?, dryRun?, uploadId } — staged tarball
 *     (uploaded first via POST /packed/import/bulk/stage; tarball holds
 *      one post-document *.json per file + manifest.json listing
 *      {file, postId, heichelId?})
 *
 * Safety: operator-key authorization (fail-closed), dry-run mode, bounded
 * inline batch size, per-post size cap, per-job time budget (pause/resume),
 * idempotent by content hash (same post twice = skip), exactly one running
 * post-import job, strict post validation, detailed per-post logging.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const { requireMethod, requestValue } = require('./requestValues.js');
const { mirrorPost, readPacked } = require('../../packed/socialPacked.js');
const { logicalKey } = require('../../packed/shardPaths.js');
const importSign = require('./importSign.js');

// ---------------------------------------------------------------------------
// Job registry (in-process; survives as long as the server process lives).
// Separate from the comment-import registry: post writes and comment writes
// touch different shards, and each lane keeps its own "one running job"
// invariant so a stuck job in one lane cannot wedge the other.
// ---------------------------------------------------------------------------
const jobs = new Map();
const MAX_JOBS = 50;

function newJobId() {
	return 'postimport_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex');
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
// Bounds (mirrors the comment-import OOM guards: inline payloads are for
// SMALL batches only; large corpora must use the chunked /stage upload).
// ---------------------------------------------------------------------------
const INLINE_POSTS_MAX_COUNT = 100;
const INLINE_POSTS_MAX_BYTES = 2 * 1024 * 1024;   // ~2 MB wire estimate
const PER_POST_MAX_BYTES = 5 * 1024 * 1024;        // 5 MB per post document
const HEAP_GUARD_BYTES = 1200 * 1024 * 1024;       // refuse new jobs above 1.2 GB
const UPLOAD_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

function heapTooHigh() {
	try { return process.memoryUsage().heapUsed > HEAP_GUARD_BYTES; }
	catch (_) { return false; }
}

function postJobLogPath($i) {
	const dir = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'post-import-jobs.log');
}

function appendJobLog($i, entry) {
	try {
		fs.appendFileSync(postJobLogPath($i), JSON.stringify({ at: Date.now(), ...entry }) + '\n');
	} catch (_) { /* best effort */ }
}

function stageRoot($i) {
	const dbRoot = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dbRoot, 'socialPacked', 'bulk-stage');
}

// ---------------------------------------------------------------------------
// Post validation + normalization.
// A post document needs an identity (postId) and a home (heichelId).
// Everything else is carried through verbatim — the readers, not the
// importer, own the schema. We never invent content: missing optional
// fields stay missing; we only fill identity + bookkeeping timestamps.
// ---------------------------------------------------------------------------
function validatePost(raw, idx) {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
		return 'post ' + idx + ': not an object';
	}
	const postId = raw.postId || raw.id;
	if (!postId || typeof postId !== 'string' || !postId.trim()) {
		return 'post ' + idx + ': missing postId (or id)';
	}
	return null;
}

/** Prototype-pollution-safe deep clone for untrusted post documents. */
function cleanClone(value, depth) {
	if (depth > 32) throw new Error('POST_TOO_DEEP');
	if (value === null || typeof value !== 'object') return value;
	if (Array.isArray(value)) return value.map(v => cleanClone(v, depth + 1));
	const out = {};
	for (const k of Object.keys(value)) {
		if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
		out[k] = cleanClone(value[k], depth + 1);
	}
	return out;
}

function normalizePost(raw, heichelId, now) {
	const post = cleanClone(raw, 0);
	const postId = String(post.postId || post.id).trim();
	post.postId = postId;
	post.id = post.id || postId;
	post.heichelId = post.heichelId || heichelId;
	if (!post.heichelId || typeof post.heichelId !== 'string' || !post.heichelId.trim()) {
		throw new Error('POST_NO_HEICHEL: post ' + postId + ' carries no heichelId and the job set none');
	}
	post.seriesId = post.seriesId || post.parentSeriesId || 'root';
	post.parentSeriesId = post.parentSeriesId || post.seriesId;
	post.importedFrom = 'post-import-api';
	post.importedAt = now;
	post.updatedAt = post.updatedAt || now;
	return post;
}

/** Canonical bytes for the idempotency hash: stable key order, no whitespace. */
function canonicalBytes(post) {
	const seen = new Set();
	function sortKeys(v) {
		if (v === null || typeof v !== 'object') return v;
		if (seen.has(v)) return '[Circular]';
		seen.add(v);
		if (Array.isArray(v)) return v.map(sortKeys);
		const out = {};
		for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
		return out;
	}
	const { importedAt, updatedAt, ...rest } = post;
	return Buffer.from(JSON.stringify(sortKeys(rest)), 'utf8');
}

function contentHash(post) {
	return crypto.createHash('sha256').update(canonicalBytes(post)).digest('hex');
}

// ---------------------------------------------------------------------------
// Staged tarball reading (reuses the /packed/import/bulk/stage upload dir).
// Tarball layout: files/manifest.json + one post-document *.json per file.
// manifest.json: { files: [{ file, postId, heichelId? }], postCount? }
// ---------------------------------------------------------------------------
function extractTarball($i, uploadId) {
	const dir = path.join(stageRoot($i), uploadId);
	return new Promise((resolve, reject) => {
		const dest = path.join(dir, 'files');
		if (fs.existsSync(path.join(dest, 'manifest.json'))) return resolve(dest);
		fs.mkdirSync(dest, { recursive: true });
		execFile('tar', ['-xzf', path.join(dir, 'upload.tar.gz'), '-C', dest], (err, _stdout, stderr) => {
			if (err) return reject(new Error('TAR_EXTRACT_FAILED: ' + (stderr || err.message)));
			let names;
			try { names = fs.readdirSync(dest); }
			catch (e) { return reject(new Error('TAR_LIST_FAILED: ' + e.message)); }
			for (const n of names) {
				let st;
				try { st = fs.statSync(path.join(dest, n)); }
				catch (_) { return reject(new Error('TAR_UNSAFE_ENTRY: ' + n)); }
				if (!st.isFile() || n.includes('/') || n.includes('\\') || n.includes('..') || !n.endsWith('.json')) {
					return reject(new Error('TAR_UNSAFE_ENTRY: ' + n));
				}
			}
			if (!names.includes('manifest.json')) return reject(new Error('TAR_NO_MANIFEST'));
			resolve(dest);
		});
	});
}

class PackedPostImportRoutes {
	/** @param {Object} $i - Active Awtsmoos request interface. */
	constructor($i) {
		this.$i = $i;
	}

	// -- authorization -------------------------------------------------------
	// Signature-first, operator-key fallback. Ed25519 signature auth (see
	// importSign.js) survives production restarts; the operator-key env var
	// (AWTSMOOS_IMPORT_KEY) is transient and may be unset. Fail closed.
	checkAuth() {
		const sigResult = this.checkSignatureAuth();
		if (sigResult === null) return null; // valid signature
		if (sigResult !== 'NO_ATTEMPT') return sigResult; // bad signature: fail closed
		// No signature fields: try the operator key.
		const expected = process.env.AWTSMOOS_IMPORT_KEY;
		if (!expected) {
			return { success: false, error: 'IMPORT_NOT_CONFIGURED', message: 'Post import is not configured on this server (no operator key and no valid signature).' };
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

	// -- Ed25519 signature authorization --------------------------------------
	// Verifies the request signature per importSign.js. The signature covers
	// { v, ts, op, heichelId, payloadHash }; payloadHash binds the payload:
	//   posts/start (staged): sha256hex(uploadId)
	//   posts/start (inline): sha256hex(JSON.stringify(posts))
	//   posts/status|cancel:  sha256hex('job:' + job)
	//   posts/jobs:           sha256hex('jobs')
	// Returns null when the signature is valid, 'NO_ATTEMPT' when no
	// signature fields are present, or an error object on any failure.
	checkSignatureAuth() {
		const sig = requestValue(this.$i, 'sig');
		if (!sig) return 'NO_ATTEMPT';
		const ts = requestValue(this.$i, 'ts');
		const op = String(requestValue(this.$i, 'op') || '');
		const heichelId = String(requestValue(this.$i, 'heichelId') || '');
		const payloadHash = String(requestValue(this.$i, 'payloadHash') || '');
		const tsCheck = importSign.checkTimestamp(ts);
		if (!tsCheck.ok) return { success: false, error: 'SIG_' + tsCheck.error, message: 'Signature timestamp invalid or stale.' };
		const replayCheck = importSign.checkReplay(String(sig), ts);
		if (!replayCheck.ok) return { success: false, error: 'SIG_' + replayCheck.error, message: 'Signature replay detected.' };
		let expectedHash = '';
		if (op === 'posts/start') {
			const body = this.$i?.body || {};
			const uploadId = body.uploadId || requestValue(this.$i, 'uploadId');
			if (uploadId) {
				expectedHash = importSign.sha256hex(String(uploadId));
			} else {
				const postsVal = this.$i?.$_POST?.posts ?? body.posts;
				expectedHash = importSign.sha256hex(JSON.stringify(postsVal));
			}
		} else if (op === 'posts/status' || op === 'posts/cancel') {
			expectedHash = importSign.sha256hex('job:' + String(requestValue(this.$i, 'job') || ''));
		} else if (op === 'posts/jobs') {
			expectedHash = importSign.sha256hex('jobs');
		} else {
			return { success: false, error: 'SIG_BAD_OP', message: 'Unknown signed operation: ' + op };
		}
		if (payloadHash !== expectedHash) {
			return { success: false, error: 'SIG_PAYLOAD_MISMATCH', message: 'Signature payload hash does not match the request payload.' };
		}
		const sigCheck = importSign.verifySignature({ ts, op, heichelId, payloadHash }, String(sig));
		if (!sigCheck.ok) {
			return { success: false, error: 'SIG_' + sigCheck.error, message: 'Invalid import signature.' };
		}
		return null;
	}

	// -- idempotency ----------------------------------------------------------
	// A post is "already imported" when the live core record's content hash
	// matches the incoming document's hash. Same bytes in = skip, no write.
	// Different bytes = overwrite (counts as updated). Missing = write.
	postAlreadyLive($i, post, hash) {
		try {
			const key = logicalKey(['posts', post.heichelId, post.postId]);
			const record = readPacked({ $i, shard: 'core', key });
			const live = record && record.value ? record.value : null;
			if (!live) return false;
			return contentHash(live) === hash;
		} catch (_) {
			return false;
		}
	}

	// -- the per-post write ----------------------------------------------------
	// mirrorPost() is the established post-document writer: core shard gets
	// the full document, allPosts gets the compact mirror, plus manifest,
	// search indexes and an audit event — all through the native AwtsmoosDB
	// shard store in production. One post per call; the caller bounds the loop.
	writeOnePost($i, post) {
		return mirrorPost({ $i, post });
	}

	// Resolve one spec item to a raw post document. Inline items are already
	// parsed objects; staged items are { file, postId?, heichelId? } entries
	// parsed lazily here — exactly one file in memory at a time.
	readSpecPost(spec, item) {
		if (spec.source && spec.source.startsWith('upload:') && item && typeof item.file === 'string') {
			const full = path.join(spec.stagedDir, item.file);
			let parsed;
			try {
				parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
			} catch (e) {
				throw new Error('STAGED_FILE_UNPARSEABLE: ' + item.file + ': ' + e.message);
			}
			if (item.postId && !parsed.postId && !parsed.id) parsed.postId = item.postId;
			if (item.heichelId && !parsed.heichelId) parsed.heichelId = item.heichelId;
			return parsed;
		}
		return item;
	}

	// -- job runner ------------------------------------------------------------
	async runJob($i, job) {
		// Yield immediately so the HTTP response is sent before we do any
		// synchronous work (file reads, JSON.parse, disk writes). Without
		// this, the first posts block the event loop and the client sees
		// a 502/504.
		await yieldTick();
		const spec = job.spec;
		job.status = 'running';
		job.startedAt = Date.now();
		setJob(job);
		appendJobLog($i, {
			jobId: job.id, event: 'started',
			heichelId: spec.heichelId, totalPosts: spec.posts.length,
			dryRun: !!job.dryRun, source: spec.source,
		});
		const now = Date.now();
		try {
			for (let n = 0; n < spec.posts.length; n++) {
				if (job.cancelRequested) { job.status = 'cancelled'; break; }
				if (Date.now() - job.startedAt > job.timeBudgetMs) { job.status = 'paused'; break; }
				if (heapTooHigh()) {
					job.errors.push({ message: 'PAUSED_MEMORY: heap exceeded safe threshold; resume to continue.' });
					job.status = 'paused';
					break;
				}
				let raw;
				try {
					raw = this.readSpecPost(spec, spec.posts[n]);
				} catch (e) {
					job.failed++;
					job.errors.push({ postId: String((spec.posts[n] && spec.posts[n].postId) || ('#' + n)), message: e.message });
					continue;
				}
				let post;
				try {
					const verr = validatePost(raw, n);
					if (verr) throw new Error(verr);
					post = normalizePost(raw, spec.heichelId, now);
					const wireBytes = Buffer.byteLength(canonicalBytes(post));
					if (wireBytes > PER_POST_MAX_BYTES) {
						throw new Error('POST_TOO_LARGE: post ' + post.postId + ' is ' + wireBytes + ' bytes (cap ' + PER_POST_MAX_BYTES + ')');
					}
				} catch (e) {
					job.failed++;
					job.errors.push({ postId: String((raw && (raw.postId || raw.id)) || ('#' + n)), message: e.message });
					continue;
				}
				const hash = contentHash(post);
				if (job.doneHashes[post.postId] === hash || this.postAlreadyLive($i, post, hash)) {
					job.skipped++;
					job.doneHashes[post.postId] = hash;
					continue;
				}
				const existed = job.doneHashes[post.postId] !== undefined || this.postExists($i, post);
				if (!job.dryRun) {
					try {
						this.writeOnePost($i, post);
					} catch (e) {
						job.failed++;
						job.errors.push({ postId: post.postId, message: 'WRITE_FAILED: ' + (e.message || e) });
						continue;
					}
				}
				job.doneHashes[post.postId] = hash;
				job.postsDone++;
				if (existed) job.updated++;
				else job.wrote++;
				if (n % 10 === 9) {
					job.updatedAt = Date.now();
					setJob(job);
					await yieldTick();
				}
			}
			if (job.status === 'running') job.status = 'done';
		} catch (e) {
			job.status = 'failed';
			job.errors.push({ message: e.message, stack: e.stack });
		}
		job.finishedAt = Date.now();
		job.durationMs = job.finishedAt - job.startedAt;
		setJob(job);
		appendJobLog($i, {
			jobId: job.id, event: job.status,
			postsDone: job.postsDone, wrote: job.wrote, updated: job.updated,
			skipped: job.skipped, failed: job.failed,
			errors: job.errors.length, durationMs: job.durationMs,
		});
	}

	postExists($i, post) {
		try {
			const key = logicalKey(['posts', post.heichelId, post.postId]);
			const record = readPacked({ $i, shard: 'core', key });
			return !!(record && record.value);
		} catch (_) {
			return false;
		}
	}

	// -- staged upload reading --------------------------------------------------
	async loadStagedPosts($i, uploadId) {
		if (!UPLOAD_ID_RE.test(uploadId)) {
			return { error: { success: false, error: 'BAD_UPLOAD_ID', message: 'uploadId must match [A-Za-z0-9_-]{8,64}' } };
		}
		let dest;
		try {
			dest = await extractTarball($i, uploadId);
		} catch (e) {
			return { error: { success: false, error: 'STAGE_READ_FAILED', message: e.message } };
		}
		let manifest;
		try {
			manifest = JSON.parse(fs.readFileSync(path.join(dest, 'manifest.json'), 'utf8'));
		} catch (e) {
			return { error: { success: false, error: 'MANIFEST_UNREADABLE', message: e.message } };
		}
		const files = Array.isArray(manifest.files) ? manifest.files : [];
		if (!files.length) {
			return { error: { success: false, error: 'MANIFEST_EMPTY', message: 'No post files listed in manifest.json' } };
		}
		// STREAMING: never parse post files here. Return lightweight entries;
		// runJob reads + parses exactly one file at a time. Holding all parsed
		// posts would spike heap by ~3-5x the tarball size (OOM risk).
		const entries = [];
		for (const f of files) {
			const name = f && f.file;
			if (!name || typeof name !== 'string' || name.includes('/') || name.includes('\\') || name.includes('..') || !name.endsWith('.json')) {
				return { error: { success: false, error: 'MANIFEST_BAD_ENTRY', message: 'Unsafe file entry: ' + String(name) } };
			}
			const full = path.join(dest, name);
			let st;
			try { st = fs.statSync(full); }
			catch (_) { return { error: { success: false, error: 'STAGED_FILE_MISSING', message: name } }; }
			if (!st.isFile() || st.size > PER_POST_MAX_BYTES) {
				return { error: { success: false, error: 'STAGED_FILE_TOO_LARGE', message: name } };
			}
			entries.push({ file: name, postId: f.postId || null, heichelId: f.heichelId || null });
		}
		return { entries, dest, source: 'upload:' + uploadId };
	}

	// -- routes ------------------------------------------------------------------
	/**
	 * POST /packed/import/posts/start
	 * Body: { operatorKey, heichelId?, dryRun?, timeBudgetMs?,
	 *         posts?: [...] }  — inline, ≤100 posts and ~2 MB
	 *     or  { operatorKey, uploadId } — staged tarball via /packed/import/bulk/stage
	 */
	async start() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		if (heapTooHigh()) {
			return { success: false, error: 'SERVER_MEMORY_HIGH', message: 'Server heap is above the safe threshold for new import jobs. Retry shortly.' };
		}
		const body = this.$i?.body || {};
		const heichelId = body.heichelId || requestValue(this.$i, 'heichelId') || 'ikar';
		const dryRun = !!(body.dryRun ?? (requestValue(this.$i, 'dryRun') === 'true'));
		const timeBudgetMs = Math.min(
			Number(body.timeBudgetMs) > 0 ? Math.floor(Number(body.timeBudgetMs)) : 20 * 60 * 1000,
			60 * 60 * 1000
		);
		let posts;
		let source;
		let stagedDir = null;
		// NOTE: the framework populates $i.$_POST for JSON bodies, not $i.body.
		const uploadId = body.uploadId || requestValue(this.$i, 'uploadId');
		if (uploadId) {
			const loaded = await this.loadStagedPosts(this.$i, String(uploadId));
			if (loaded.error) return loaded.error;
			posts = loaded.entries;
			source = loaded.source;
			stagedDir = loaded.dest;
		} else {
			const inline = body.posts ?? requestValue(this.$i, 'posts');
			if (!Array.isArray(inline) || inline.length === 0) {
				return { success: false, error: 'NO_POSTS', message: 'Provide posts[] (inline) or uploadId (staged tarball).' };
			}
			if (inline.length > INLINE_POSTS_MAX_COUNT) {
				return {
					success: false, error: 'INLINE_TOO_LARGE',
					message: 'Inline posts exceed ' + INLINE_POSTS_MAX_COUNT + ' (' + inline.length + ' given). Use POST /packed/import/bulk/stage (chunked upload), then pass uploadId.',
				};
			}
			let approxBytes = 0;
			for (const p of inline) {
				try { approxBytes += Buffer.byteLength(JSON.stringify(p)); }
				catch (_) { approxBytes += 1024; }
				if (approxBytes > INLINE_POSTS_MAX_BYTES) {
					return {
						success: false, error: 'INLINE_TOO_LARGE',
						message: 'Inline payload exceeds ~2 MB. Use POST /packed/import/bulk/stage (chunked upload), then pass uploadId.',
					};
				}
			}
			posts = inline;
			source = 'inline';
		}
		// Pre-validate identity so a job never starts with zero importable posts.
		let identityOk = 0;
		for (let n = 0; n < posts.length; n++) {
			if (!validatePost(posts[n], n)) identityOk++;
		}
		if (!identityOk) {
			return { success: false, error: 'NO_VALID_POSTS', message: 'No post in the batch carries a postId.' };
		}
		const busy = runningJob();
		if (busy) return { success: false, error: 'JOB_ALREADY_RUNNING', jobId: busy.id };
		const job = {
			id: newJobId(), status: 'queued', dryRun,
			spec: { heichelId, posts, source, stagedDir },
			timeBudgetMs,
			totalPosts: posts.length,
			postsDone: 0, wrote: 0, updated: 0, skipped: 0, failed: 0,
			errors: [], doneHashes: {},
			cancelRequested: false,
			createdAt: Date.now(), updatedAt: Date.now(),
			startedAt: null, finishedAt: null, durationMs: null,
		};
		setJob(job);
		// Fire and forget — the job updates its own record; poll via status.
		// runJob yields to the event loop first (await yieldTick), so the
		// HTTP response is sent before any heavy synchronous work begins.
		this.runJob(this.$i, job).catch(() => {});
		return { success: { jobId: job.id, status: job.status, dryRun, totalPosts: posts.length, source } };
	}

	/** GET /packed/import/posts/status?job=<id> */
	async status() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const jobId = requestValue(this.$i, 'job');
		const job = getJob(jobId);
		if (!job) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		const { spec, doneHashes, ...rest } = job;
		return {
			success: {
				...rest,
				heichelId: spec.heichelId, source: spec.source, totalPosts: spec.totalPosts,
				donePostIds: Object.keys(doneHashes),
			}
		};
	}

	/** GET /packed/import/posts/jobs */
	async list() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		return {
			success: [...jobs.values()]
				.sort((a, b) => b.createdAt - a.createdAt)
				.map(j => ({
					id: j.id, status: j.status, dryRun: j.dryRun,
					heichelId: j.spec.heichelId, source: j.spec.source,
					totalPosts: j.totalPosts, postsDone: j.postsDone,
					wrote: j.wrote, updated: j.updated, skipped: j.skipped, failed: j.failed,
					errors: j.errors.length, durationMs: j.durationMs,
				}))
		};
	}

	/** POST /packed/import/posts/cancel {job} */
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

	/** @returns {Object<string,Function>} Packed post-import route map. */
	routes() {
		return {
			'/packed/import/posts/start': this.start.bind(this),
			'/packed/import/posts/status': this.status.bind(this),
			'/packed/import/posts/jobs': this.list.bind(this),
			'/packed/import/posts/cancel': this.cancel.bind(this),
		};
	}
}

module.exports = { PackedPostImportRoutes };
