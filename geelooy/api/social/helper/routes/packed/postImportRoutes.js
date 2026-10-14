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
 * Write path: mirrorPostBulk() from ../packed/socialPacked.js — core shard
 * gets the full document, allPosts gets the compact mirror, plus manifest
 * and search indexes — exactly what the readers expect. The per-post audit
 * event is skipped on the bulk path; the job log is the audit trail.
 *
 * Routes (mounted under /api/social by the packed composer):
 *   POST /packed/import/posts/start   — start a post import job
 *   GET  /packed/import/posts/status  — ?job=<id> poll one job
 *   GET  /packed/import/posts/jobs    — list recent jobs
 *   POST /packed/import/posts/cancel  — {job} request cancellation
 *   POST /packed/import/posts/ensure-backlinks — {uploadId} tarball backlink repair
 *   GET  /packed/import/posts/backlinks-status — ?backlinks=<id>
 *   POST /packed/import/posts/flush-backlinks — {job} replay persisted
 *     deferred-backlink queue (crash recovery; normal path needs no call)
 *
 * Speed (Yaakov 2026-10-14: "bulk import should be instant"):
 * - DEFERRED BACKLINKS: the hot loop writes ONLY the native post record;
 *   the alias backlink (secondary index) is queued in memory and flushed in
 *   ONE post-job background pass — parent-merged (one read-modify-write per
 *   alias/heichel/series, not one sync write per post). Halves sync writes.
 *   The pass runs after the job is terminal and the 6s watchdog is cleared.
 * - PRE-HASHED POSTS: the client may ship contentHash per post (tarball
 *   manifest entry or post field); the server trusts it and re-verifies a
 *   1% sample by recomputation, falling back to full computation on
 *   repeated mismatch. Removes canonical-stringify + sha256 from the loop.
 * - WORKERS: AWTSMOOS_IMPORT_WORKERS env (default 8, max 16).
 *
 * Start body:
 *   { operatorKey, heichelId?, dryRun?, timeBudgetMs?,
 *     posts?: [...] }                  — inline, SMALL batches only
 *   { operatorKey, heichelId?, dryRun?, uploadId, timeBudgetMs? } — staged tarball
 *     (uploaded first via POST /packed/import/bulk/stage; tarball holds
 *      one post-document *.json per file + manifest.json listing
 *      {file, postId, heichelId?})
 *
 * Reliability (Yaakov 2026-10-11: bulk importer is #1 — reusable forever):
 * - STREAMING: staged posts are parsed one file at a time; the job never
 *   holds all parsed posts in memory (OOM risk).
 * - LIVE HASH CACHE: the idempotency check used to read the entire core
 *   shard file per post (O(n^2) — 203MB re-read per post, ~25s/post,
 *   stalling the job). Now the core shard is scanned ONCE at job start
 *   into an in-memory {postId -> contentHash} map; every per-post check
 *   is a Map lookup.
 * - PERSISTENT JOB STATE: every job writes its progress to
 *   <dbRoot>/socialPacked/post-import-jobs/<jobId>.json at checkpoints
 *   and at terminal states. status/jobs read the disk fallback, so jobs
 *   survive production restarts; a job that was running when the server
 *   restarted is honestly reported as 'interrupted'.
 * - IDEMPOTENT RESUME: restarting with the same uploadId skips every
 *   already-imported post by content hash — safe to re-run any number
 *   of times, and the client auto-resumes paused/interrupted jobs.
 * - YIELDS: the job yields to the event loop after every post, so the
 *   server stays responsive during long imports (no more 502/504).
 *
 * Safety: signature-first authorization (fail-closed), dry-run mode,
 * bounded inline batch size, per-post size cap, per-job time budget
 * (pause/resume), idempotent by content hash (same post twice = skip),
 * exactly one running post-import job, strict post validation,
 * detailed per-post logging.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const { requireMethod, requestValue } = require('./requestValues.js');
const { mirrorPost, mirrorPostBulk, mirrorPostsBulk, readPacked, listPackedRecords, fileRoot, forEachLineFastAsync, fastKeyType } = require('../../packed/socialPacked.js');
const { logicalKey } = require('../../packed/shardPaths.js');
const importSign = require('./importSign.js');

// ---------------------------------------------------------------------------
// Job registry (in-process; survives as long as the server process lives).
// Separate from the comment-import registry: post writes and comment writes
// touch different shards, and each lane keeps its own "one running job"
// invariant so a stuck job in one lane cannot wedge the other.
// Persistent state (below) covers restarts: status/jobs fall back to disk.
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

// B"H 2026-10-13 (import-speed): count running jobs per heichel for the
// 4-concurrent limit. Returns the array of running jobs (for JOB_ALREADY_RUNNING
// diagnostics) — empty array means none running.
function runningJobsForHeichel(heichelId) {
	const out = [];
	for (const j of jobs.values()) {
		if (j.status !== 'running' && j.status !== 'queued') continue;
		if (!heichelId || j.spec.heichelId === heichelId) out.push(j);
	}
	return out;
}

function yieldTick() { return new Promise(resolve => setImmediate(resolve)); }

// ---------------------------------------------------------------------------
// Import lock — REMOVED (Yaakov 2026-10-13, absolute law: import jobs must
// NEVER block anything else, ever). Deploys touch the repo tree, imports
// touch the DB dir — disjoint. Restart safety comes from idempotent writes
// + persistent job state + client resume, not from a global lock.
// (The old import-in-progress.lock file is left unread; any stale lock
//  from before this change is simply ignored.)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Persistent job state — <dbRoot>/socialPacked/post-import-jobs/<jobId>.json
// Written at checkpoints and terminal states; read by status/jobs when the
// in-memory registry has no record (e.g. after a production restart).
// ---------------------------------------------------------------------------
function jobStateDir($i) {
	const dir = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'post-import-jobs');
}

function jobStateShape(job) {
	// B"H 2026-10-13: packedBatch excluded — it's up to 100 full post objects
	// queued for the batched packed-mirror flush; persisting it would bloat
	// the state file and it's purely in-memory work-queue state. A restart
	// loses the queued batch, but the posts' native writes are already done
	// and idempotent, so resume re-queues them via the doneHashes check.
	const { spec, doneHashes, aliasCache, seriesAdds, packedBatch, backlinkQueue, ...rest } = job || {};
	// B"H 2026-10-11: spec may be absent on in-memory verify jobs (the disk
	// copy gets spec via saveJobState's spread). Never throw here — a shape
	// helper throwing turns every status poll into a 500 ROUTE_ERROR.
	// B"H 2026-10-14 (import-speed): backlinkQueue serialized (not the Map)
	// for crash recovery — replay via POST /packed/import/posts/flush-backlinks.
	return {
		...rest,
		heichelId: spec?.heichelId || job?.heichelId,
		source: spec?.source,
		donePostIds: Object.keys(doneHashes || {}),
		backlinkQueue: backlinkQueue && backlinkQueue.size ? [...backlinkQueue.values()] : undefined,
	};
}

