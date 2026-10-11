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
const { mirrorPost, mirrorPostBulk, readPacked, listPackedRecords } = require('../../packed/socialPacked.js');
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

function runningJob() {
	for (const j of jobs.values()) if (j.status === 'running') return j;
	return null;
}

function yieldTick() { return new Promise(resolve => setImmediate(resolve)); }

// ---------------------------------------------------------------------------
// Import lock — prevents deploy/service restarts during a finalize window
// (Yaakov 2026-10-11: the 502 root cause was a restart mid-finalize).
// The deploy route refuses push/restart while this lock is fresh; the lock
// is acquired when a job starts and released when it ends. Stale locks
// (>2h) are ignored so a crashed job can never wedge deploys forever.
// ---------------------------------------------------------------------------
function importLockPath() {
	const dir = process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'import-in-progress.lock');
}

function acquireImportLock(jobId) {
	try {
		fs.mkdirSync(path.dirname(importLockPath()), { recursive: true });
		fs.writeFileSync(importLockPath(), JSON.stringify({ jobId, startedAt: Date.now() }));
	} catch (_) { /* best effort */ }
}

function releaseImportLock(jobId) {
	try {
		const raw = JSON.parse(fs.readFileSync(importLockPath(), 'utf8'));
		if (!jobId || raw.jobId === jobId) fs.unlinkSync(importLockPath());
	} catch (_) { /* best effort */ }
}

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
	const { spec, doneHashes, aliasCache, seriesAdds, ...rest } = job || {};
	// B"H 2026-10-11: spec may be absent on in-memory verify jobs (the disk
	// copy gets spec via saveJobState's spread). Never throw here — a shape
	// helper throwing turns every status poll into a 500 ROUTE_ERROR.
	return {
		...rest,
		heichelId: spec?.heichelId || job?.heichelId,
		source: spec?.source,
		donePostIds: Object.keys(doneHashes || {}),
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
	// of readPacked-per-post: on production the core shard is a ~200MB
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
		await $i.db.write(`/social/aliases/${aliasId}/heichelosContributedTo/${heichelId}`, true);
	}

	async writeNativePost($i, post) {
		const h = post.heichelId, s = post.seriesId, pid = post.postId, aliasId = post.aliasId;
		await $i.db.write(`/social/heichelos/${h}/posts/${pid}`, post);
		await $i.db.write(`/social/aliases/${aliasId}/postsSubmitted/inHeichel/${h}/inSeries/${s}/${pid}`, true);
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
			const [h, s] = JSON.parse(key);
			const p = `/social/heichelos/${h}/series/${s}/posts`;
			let obj = {};
			try { obj = await $i.db.get(p) || {}; } catch (_) { /* ignore */ }
			let changed = false;
			for (const [pid, entry] of adds) {
				if (!obj[pid] || obj[pid].author !== entry.author) { obj[pid] = entry; changed = true; }
			}
			if (changed) {
				try { await $i.db.write(p, obj); }
				catch (e) { job.errors.push({ message: 'SERIES_INDEX_FAILED: ' + s + ': ' + (e.message || e) }); }
			}
			adds.clear();
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
		// No deploys/restarts while the finalize runs (the 502 root cause).
		acquireImportLock(job.id);
		try {
		// One-time scan of the live core shard into {postId -> contentHash}.
		// This replaces the per-post full-shard read that made imports O(n^2).
		let liveHashes = new Map();
		try {
			liveHashes = this.buildLiveHashCache($i, spec.heichelId);
		} catch (e) {
			job.errors.push({ message: 'LIVE_CACHE_FAILED: ' + (e.message || e) });
		}
		await yieldTick();
		appendJobLog($i, {
			jobId: job.id, event: 'started',
			heichelId: spec.heichelId, totalPosts: spec.posts.length,
			dryRun: !!job.dryRun, source: spec.source,
			liveCacheSize: liveHashes.size,
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
					continue;
				}
				const hash = contentHash(post);
				const liveHash = liveHashes.get(post.postId);
				if (job.doneHashes[post.postId] === hash || liveHash === hash) {
					job.skipped++;
					job.doneHashes[post.postId] = hash;
					continue;
				}
				const existed = job.doneHashes[post.postId] !== undefined || liveHashes.has(post.postId);
				if (!job.dryRun) {
					try {
						this.writeOnePostBulk($i, post); // packed mirror (readers' diagnostic + idempotency)
						await this.ensureAlias($i, job.aliasCache, post.aliasId, aliasName, spec.heichelId);
						await this.writeNativePost($i, post); // first-class native AwtsmoosDB record
						this.seriesAdd(job, post);
					} catch (e) {
						job.failed++;
						job.errors.push({ postId: post.postId, message: 'WRITE_FAILED: ' + (e.message || e) });
						continue;
					}
				}
				job.doneHashes[post.postId] = hash;
				liveHashes.set(post.postId, hash);
				job.postsDone++;
				if (existed) job.updated++;
				else job.wrote++;
				// Yield after EVERY post (not every 10): a single post's
				// writes can block the event loop for seconds on a network
				// volume; without this the server 502s mid-import.
				job.updatedAt = Date.now();
				setJob(job);
				await yieldTick();
				if (job.postsDone % 25 === 0) {
					saveJobState($i, job);
					if (!job.dryRun) await this.flushSeriesAdds($i, job);
				}
			}
			if (!job.dryRun) await this.flushSeriesAdds($i, job);
			if (job.status === 'running') job.status = 'done';
		} catch (e) {
			job.status = 'failed';
			job.errors.push({ message: e.message, stack: e.stack });
		}
		job.finishedAt = Date.now();
		job.durationMs = job.finishedAt - job.startedAt;
		setJob(job);
		saveJobState($i, job);
		appendJobLog($i, {
			jobId: job.id, event: job.status,
			postsDone: job.postsDone, wrote: job.wrote, updated: job.updated,
			skipped: job.skipped, failed: job.failed,
			errors: job.errors.length, durationMs: job.durationMs,
		});
		} finally {
			// Finalize window over: deploys/restarts allowed again.
			releaseImportLock(job.id);
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
			spec: { heichelId, posts, source, stagedDir, aliasId: jobAliasId, aliasName: jobAliasName },
			timeBudgetMs,
			totalPosts: posts.length,
			postsDone: 0, wrote: 0, updated: 0, skipped: 0, failed: 0,
			errors: [], doneHashes: {},
			aliasCache: new Set(), seriesAdds: new Map(),
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

	/** GET /packed/import/posts/status?job=<id> */
	async status() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const jobId = requestValue(this.$i, 'job');
		const found = getJobView(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		const v = found.view;
		return {
			success: {
				id: v.id, status: v.status, dryRun: v.dryRun, live: found.live,
				heichelId: v.heichelId, source: v.source, totalPosts: v.totalPosts,
				postsDone: v.postsDone, wrote: v.wrote, updated: v.updated,
				skipped: v.skipped, failed: v.failed,
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
		};
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
						const orgPath = `/social/aliases/${aliasId}/heichelosContributedTo/${h}`;
						let orgLink = null;
						try { orgLink = await $i.db.get(orgPath); } catch (_) { /* ignore */ }
						if (!orgLink) { await $i.db.write(orgPath, true); b.written++; }
						else b.skipped++;
						// 2. alias -> post backlink.
						const linkPath = `/social/aliases/${aliasId}/postsSubmitted/inHeichel/${h}/inSeries/${s}/${pid}`;
						let link = null;
						try { link = await $i.db.get(linkPath); } catch (_) { /* ignore */ }
						if (!link) { await $i.db.write(linkPath, true); b.written++; }
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
}

module.exports = { PackedPostImportRoutes, contentHash, normalizePost, canonicalBytes, deriveAliasId };