function saveJobState($i, job) {
	try {
		const dir = jobStateDir($i);
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, job.id + '.json'), JSON.stringify(jobStateShape(job)));
		// Prune state files older than 7 days (best effort).
		const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
		for (const f of fs.readdirSync(dir)) {
			if (!f.endsWith('.json')) continue;
			try {
				const st = fs.statSync(path.join(dir, f));
				if (st.mtimeMs < cutoff) fs.unlinkSync(path.join(dir, f));
			} catch (_) { /* ignore */ }
		}
	} catch (_) { /* best effort */ }
}

function loadJobState($i, id) {
	try {
		const raw = JSON.parse(fs.readFileSync(path.join(jobStateDir($i), id + '.json'), 'utf8'));
		// A job that was mid-flight when the server restarted can never
		// complete: report it honestly so the client resumes with a new job.
		if (raw.status === 'running' || raw.status === 'queued') raw.status = 'interrupted';
		return raw;
	} catch (_) { return null; }
}

function listJobStates($i) {
	const out = [];
	try {
		const dir = jobStateDir($i);
		if (!fs.existsSync(dir)) return out;
		for (const f of fs.readdirSync(dir)) {
			if (!f.endsWith('.json')) continue;
			try {
				const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
				if (raw.status === 'running' || raw.status === 'queued') raw.status = 'interrupted';
				out.push(raw);
			} catch (_) { /* ignore */ }
		}
	} catch (_) { /* ignore */ }
	return out;
}

/** Unified job view: in-memory first, persistent disk state as fallback. */
function getJobView($i, id) {
	const mem = getJob(id);
	if (mem) return { view: jobStateShape(mem), live: true, job: mem };
	const disk = loadJobState($i, id);
	if (disk) return { view: disk, live: false, job: null };
	return null;
}

// ---------------------------------------------------------------------------
// Bounds (mirrors the comment-import OOM guards: inline payloads are for
// SMALL batches only; large corpora must use the chunked /stage upload).
// B"H 2026-10-13 (import-speed): raised for fast imports — 20MB inline cap,
// 500 posts max. The 6-second job watchdog still bounds actual work; the
// importer sizes batches to complete within it.
// ---------------------------------------------------------------------------
const INLINE_POSTS_MAX_COUNT = 500;
const INLINE_POSTS_MAX_BYTES = 20 * 1024 * 1024;  // ~20 MB wire estimate
const PER_POST_MAX_BYTES = 5 * 1024 * 1024;        // 5 MB per post document
const HEAP_GUARD_BYTES = 1200 * 1024 * 1024;       // refuse new jobs above 1.2 GB
const UPLOAD_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

// B"H 2026-10-13 (import-speed): max concurrent import jobs per heichel.
// Was 1 (JOB_ALREADY_RUNNING); now 4. Different heichels were already
// concurrent. Series-index flushes are mutex-guarded per series key.
const MAX_CONCURRENT_PER_HEICHEL = 4;

// B"H 2026-10-13 (import-speed): per-series mutex for concurrent jobs.
// Multiple jobs importing to the same heichel flush their series indexes
// independently; without a mutex, interleaved read-modify-write loses updates.
const seriesLocks = new Map();

async function acquireSeriesLock(key) {
	while (seriesLocks.has(key)) {
		try { await seriesLocks.get(key); } catch (_) { /* ignore */ }
	}
	let release;
	const p = new Promise(resolve => { release = resolve; });
	seriesLocks.set(key, p);
	return () => {
		if (seriesLocks.get(key) === p) seriesLocks.delete(key);
		try { release(); } catch (_) { /* ignore */ }
	};
}

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
	// B"H 2026-10-14 (import-speed): contentHash excluded — the pre-hashed
	// posts protocol lets the client ship its computed hash inside the post
	// document; it must not perturb the hash itself.
	const { importedAt, updatedAt, contentHash: _preHash, ...rest } = post;
	return Buffer.from(JSON.stringify(sortKeys(rest)), 'utf8');
}

function contentHash(post) {
	return crypto.createHash('sha256').update(canonicalBytes(post)).digest('hex');
}

/**
 * Validate a client-supplied pre-computed content hash. Returns the
 * normalized lowercase hex string, or null when absent/malformed (in which
 * case the server computes the hash itself — fail safe).
 */
function validPreHash(obj) {
	const h = obj && obj.contentHash;
	return (typeof h === 'string' && /^[0-9a-f]{64}$/i.test(h)) ? h.toLowerCase() : null;
}

/**
 * Derive the aliasId for a post: one alias per commentator
 * (<heichelId>-<slug>), falling back to the job-level alias when the post
 * carries no commentator. Exported so the VM client computes identical
 * expectations during verification.
 */
function deriveAliasId(commentator, heichelId, fallbackAliasId) {
	if (commentator && typeof commentator === 'string' && commentator.trim()) {
		const slug = commentator.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		if (slug) return heichelId + '-' + slug;
	}
	return fallbackAliasId;
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
	//   posts/verify:         sha256hex('verify:' + uploadId)
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
		} else if (op === 'posts/verify') {
			const body = this.$i?.body || {};
			const uploadId = body.uploadId || requestValue(this.$i, 'uploadId');
			expectedHash = importSign.sha256hex('verify:' + String(uploadId || ''));
		} else if (op === 'posts/verify-status') {
			expectedHash = importSign.sha256hex('verify-status:' + String(requestValue(this.$i, 'verify') || ''));
		} else if (op === 'posts/ensure-backlinks') {
			const blBody = this.$i?.body || {};
			const blUploadId = blBody.uploadId || requestValue(this.$i, 'uploadId');
			expectedHash = importSign.sha256hex('backlinks:' + String(blUploadId || ''));
		} else if (op === 'posts/backlinks-status') {
			expectedHash = importSign.sha256hex('backlinks-status:' + String(requestValue(this.$i, 'backlinks') || ''));
		} else if (op === 'posts/flush-backlinks') {
			const fbBody = this.$i?.body || {};
			const fbJob = fbBody.job || requestValue(this.$i, 'job');
			expectedHash = importSign.sha256hex('flush-backlinks:' + String(fbJob || ''));
		} else if (op === 'posts/remove') {
			const rmBody = this.$i?.body || {};
			const rmH = rmBody.heichelId || requestValue(this.$i, 'heichelId');
			const rmP = rmBody.postId || requestValue(this.$i, 'postId');
			expectedHash = importSign.sha256hex('remove:' + String(rmH || '') + ':' + String(rmP || ''));
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
	//
	// The live hashes are loaded ONCE per job (buildLiveHashCache) instead
	// of readPacked-per-post: on production the core shard is a multi-GB
	// JSONL file and re-reading it per post made the import O(n^2)
	// (~25s/post, stalling after ~60 posts).
	buildLiveHashCache($i, heichelId) {
		const cache = new Map();
		const prefix = '/posts/' + heichelId + '/';
		let records;
		try {
			records = listPackedRecords({ $i, shard: 'core' });
		} catch (_) {
			return cache;
		}
		for (const rec of records) {
			const key = rec && rec.key;
			if (typeof key !== 'string' || !key.startsWith(prefix)) continue;
			const postId = key.slice(prefix.length);
			try {
				cache.set(postId, contentHash(rec.value));
			} catch (_) { /* skip unhashable records */ }
		}
		return cache;
	}

	// B"H 2026-10-11: async variant — streams the core shard with
	// event-loop yields and parses ONLY lines whose key matches this
	// heichel's prefix. The old sync full-parse blocked the loop for ~45s
	// on the 3.9 GB production shard (and readFileSync crashed >2 GiB).
	async buildLiveHashCacheAsync($i, heichelId) {
		const cache = new Map();
		const prefix = '/posts/' + heichelId + '/';
		const root = fileRoot($i);
		if (!root) return this.buildLiveHashCache($i, heichelId);
		await forEachLineFastAsync(root, 'core', (head, getFull) => {
			const fast = fastKeyType(head);
			if (fast && typeof fast.key === 'string' && !fast.key.startsWith(prefix)) return;
			let rec;
			try { rec = JSON.parse(getFull()); } catch (_) { return; }
			const key = rec && rec.key;
			if (typeof key !== 'string' || !key.startsWith(prefix)) return;
			const postId = key.slice(prefix.length);
			if (rec.op === 'del') { cache.delete(postId); return; }
			const post = rec.value;
			if (!post) return;
			try { cache.set(post.postId || postId, contentHash(post)); } catch (_) { /* skip */ }
		});
		return cache;
	}

	// Legacy single-post check (kept for compatibility; the job loop uses
	// the bulk cache above).
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

	postExists($i, post) {
		try {
			const key = logicalKey(['posts', post.heichelId, post.postId]);
			const record = readPacked({ $i, shard: 'core', key });
			return !!(record && record.value);
		} catch (_) {
			return false;
		}
	}

	// -- alias model + native AwtsmoosDB writes ---------------------------------
	// Yaakov 2026-10-11 (binding): every imported post lands as a FIRST-CLASS
	// native AwtsmoosDB record (via $i.db, the same interface the content
	// routes use), applied to an alias — one alias per commentator, created
	// when missing, carrying full name + aliasId:
	//   /social/aliases/<aliasId>/info    — {aliasId, name, kind, createdAt, createdBy}
	//   /social/aliases/<aliasId>/profile — {aliasId, name, bio}
	// The alias -> org(heichel) relationship (the org profile-like page):
	//   /social/aliases/<aliasId>/heichelosContributedTo/<heichelId> = true
	// The first-class native post record:
	//   /social/heichelos/<heichelId>/posts/<postId> = post
	// The post -> alias link:
	//   /social/aliases/<aliasId>/postsSubmitted/inHeichel/<h>/inSeries/<s>/<postId> = true
	// The native series index (object keyed by postId, per series.js):
	//   /social/heichelos/<heichelId>/series/<seriesId>/posts = { <postId>: {author, postId, title} }
	// The packed JSONL mirror (core/allPosts/meta/search) is still written —
	// it is what the readers serve — but the native records are the system
	// of record for alias/org queries.
	postAliasId(post, heichelId, fallbackAliasId) {
		return deriveAliasId(post && post.commentator, heichelId, fallbackAliasId);
	}

	async ensureAlias($i, aliasCache, aliasId, name, heichelId) {
		if (aliasCache.has(aliasId)) return;
		aliasCache.add(aliasId);
		const infoPath = `/social/aliases/${aliasId}/info`;
		let existing = null;
		try { existing = await $i.db.get(infoPath); } catch (_) { /* ignore */ }
		if (!existing) {
			const now = Date.now();
			await $i.db.write(infoPath, { aliasId, name, kind: 'commentator', createdAt: now, createdBy: 'post-import-api' });
			await $i.db.write(`/social/aliases/${aliasId}/profile`, { aliasId, name, bio: '', createdAt: now });
		}
		// Alias -> org(heichel) link (queryable both directions).
		// B"H 2026-10-11: object value, not boolean true (see writeNativePost).
		const now2 = Date.now();
		await $i.db.write(`/social/aliases/${aliasId}/heichelosContributedTo/${heichelId}`,
			{ aliasId, heichelId, linkedAt: now2, by: 'post-import-api' });
	}

	async writeNativePost($i, post) {
		const h = post.heichelId, s = post.seriesId, pid = post.postId, aliasId = post.aliasId;
		const now = Date.now();
		await $i.db.write(`/social/heichelos/${h}/posts/${pid}`, post);
		// B"H 2026-10-11: backlink values must be objects, not boolean true —
		// primitive values do not roundtrip through $i.db.get (ALIAS_LINK_MISSING).
		await $i.db.write(`/social/aliases/${aliasId}/postsSubmitted/inHeichel/${h}/inSeries/${s}/${pid}`,
			{ postId: pid, aliasId, heichelId: h, seriesId: s, linkedAt: now, by: 'post-import-api' });
	}

	// B"H 2026-10-14 (import-speed): native record ONLY — the hot-loop half
	// of the old writeNativePost. The alias backlink is NOT written here;
	// it is queued via queueBacklink() and flushed in ONE post-job
	// background pass (flushBacklinksBackground), parent-merged: a single
	// read-modify-write per alias/heichel/series instead of one sync write
	// per post. Halves sync DosDB writes in the hot loop.
	async writeNativePostOnly($i, post) {
		await $i.db.write(`/social/heichelos/${post.heichelId}/posts/${post.postId}`, post);
	}

	// Queue one alias backlink for the post-job background flush. Deduped by
	// (aliasId, heichelId, seriesId, postId); the queued value is tiny.
	queueBacklink(job, post) {
		if (!post.aliasId || !post.postId) return;
		if (!job.backlinkQueue) job.backlinkQueue = new Map();
		const key = post.aliasId + '|' + post.heichelId + '|' + post.seriesId + '|' + post.postId;
		if (!job.backlinkQueue.has(key)) {
			job.backlinkQueue.set(key, {
				aliasId: post.aliasId, h: post.heichelId, s: post.seriesId, pid: post.postId,
			});
		}
	}

	// Post-job background backlink flush. Runs AFTER the job is terminal and
	// the 6s watchdog is cleared — it can never trip the limit. Groups queued
	// backlinks by parent path and does ONE read-modify-write per parent
	// (the PathWriteBatch coalescing pattern), mutex-guarded per parent so
	// concurrent jobs cannot interleave. Never awaited by runJob callers.
	async flushBacklinksBackground($i, job) {
		const queue = job.backlinkQueue;
		job.backlinkQueue = new Map();
		const total = queue ? queue.size : 0;
		job.backlinksPending = total;
		job.backlinksDone = 0;
		setJob(job);
		if (!total) { job.backlinksPending = 0; setJob(job); return; }
		appendJobLog($i, { jobId: job.id, event: 'backlinks-flush-start', pending: total });
		try {
			const groups = new Map(); // parentPath -> Map(pid -> value)
			const now = Date.now();
			for (const b of queue.values()) {
				const parent = `/social/aliases/${b.aliasId}/postsSubmitted/inHeichel/${b.h}/inSeries/${b.s}`;
				if (!groups.has(parent)) groups.set(parent, new Map());
				groups.get(parent).set(b.pid, {
					postId: b.pid, aliasId: b.aliasId, heichelId: b.h, seriesId: b.s,
					linkedAt: now, by: 'post-import-api',
				});
			}
			for (const [parent, leaves] of groups) {
				const release = await acquireSeriesLock('backlink:' + parent);
				try {
					let obj = {};
					try { obj = await $i.db.get(parent) || {}; } catch (_) { /* treat as empty */ }
					let changed = false;
					for (const [pid, val] of leaves) {
						// B"H 2026-10-11: object values, not boolean true.
						if (!obj[pid]) { obj[pid] = val; changed = true; }
					}
					if (changed) await $i.db.write(parent, obj);
				} catch (e) {
					job.backlinkErrors = (job.backlinkErrors || 0) + 1;
					job.errors.push({ message: 'BACKLINK_FLUSH_FAILED: ' + parent + ': ' + (e.message || e) });
				} finally {
					release();
				}
				job.backlinksDone += leaves.size;
				job.backlinksPending = total - job.backlinksDone;
				setJob(job);
				await yieldTick();
			}
		} catch (e) {
			job.errors.push({ message: 'BACKLINK_FLUSH_FATAL: ' + (e.message || e) });
			setJob(job);
		}
		job.backlinksPending = 0;
		setJob(job);
		saveJobState($i, job);
		appendJobLog($i, {
			jobId: job.id, event: 'backlinks-flushed',
			done: job.backlinksDone, errors: job.backlinkErrors || 0,
		});
	}

	// Series index entries accumulate in memory and flush in bulk (per
	// series): read-modify-write of the series posts object per post would
	// be O(n^2) for large batches.
	seriesAdd(job, post) {
		const key = JSON.stringify([post.heichelId, post.seriesId]);
		if (!job.seriesAdds.has(key)) job.seriesAdds.set(key, new Map());
		job.seriesAdds.get(key).set(post.postId, { author: post.aliasId, postId: post.postId, title: post.title || '' });
	}

	async flushSeriesAdds($i, job) {
		for (const [key, adds] of job.seriesAdds) {
			if (!adds.size) continue;
			// B"H 2026-10-13 (import-speed): per-series mutex. Multiple jobs
			// may flush the same series concurrently; the read-modify-write
			// below must not interleave. Snapshot+clear happens inside the
			// lock so adds made during the flush are never lost.
			const release = await acquireSeriesLock(key);
			try {
				// B"H 2026-10-11: snapshot + clear SYNCHRONOUSLY before any await,
				// so series adds made by concurrent import workers while this
				// flush is in flight are never wiped by the clear().
				const snapshot = new Map(adds);
				adds.clear();
				const [h, s] = JSON.parse(key);
				const p = `/social/heichelos/${h}/series/${s}/posts`;
				let obj = {};
				try { obj = await $i.db.get(p) || {}; } catch (_) { /* ignore */ }
				let changed = false;
				for (const [pid, entry] of snapshot) {
					if (!obj[pid] || obj[pid].author !== entry.author) { obj[pid] = entry; changed = true; }
				}
				if (changed) {
					try { await $i.db.write(p, obj); }
					catch (e) { job.errors.push({ message: 'SERIES_INDEX_FAILED: ' + s + ': ' + (e.message || e) }); }
				}
			} finally {
				release();
			}
		}
		await yieldTick();
	}

	// -- the per-post write ----------------------------------------------------
	// mirrorPostBulk() is the bulk-optimized writer: core shard gets the
	// full document, allPosts gets the compact mirror, plus manifest and
	// search indexes — exactly what the readers expect. The per-post audit
	// event is skipped on the bulk path (the job log is the audit trail).
	writeOnePost($i, post) {
		return mirrorPost({ $i, post });
	}

	writeOnePostBulk($i, post) {
		return mirrorPostBulk({ $i, post });
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
		saveJobState($i, job);
		// B"H Yaakov's absolute law (2026-10-13): 6-SECOND HARD KILL SWITCH.
		// A watchdog timer enforces this even if the worker loop is stuck in
		// a long sync operation. Exceeding 6s = ABSOLUTE FAILURE.
		const HARD_LIMIT_MS = 6000;
		job._killTimer = setTimeout(() => {
			if (job.status === 'running') {
				job.status = 'absolute-failure';
				job.errors.push({ message: 'ABSOLUTE FAILURE: watchdog killed import exceeding Yaakov\'s 6-second limit.' });
				setJob(job);
				saveJobState($i, job);
			}
		}, HARD_LIMIT_MS);
		if (job._killTimer.unref) job._killTimer.unref();
		// B"H 2026-10-13: no import lock — imports never block deploys/restarts.
		try {
		// One-time scan of the live core shard into {postId -> contentHash}.
		// This replaces the per-post full-shard read that made imports O(n^2).
		// B"H 2026-10-11: async streaming scan — parses only this heichel's
		// post lines and yields to the event loop (the sync scan blocked ~45s
		// on the 3.9 GB production shard).
		// B"H 2026-10-13 (import-speed): skipLiveCheck bypasses the full
		// core-shard scan for known-fresh bulk loads. The 3.9 GB scan is
		// pure overhead when the client guarantees the posts are new.
		// Within-job idempotency via job.doneHashes still applies.
		let liveHashes = new Map();
		if (!job.skipLiveCheck) {
			try {
				liveHashes = await this.buildLiveHashCacheAsync($i, spec.heichelId);
			} catch (e) {
				job.errors.push({ message: 'LIVE_CACHE_FAILED: ' + (e.message || e) });
			}
		}
		await yieldTick();
		appendJobLog($i, {
			jobId: job.id, event: 'started',
			heichelId: spec.heichelId, totalPosts: spec.posts.length,
			dryRun: !!job.dryRun, source: spec.source,
			liveCacheSize: liveHashes.size, skipLiveCheck: !!job.skipLiveCheck,
		});
		const now = Date.now();
		// B"H 2026-10-11: parallel worker pool (Yaakov: maximum throughput).
		// Posts are independent (per-post keys); workers share the job's
		// Maps/Sets, which are safe under the single-threaded event loop
		// because every mutation is synchronous. Series-index flushes are
		// mutex-guarded (a skipped flush's entries stay queued for the next
		// checkpoint) and snapshot+clear so concurrent adds are never lost.
		const WORKERS = Math.max(1, Math.min(16, Number(process.env.AWTSMOOS_IMPORT_WORKERS) || 8));
		let nextPost = 0;
		const processOnePost = async (n) => {
			let raw;
			try {
				raw = this.readSpecPost(spec, spec.posts[n]);
			} catch (e) {
				job.failed++;
				job.errors.push({ postId: String((spec.posts[n] && spec.posts[n].postId) || ('#' + n)), message: e.message });
				return;
			}
			let post;
			let aliasName;
			try {
				const verr = validatePost(raw, n);
				if (verr) throw new Error(verr);
				post = normalizePost(raw, spec.heichelId, now);
				// Alias application (before the idempotency hash: the
				// alias is part of the post's identity).
				aliasName = (post.commentator && String(post.commentator).trim()) || spec.aliasName;
				post.aliasId = this.postAliasId(post, spec.heichelId, spec.aliasId);
				const wireBytes = Buffer.byteLength(canonicalBytes(post));
				if (wireBytes > PER_POST_MAX_BYTES) {
					throw new Error('POST_TOO_LARGE: post ' + post.postId + ' is ' + wireBytes + ' bytes (cap ' + PER_POST_MAX_BYTES + ')');
				}
			} catch (e) {
				job.failed++;
				job.errors.push({ postId: String((raw && (raw.postId || raw.id)) || ('#' + n)), message: e.message });
				return;
			}
			// B"H 2026-10-14 (import-speed): pre-hashed posts protocol. The client
		// may ship contentHash (tarball manifest entry or post field); the
		// server trusts it but re-verifies a 1% sample by recomputation.
		// Repeated mismatch flips the job to compute every hash (fail safe).
		let hash;
		const suppliedHash = validPreHash(spec.posts[n]) || validPreHash(post);
		if (suppliedHash && !job.preHashUntrusted) {
			hash = suppliedHash;
			job.preHashed++;
			if (job.preHashed % 100 === 1) {
				const recomputed = contentHash(post);
				if (recomputed === hash) {
					job.preHashVerified++;
				} else {
					job.preHashMismatches++;
					appendJobLog($i, { jobId: job.id, event: 'prehash-mismatch', postId: post.postId });
					hash = recomputed;
					if (job.preHashMismatches >= 3) {
						job.preHashUntrusted = true;
						appendJobLog($i, { jobId: job.id, event: 'prehash-untrusted', message: 'client hashes failed verification 3x; computing all hashes server-side' });
					}
				}
			}
		} else {
			hash = contentHash(post);
		}
			const liveHash = liveHashes.get(post.postId);
			if (job.doneHashes[post.postId] === hash) {
				// Already processed by THIS job: skip unconditionally.
				job.skipped++;
				return;
			}
			if (liveHash === hash) {
				// B"H 2026-10-11: airtight idempotency. The packed mirror can
				// exist without the native record (server crash between the
				// two writes); a packed-hash match alone must not skip the
				// native write. Verify the native record exists before
				// skipping, otherwise fall through and re-write.
				let nativeOk = false;
				try {
					const existingNative = await $i.db.get(`/social/heichelos/${post.heichelId}/posts/${post.postId}`);
					nativeOk = !!existingNative;
				} catch (_) { /* treat as missing -> re-write */ }
				if (nativeOk) {
					job.skipped++;
					job.doneHashes[post.postId] = hash;
					// B"H 2026-10-12: series index must populate even for
					// idempotent skips — otherwise re-imports leave series
					// pages empty (posts live but unlisted).
					this.seriesAdd(job, post);
					return;
				}
			}
			const existed = job.doneHashes[post.postId] !== undefined || liveHashes.has(post.postId);
			if (!job.dryRun) {
				try {
					// B"H 2026-10-11: native FIRST (source of truth), packed
					// mirror second. A crash between them now leaves a native
					// record without a packed mirror — which the skip check
					// above re-writes idempotently — instead of the reverse
					// (packed without native), which used to skip forever.
					// B"H 2026-10-14 (import-speed): native record ONLY in the hot
					// loop; the alias backlink is queued for the post-job
					// background flush (halves sync writes per post).
					await this.writeNativePostOnly($i, post); // first-class native AwtsmoosDB record
					await this.ensureAlias($i, job.aliasCache, post.aliasId, aliasName, spec.heichelId);
					this.queueBacklink(job, post);
					// B"H 2026-10-13 (import-speed): packed mirror is BATCHED,
					// not written per-post. The old per-post path did 6 sync
					// file ops (mkdir+stat+append+index) per post; the batch
					// does 4 appends per 100 posts. Ordering guarantee kept:
					// every post's native write completes before its packed
					// records are queued, so packed => native always holds.
					// A crash before the flush leaves native-without-packed,
					// which resume re-writes idempotently (see skip check).
					job.packedBatch.push(post);
					if (job.packedBatch.length >= 100) {
						flushPackedBatch($i, job);
					}
					this.seriesAdd(job, post);
				} catch (e) {
					job.failed++;
					job.errors.push({ postId: post.postId, message: 'WRITE_FAILED: ' + (e.message || e) });
					return;
				}
			}
			job.doneHashes[post.postId] = hash;
			liveHashes.set(post.postId, hash);
			job.postsDone++;
			if (existed) job.updated++;
			else job.wrote++;
			// B"H 2026-10-13 (import-speed): yield every 50 posts, not every
			// post. Per-post yields were 1000+ event-loop round-trips for a
			// 1000-post job; every-50 keeps the server responsive at 1/50th
			// the cost. The packed batch flush above is sync but bounded
			// (~100 posts), so no single block exceeds ~100ms.
			job.updatedAt = Date.now();
			setJob(job);
			if (job.postsDone % 50 === 0) await yieldTick();
		};
		// Flush any queued packed-mirror records for this job via the
		// batched writer (4 appends per batch, byte-identical to per-post).
		const flushPackedBatch = ($i, job) => {
			if (!job.packedBatch.length) return;
			const batch = job.packedBatch;
			job.packedBatch = [];
			try {
				mirrorPostsBulk({ $i, posts: batch });
			} catch (e) {
				job.errors.push({ message: 'PACKED_BATCH_FAILED: ' + (e.message || e) + ' (' + batch.length + ' posts)' });
				// Fall back to per-post writes so no post loses its mirror.
				for (const p of batch) {
					try { this.writeOnePostBulk($i, p); }
					catch (e2) { job.errors.push({ postId: p.postId, message: 'PACKED_FALLBACK_FAILED: ' + (e2.message || e2) }); }
				}
			}
		};
		try {
			const worker = async () => {
				while (job.status === 'running') {
					if (job.cancelRequested) { job.status = 'cancelled'; break; }
					// B"H Yaakov's absolute law (2026-10-13): 6-SECOND HARD LIMIT.
					// Exceeding it is an ABSOLUTE FAILURE, not a pause. Split into
					// smaller batches.
					if (Date.now() - job.startedAt > job.timeBudgetMs) {
						job.status = 'absolute-failure';
						job.errors.push({ message: 'ABSOLUTE FAILURE: import exceeded Yaakov\'s 6-second limit. Split into smaller batches.' });
						break;
					}
					if (heapTooHigh()) {
						job.errors.push({ message: 'PAUSED_MEMORY: heap exceeded safe threshold; resume to continue.' });
						job.status = 'paused';
						break;
					}
					const n = nextPost++;
					if (n >= spec.posts.length) break;
					await processOnePost(n);
					// B"H 2026-10-13 (import-speed): persist job state every
					// 500 posts, not every 25. Each save is a sync file write
					// + directory prune scan; every-25 was 40+ saves for a
					// 1000-post job. Every-500 is 2 saves with the same
					// crash-resume guarantee (worst case re-processes 500
					// posts, all idempotent). The packed batch is flushed
					// here too so a crash never leaves >500 posts with
					// native-but-no-packed.
					// B"H 2026-10-12: mid-batch SERIES flush REMOVED — per-worker
					// flushRunning flags don't coordinate across workers,
					// causing lost updates via interleaved read-modify-write.
					// Single final series flush (below) is atomic and complete.
					if (job.postsDone % 500 === 0) {
						flushPackedBatch($i, job);
						saveJobState($i, job);
					}
				}
			};
			appendJobLog($i, { jobId: job.id, event: 'workers', workers: WORKERS });
			await Promise.all(Array.from({ length: WORKERS }, () => worker()));
			// Final flush: any packed records still queued, then series index.
			if (!job.dryRun) flushPackedBatch($i, job);
			if (!job.dryRun) await this.flushSeriesAdds($i, job);
			if (job.status === 'running') job.status = 'done';
		} catch (e) {
			job.status = 'failed';
			job.errors.push({ message: e.message, stack: e.stack });
		}
		// Clear the 6s watchdog — job finished (or failed) within limit
		if (job._killTimer) { clearTimeout(job._killTimer); job._killTimer = null; }
		job.finishedAt = Date.now();
		job.durationMs = job.finishedAt - job.startedAt;
		setJob(job);
		saveJobState($i, job);
		appendJobLog($i, {
			jobId: job.id, event: job.status,
			postsDone: job.postsDone, wrote: job.wrote, updated: job.updated,
			skipped: job.skipped, failed: job.failed,
			errors: job.errors.length, durationMs: job.durationMs,
			preHashed: job.preHashed, preHashMismatches: job.preHashMismatches,
		});
		// B"H 2026-10-14 (import-speed): deferred backlink flush. Launched
		// AFTER the job is terminal and the 6s watchdog is cleared — never
		// awaited, so it can never trip Yaakov's limit. Native records (the
		// system of record) are durable at this point; backlinks are a
		// secondary index for alias/org queries. Crash recovery: the queue
		// is persisted in job state; replay via posts/flush-backlinks.
		if (!job.dryRun && job.backlinkQueue && job.backlinkQueue.size) {
			this.flushBacklinksBackground($i, job).catch(() => {});
		}
		} finally {
			// B"H 2026-10-13: lock removed — nothing to release.
			// Job state is already persisted above; the client resumes
			// 'interrupted' jobs after a restart.
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
			entries.push({
				file: name, postId: f.postId || null, heichelId: f.heichelId || null,
				// B"H 2026-10-14 (import-speed): pre-hashed posts protocol —
				// pass the client's contentHash through (validated 64-hex);
				// the server trusts it but re-verifies a 1% sample.
				contentHash: validPreHash(f),
			});
		}
		return { entries, dest, source: 'upload:' + uploadId };
	}

	// -- routes ------------------------------------------------------------------
	/**
	 * POST /packed/import/posts/start
	 * Body: { operatorKey, heichelId?, dryRun?, timeBudgetMs?,
	 *         posts?: [...] }  — inline, ≤500 posts and ~20 MB
	 *     or  { operatorKey, uploadId, timeBudgetMs? } — staged tarball via /packed/import/bulk/stage
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
		// dryRun may arrive as boolean true (JSON body) or string 'true' ($_POST/$_GET).
		const dryRunRaw = body.dryRun ?? requestValue(this.$i, 'dryRun');
		const dryRun = dryRunRaw === true || dryRunRaw === 'true';
		// Job-level alias fallback for posts without a commentator.
		const jobAliasId = String(body.aliasId || requestValue(this.$i, 'aliasId') || (heichelId + '-import'));
		const jobAliasName = String(body.aliasName || requestValue(this.$i, 'aliasName') || (heichelId + ' Import'));
		// B"H Yaakov's absolute law (2026-10-13): NO import may EVER exceed 6 seconds.
		// Anything taking longer is cancelled immediately and labeled ABSOLUTE FAILURE.
		const timeBudgetMs = Math.min(
			Number(body.timeBudgetMs) > 0 ? Math.floor(Number(body.timeBudgetMs)) : 6000,
			6000
		);
		// B"H 2026-10-13 (import-speed): skipLiveCheck skips the full core-shard
		// scan at job start. Use when the client guarantees the posts are new
		// (fresh bulk load) — the 3.9 GB scan is pure overhead in that case.
		// Within-job idempotency (doneHashes) still applies.
		const skipLiveCheckRaw = body.skipLiveCheck ?? requestValue(this.$i, 'skipLiveCheck');
		const skipLiveCheck = skipLiveCheckRaw === true || skipLiveCheckRaw === 'true';
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
						message: 'Inline payload exceeds ~20 MB. Use POST /packed/import/bulk/stage (chunked upload), then pass uploadId.',
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
		const busy = runningJobsForHeichel(heichelId);
		// B"H 2026-10-13 (import-speed): allow up to MAX_CONCURRENT_PER_HEICHEL
		// concurrent jobs per heichel (was 1). Series-index flushes are
		// mutex-guarded; native writes are per-post keys (no races).
		if (busy.length >= MAX_CONCURRENT_PER_HEICHEL) {
			return {
				success: false, error: 'JOB_ALREADY_RUNNING',
				jobId: busy[0].id, scope: 'heichel', heichelId,
				running: busy.length, maxConcurrent: MAX_CONCURRENT_PER_HEICHEL,
			};
		}
		const job = {
			id: newJobId(), status: 'queued', dryRun,
			spec: { heichelId, posts, source, stagedDir, aliasId: jobAliasId, aliasName: jobAliasName },
			timeBudgetMs, skipLiveCheck,
			totalPosts: posts.length,
			postsDone: 0, wrote: 0, updated: 0, skipped: 0, failed: 0,
			errors: [], doneHashes: {},
			aliasCache: new Set(), seriesAdds: new Map(),
			packedBatch: [],
			// B"H 2026-10-14 (import-speed): deferred backlink queue (post-
			// job background flush) + pre-hash verification counters.
			backlinkQueue: new Map(),
			backlinksPending: 0, backlinksDone: 0, backlinkErrors: 0,
			preHashed: 0, preHashVerified: 0, preHashMismatches: 0, preHashUntrusted: false,
			cancelRequested: false,
			createdAt: Date.now(), updatedAt: Date.now(),
			startedAt: null, finishedAt: null, durationMs: null,
		};
		setJob(job);
		saveJobState(this.$i, job);
		// Fire and forget — the job updates its own record; poll via status.
		// runJob yields to the event loop first (await yieldTick), so the
		// HTTP response is sent before any heavy synchronous work begins.
		this.runJob(this.$i, job).catch(() => {});
		return { success: { jobId: job.id, status: job.status, dryRun, totalPosts: posts.length, source } };
	}

	/** GET /packed/import/posts/status?job=<id>[&wait=1&waitMs=1000]
	 *
	 * B"H 2026-10-13 (import-speed): long-poll support. Pass wait=1 to hold
	 * the request until the job reaches a terminal state or waitMs elapses
	 * (default 1000ms, max 5000ms). This eliminates the client's fixed 5s
	 * poll interval — the server notifies immediately on completion.
	 * Without wait=1, behaves as before (immediate return).
	 */
	async status() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const jobId = requestValue(this.$i, 'job');
		// B"H 2026-10-13 (import-speed): long-poll parameters.
		const waitRaw = requestValue(this.$i, 'wait');
		const wait = waitRaw === '1' || waitRaw === 'true';
		const waitMs = wait
			? Math.min(Math.max(parseInt(requestValue(this.$i, 'waitMs'), 10) || 1000, 100), 5000)
			: 0;
		const TERMINAL = new Set(['done', 'failed', 'cancelled', 'absolute-failure', 'interrupted', 'paused']);
		if (wait && waitMs > 0) {
			const start = Date.now();
			while (Date.now() - start < waitMs) {
				const found = getJobView(this.$i, jobId);
				if (!found) break; // JOB_NOT_FOUND — return immediately
				if (TERMINAL.has(found.view.status)) break;
				// Wait 100ms before re-checking. Non-blocking.
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}
		const found = getJobView(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		const v = found.view;
		return {
			success: {
				id: v.id, status: v.status, dryRun: v.dryRun, live: found.live,
				heichelId: v.heichelId, source: v.source, totalPosts: v.totalPosts,
				postsDone: v.postsDone, wrote: v.wrote, updated: v.updated,
				skipped: v.skipped, failed: v.failed,
				// B"H 2026-10-14 (import-speed): deferred-backlink + pre-hash visibility.
				backlinksPending: v.backlinksPending || 0, backlinksDone: v.backlinksDone || 0,
				preHashed: v.preHashed || 0, preHashVerified: v.preHashVerified || 0,
				preHashMismatches: v.preHashMismatches || 0, preHashUntrusted: !!v.preHashUntrusted,
				errors: (v.errors || []).slice(-10),
				donePostIds: v.donePostIds || [],
				createdAt: v.createdAt, updatedAt: v.updatedAt,
				startedAt: v.startedAt, finishedAt: v.finishedAt,
				durationMs: v.durationMs,
			}
		};
	}

	/** GET /packed/import/posts/jobs */
	async list() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const byId = new Map();
		for (const j of jobs.values()) byId.set(j.id, { ...jobStateShape(j), live: true });
		for (const d of listJobStates(this.$i)) {
			if (!byId.has(d.id)) byId.set(d.id, { ...d, live: false });
		}
		return {
			success: [...byId.values()]
				.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
				.slice(0, 50)
				.map(j => ({
					id: j.id, status: j.status, dryRun: j.dryRun, live: j.live,
					heichelId: j.heichelId, source: j.source,
					totalPosts: j.totalPosts, postsDone: j.postsDone,
					wrote: j.wrote, updated: j.updated, skipped: j.skipped, failed: j.failed,
					errors: (j.errors || []).length, durationMs: j.durationMs,
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
		const found = getJobView(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		if (!found.live) {
			return { success: false, error: 'JOB_NOT_RUNNING', status: found.view.status, message: 'Job is not live on this server instance; nothing to cancel.' };
		}
		const job = found.job;
		if (job.status !== 'running' && job.status !== 'queued') {
			return { success: false, error: 'JOB_NOT_RUNNING', status: job.status };
		}
		job.cancelRequested = true;
		job.updatedAt = Date.now();
		setJob(job);
		saveJobState(this.$i, job);
		return { success: { jobId, cancelRequested: true } };
	}

	/** @returns {Object<string,Function>} Packed post-import route map. */
	routes() {
		return {
			'/packed/import/posts/start': this.start.bind(this),
			'/packed/import/posts/status': this.status.bind(this),
			'/packed/import/posts/jobs': this.list.bind(this),
			'/packed/import/posts/cancel': this.cancel.bind(this),
			'/packed/import/posts/verify': this.verify.bind(this),
			'/packed/import/posts/verify-status': this.verifyStatus.bind(this),
			'/packed/import/posts/ensure-backlinks': this.ensureBacklinks.bind(this),
			'/packed/import/posts/backlinks-status': this.backlinksStatus.bind(this),
			// B"H 2026-10-14 (import-speed): replay a job's persisted
			// deferred-backlink queue (crash recovery for the post-job flush).
			'/packed/import/posts/flush-backlinks': this.flushBacklinks.bind(this),
			'/packed/import/posts/remove': this.remove.bind(this),
		};
	}

	/** POST /packed/import/posts/remove {heichelId, postId} — signed.
	 * Deletes a wrongly-placed post: native record, alias backlink, series
	 * index entry, plus a packed-shard tombstone (append-only shard). */
	async remove() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const body = this.$i?.body || {};
		const heichelId = String(body.heichelId || requestValue(this.$i, 'heichelId') || '');
		const postId = String(body.postId || requestValue(this.$i, 'postId') || '');
		if (!heichelId || !postId) {
			return { success: false, error: 'BAD_ARGS', message: 'heichelId and postId are required' };
		}
		const removed = [];
		let post = null;
		try { post = await this.$i.db.get(`/social/heichelos/${heichelId}/posts/${postId}`); } catch (_) { /* ignore */ }
		if (post) {
			const s = post.seriesId || 'root';
			try {
				await this.$i.db.delete(`/social/heichelos/${heichelId}/posts/${postId}`);
				removed.push('native');
			} catch (e) { return { success: false, error: 'DELETE_FAILED', message: 'native: ' + (e.message || e) }; }
			if (post.aliasId) {
				try {
					await this.$i.db.delete(`/social/aliases/${post.aliasId}/postsSubmitted/inHeichel/${heichelId}/inSeries/${s}/${postId}`);
					removed.push('backlink');
				} catch (_) { /* backlink may not exist */ }
			}
			try {
				const sp = `/social/heichelos/${heichelId}/series/${s}/posts`;
				const obj = await this.$i.db.get(sp) || {};
				if (obj[postId]) {
					delete obj[postId];
					await this.$i.db.write(sp, obj);
					removed.push('series');
				}
			} catch (_) { /* series index may not exist */ }
		}
		// Optional stray-alias cleanup: {aliasId} removes the alias info record
		// and any backlinks the bad import wrote under it for this post.
		const strayAlias = String(body.strayAliasId || requestValue(this.$i, 'strayAliasId') || '');
		if (strayAlias && /^[A-Za-z0-9_-]{1,80}$/.test(strayAlias)) {
			const s2 = (post && post.seriesId) || 'root';
			try { await this.$i.db.delete(`/social/aliases/${strayAlias}/postsSubmitted/inHeichel/${heichelId}/inSeries/${s2}/${postId}`); removed.push('stray-backlink'); } catch (_) {}
			try { await this.$i.db.delete(`/social/aliases/${strayAlias}/info`); removed.push('stray-alias-info'); } catch (_) {}
		}
		try {
			const { writePacked } = require('../../packed/socialPacked.js');
			writePacked({ $i: this.$i, shard: 'core', key: logicalKey(['posts', heichelId, postId]), value: null, op: 'del', meta: { kind: 'postTombstone' } });
			removed.push('packed-tombstone');
		} catch (_) { /* non-fatal */ }
		return { success: { heichelId, postId, removed, existed: !!post } };
	}

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
	}

	/** Stream the core JSONL shard once into {postId -> contentHash} for a heichel. O(1) memory. */
	streamLiveHashes($i, heichelId) {
		return new Promise((resolve) => {
			const cache = new Map();
			const prefix = '/posts/' + heichelId + '/';
			const root = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
			const { SHARDS, shardFile } = require('../../packed/shardPaths.js');
			const file = SHARDS['core'] ? shardFile(root, 'core') : '';
			if (!file || !fs.existsSync(file)) return resolve(cache);
			const readline = require('readline');
			const rl = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
			rl.on('line', (line) => {
				if (!line) return;
				let rec;
				try { rec = JSON.parse(line); } catch (_) { return; }
				const key = rec && rec.key;
				if (typeof key !== 'string' || !key.startsWith(prefix)) return;
				try { cache.set(key.slice(prefix.length), contentHash(rec.value)); } catch (_) { /* ignore */ }
			});
			rl.on('close', () => resolve(cache));
			rl.on('error', () => resolve(cache));
		});
	}

	async runVerify($i, v, files) {
		await yieldTick();
		v.status = 'running';
		v.startedAt = Date.now();
		setJob(v);
		try {
			const liveHashes = await this.streamLiveHashes($i, v.heichelId);
			await yieldTick();
			for (let n = 0; n < files.length; n++) {
				const entry = files[n];
				const postId = String(entry.postId || '');
				let problem = null;
				let expectedHash = null;
				try {
					const full = path.join(v.stagedDir, entry.file);
					const raw = JSON.parse(fs.readFileSync(full, 'utf8'));
					const h = entry.heichelId || v.heichelId;
					const post = normalizePost(raw, h, Date.now());
					const aliasName = (post.commentator && String(post.commentator).trim()) || v.aliasName;
					post.aliasId = deriveAliasId(post.commentator, h, v.aliasId);
					expectedHash = contentHash(post);
					// 1. packed mirror check (streamed map — no per-post file scan).
					const liveHash = liveHashes.get(postId);
					if (liveHash !== expectedHash) {
						problem = liveHash ? 'PACKED_HASH_MISMATCH' : 'PACKED_NOT_FOUND';
					} else {
						// 2. native first-class record check (byte-exact in AwtsmoosDB format).
						let live = null;
						try { live = await $i.db.get(`/social/heichelos/${h}/posts/${postId}`); } catch (_) { /* ignore */ }
						if (!live) problem = 'NATIVE_NOT_FOUND';
						else if (contentHash(live) !== expectedHash) problem = 'NATIVE_HASH_MISMATCH';
						else {
							// 3. alias link check (alias -> post, queryable).
							let link = null;
							try { link = await $i.db.get(`/social/aliases/${post.aliasId}/postsSubmitted/inHeichel/${h}/inSeries/${post.seriesId}/${postId}`); } catch (_) { /* ignore */ }
							if (!link) problem = 'ALIAS_LINK_MISSING';
						}
					}
				} catch (e) {
					problem = 'VERIFY_ERROR: ' + (e.message || e);
				}
				if (problem) v.mismatches.push({ postId, problem });
				else v.ok++;
				v.checked++;
				if (n % 25 === 24) {
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
		setJob(v);
		saveJobState($i, { ...v, spec: { heichelId: v.heichelId, source: 'verify:' + v.uploadId, stagedDir: v.stagedDir }, doneHashes: {} });
		appendJobLog($i, { jobId: v.id, event: 'verify-' + v.status, checked: v.checked, ok: v.ok, mismatches: v.mismatches.length, durationMs: v.durationMs });
	}

	/** GET /packed/import/posts/verify-status?verify=<id> */
	async verifyStatus() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const verifyId = requestValue(this.$i, 'verify');
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

	async runBacklinks($i, b, files) {
		b.status = 'running';
		b.startedAt = Date.now();
		setJob(b);
		await yieldTick();
		try {
			for (let n = 0; n < files.length; n++) {
				const entry = files[n];
				try {
					const full = path.join(b.stagedDir, entry.file);
					const raw = JSON.parse(fs.readFileSync(full, 'utf8'));
					const h = entry.heichelId || b.heichelId;
					const post = normalizePost(raw, h, Date.now());
					const aliasId = deriveAliasId(post.commentator, h, b.aliasId);
					const pid = String(post.postId || entry.postId || '');
					const s = String(post.seriesId || '');
					if (!aliasId || !pid) {
						b.errors.push({ postId: String(entry.postId || ''), problem: 'NO_ALIAS_OR_POSTID' });
					} else {
						// 1. alias -> org(heichel) link (the queryable org/profile link).
						// B"H 2026-10-11: value must be an object — boolean true
						// does not roundtrip through $i.db.get.
						const orgPath = `/social/aliases/${aliasId}/heichelosContributedTo/${h}`;
						let orgLink = null;
						try { orgLink = await $i.db.get(orgPath); } catch (_) { /* ignore */ }
						if (!orgLink) {
							await $i.db.write(orgPath, { aliasId, heichelId: h, linkedAt: Date.now(), by: 'post-import-api' });
							b.written++;
						}
						else b.skipped++;
						// 2. alias -> post backlink.
						const linkPath = `/social/aliases/${aliasId}/postsSubmitted/inHeichel/${h}/inSeries/${s}/${pid}`;
						let link = null;
						try { link = await $i.db.get(linkPath); } catch (_) { /* ignore */ }
						if (!link) {
							await $i.db.write(linkPath, { postId: pid, aliasId, heichelId: h, seriesId: s, linkedAt: Date.now(), by: 'post-import-api' });
							b.written++;
						}
						else b.skipped++;
					}
				} catch (e) {
					b.errors.push({ postId: String((entry && entry.postId) || ''), problem: 'BACKLINK_ERROR: ' + (e.message || e) });
				}
				b.checked++;
				if (n % 25 === 24) {
					b.updatedAt = Date.now();
					setJob(b);
					await yieldTick();
				}
			}
			b.status = 'done';
		} catch (e) {
			b.status = 'failed';
			b.errors.push({ postId: '', problem: 'BACKLINK_JOB_FAILED: ' + (e.message || e) });
		}
		b.finishedAt = Date.now();
		b.durationMs = b.finishedAt - b.startedAt;
		setJob(b);
		saveJobState($i, { ...b, spec: { heichelId: b.heichelId, source: 'backlinks:' + b.uploadId, stagedDir: b.stagedDir }, doneHashes: {} });
	}

	/** GET /packed/import/posts/backlinks-status?backlinks=<id> */
	async backlinksStatus() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const backlinkId = requestValue(this.$i, 'backlinks');
		const found = getJobView(this.$i, backlinkId);
		if (!found) return { success: false, error: 'BACKLINKS_NOT_FOUND', backlinkId };
		const v = found.view;
		return {
			success: {
				id: v.id, status: v.status, live: found.live,
				uploadId: v.uploadId, heichelId: v.heichelId,
				total: v.total, checked: v.checked,
				written: v.written, skipped: v.skipped,
				errors: (v.errors || []).slice(0, 50),
				errorCount: (v.errors || []).length,
				durationMs: v.durationMs,
			}
		};
	}

	// POST /packed/import/posts/flush-backlinks {job}
	// Crash-recovery replay for the deferred backlink queue: the normal path
	// needs no call (runJob flushes automatically post-job), but if the
	// server restarted between job completion and the background flush, the
	// persisted queue replays here. Idempotent: parent-merged writes skip
	// backlinks that already exist.
	async flushBacklinks() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const body = this.$i?.body || {};
		const jobId = String(body.job || requestValue(this.$i, 'job') || '');
		if (!jobId) return { success: false, error: 'NO_JOB', message: 'Provide {job}.' };
		const found = getJobView(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		const persisted = Array.isArray(found.view.backlinkQueue) ? found.view.backlinkQueue : [];
		if (!persisted.length) {
			return { success: { jobId, flushed: 0, message: 'no pending backlinks' } };
		}
		const job = found.live && found.job
			? found.job
			: { id: jobId, status: 'done', errors: [], backlinksDone: 0, backlinkErrors: 0 };
		job.backlinkQueue = new Map(persisted.map((b, i) => [i + '|' + (b && b.pid), b]));
		this.flushBacklinksBackground(this.$i, job).catch(() => {});
		return { success: { jobId, status: 'flushing', pending: persisted.length } };
	}
}

module.exports = { PackedPostImportRoutes, contentHash, normalizePost, canonicalBytes, deriveAliasId };
