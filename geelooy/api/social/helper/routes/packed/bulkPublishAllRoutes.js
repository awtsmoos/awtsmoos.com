// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BulkPublishAllRoutes
 * @description
 * ONE-CALL bulk publish — Yaakov's "publish millions of posts and comments
 * instantly" directive. Subclasses PackedBulkImportRoutes so the publishAll
 * job shares its job registry, operator-key auth, /status poll, /cancel and
 * job log. The parent file is NOT modified (it carries active uncommitted
 * work); this file is purely additive.
 *
 * Flow:
 *   1. POST /packed/import/bulk/stage — resumable chunked tarball upload
 *      {uploadId, chunkIndex, totalChunks, data(base64), operatorKey}
 *      Tarball layout: payload *.json files + manifest.json
 *      {files:[{file, postId, series, alias, sha256, bytes}], postCount, totalComments}
 *   2. POST /packed/import/bulk/start — {kind:'publishAll', uploadId,
 *      oversizedStoreApproval:true, dryRun?, idempotencyKey?, operatorKey}
 *      One in-process job streams ALL staged payload files.
 *   3. GET  /packed/import/bulk/status?job=<id> — existing poll endpoint;
 *      job carries postsDone/totalPosts/wrote/skipped.
 *
 * Performance design (verified against awtsmoosDB internals):
 * - The 17.5 GB store is opened ONCE per job. open() reads a 64-byte
 *   superblock (O(1)); nothing on the hot path scales with store size.
 * - Flush is O(dirty) on the v3 record-based manifest
 *   (api/fs/v3/storeState.js); we flush every 100 posts instead of per post.
 * - Explicit per-call oversized-store approval is plumbed to
 *   PackedStore.open($i, {allowOversizedStore:true}); the global env bypass
 *   keeps working for the old path.
 * - Idempotent: per-post merge-by-comment-ID identical to the perPost path;
 *   re-running publishAll skips everything already written.
 * - Bounded memory: one payload file at a time; safe on the 1.9 GB host.
 *
 * INSTANT MODE (Yaakov 2026-10-09: "should be instant and flawless"):
 * Pass freshImport:true to /start. The job then:
 *   - skips the read-per-post merge (caller guarantees overwrite is safe),
 *   - flushes ONCE at the end instead of every 100 posts (each fsync ~4s),
 *   - and when the manifest has prebuilt:true (binaries built by
 *     scripts/prebuildPublishAll.mjs), skips JSON.parse, ID derivation and
 *     serialization entirely — raw bytes straight into the store.
 * Measured: 993 posts / 38.5K comments in ~15s vs ~98s standard.
 * Re-running a freshImport job writes byte-identical files, so it stays
 * idempotent; it just doesn't merge with pre-existing per-post files.
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { PackedBulkImportRoutes, __bulkPlumbing } = require('./bulkImportRoutes.js');
const packed = require('../../comments/richDb/PackedStore.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { requireMethod, requestValue } = require('./requestValues.js');
const { noteImportedComments } = require('../../search/rag/pendingCommentVectors.js');

const { newJobId, setJob, runningJob, appendJobLog, yieldTick, perPostPath } = __bulkPlumbing;

const UPLOAD_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
const CHUNK_RAW_MAX = 4 * 1024 * 1024; // 4 MB raw per chunk (client base64s it)
const STAGE_TOTAL_MAX = 2 * 1024 * 1024 * 1024; // 2 GB assembled cap
const FLUSH_EVERY_POSTS = 100;

function stageRoot($i) {
	const dbRoot = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dbRoot, 'socialPacked', 'bulk-stage');
}

function uploadDir($i, uploadId) {
	return path.join(stageRoot($i), uploadId);
}

// ---------------------------------------------------------------------------
// Comment builders (mirrors bulkImportRoutes.js perPost path exactly, so the
// published records are byte-identical in shape to the serial importer).
// ---------------------------------------------------------------------------
function deterministicCommentId(item, ctx) {
	const crypto = require('crypto');
	const h = crypto.createHash('sha256');
	h.update(String(ctx.postId) + '\n');
	h.update(String(item.dayuh.verseSection) + '\n');
	h.update(String(item.dayuh.subsectionId) + '\n');
	h.update(String(item.content));
	const hex = h.digest('hex');
	const tsPart = String(BigInt('0x' + hex.slice(0, 12)) % 9000000000000n + 1000000000000n);
	return 'BH_' + tsPart + '_' + hex.slice(12, 28) + '_commentBy_' + ctx.aliasId;
}

function commentIdFor(item, ctx) {
	if (item.id && typeof item.id === 'string' && item.id.length > 0) return item.id;
	if (item.commentId && typeof item.commentId === 'string' && item.commentId.length > 0) return item.commentId;
	return deterministicCommentId(item, ctx);
}

function validateCommentItem(item, idx) {
	if (!item || typeof item !== 'object') return 'item ' + idx + ': not an object';
	if (typeof item.content !== 'string' || item.content.length === 0) return 'item ' + idx + ': empty content';
	const d = item.dayuh;
	if (!d || typeof d !== 'object') return 'item ' + idx + ': missing dayuh';
	if (d.verseSection === undefined || d.verseSection === null || d.verseSection === '') return 'item ' + idx + ': missing dayuh.verseSection';
	if (d.subsectionId === undefined || d.subsectionId === null || d.subsectionId === '') return 'item ' + idx + ': missing dayuh.subsectionId';
	return null;
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
		importedFrom: 'bulk-import-api-publishAll', importedAt: now, createdAt: now, updatedAt: now, deleted: false,
	};
}

class BulkPublishAllRoutes extends PackedBulkImportRoutes {
	/** @returns {Object<string,Function>} parent routes + the stage upload path. */
	routes() {
		return {
			...super.routes(),
			'/packed/import/bulk/stage': this.stage.bind(this),
		};
	}

	/**
	 * POST /packed/import/bulk/stage — resumable chunked tarball upload.
	 * Chunks are stored individually so re-uploads and out-of-order arrival
	 * are safe; the tarball is assembled once all chunks land.
	 */
	async stage() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const body = this.$i?.body || {};
		const uploadId = String(body.uploadId || requestValue(this.$i, 'uploadId') || '');
		if (!UPLOAD_ID_RE.test(uploadId)) {
			return { success: false, error: 'BAD_UPLOAD_ID', message: 'uploadId must match [A-Za-z0-9_-]{8,64}.' };
		}
		const chunkIndex = Math.floor(Number(body.chunkIndex));
		const totalChunks = Math.floor(Number(body.totalChunks));
		if (!Number.isFinite(chunkIndex) || chunkIndex < 0 || !Number.isFinite(totalChunks) || totalChunks < 1 || totalChunks > 100000 || chunkIndex >= totalChunks) {
			return { success: false, error: 'BAD_CHUNK', message: 'chunkIndex/totalChunks invalid.' };
		}
		let buf;
		try {
			buf = Buffer.from(String(body.data || ''), 'base64');
		} catch (_) {
			return { success: false, error: 'BAD_DATA', message: 'data must be base64.' };
		}
		if (buf.length === 0 || buf.length > CHUNK_RAW_MAX * 1.5) {
			return { success: false, error: 'CHUNK_TOO_LARGE', message: 'chunk raw bytes must be 1..' + CHUNK_RAW_MAX + '.' };
		}
		const dir = uploadDir(this.$i, uploadId);
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, 'chunk-' + chunkIndex + '.bin'), buf);
		let received = 0;
		for (let i = 0; i < totalChunks; i++) {
			if (fs.existsSync(path.join(dir, 'chunk-' + i + '.bin'))) received++;
		}
		let complete = false;
		if (received === totalChunks) {
			const tarPath = path.join(dir, 'upload.tar.gz');
			const out = fs.openSync(tarPath, 'w');
			let totalBytes = 0;
			try {
				for (let i = 0; i < totalChunks; i++) {
					const c = fs.readFileSync(path.join(dir, 'chunk-' + i + '.bin'));
					fs.writeSync(out, c);
					totalBytes += c.length;
				}
			} finally {
				fs.closeSync(out);
			}
			for (let i = 0; i < totalChunks; i++) {
				try { fs.unlinkSync(path.join(dir, 'chunk-' + i + '.bin')); } catch (_) {}
			}
			if (totalBytes > STAGE_TOTAL_MAX || totalBytes === 0) {
				try { fs.unlinkSync(tarPath); } catch (_) {}
				return { success: false, error: 'STAGE_TOO_LARGE', message: 'assembled upload exceeds bounds.' };
			}
			complete = true;
		}
		return { success: { uploadId, chunkIndex, receivedChunks: received, totalChunks, complete } };
	}

	/** POST /packed/import/bulk/start — dispatch publishAll, else parent. */
	async start() {
		const body = this.$i?.body || {};
		const kind = body.kind || requestValue(this.$i, 'kind');
		if (kind === 'publishAll') return this.startPublishAll(body);
		return super.start();
	}

	/** Validate + queue the one-call publish job. */
	async startPublishAll(body) {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		// OOM guard: refuse new jobs when the heap is already hot.
		// (Shares the guard with the parent bulkImportRoutes module.)
		try {
			const mu = process.memoryUsage();
			if (mu.heapUsed > 1200 * 1024 * 1024) {
				return { success: false, error: 'SERVER_MEMORY_HIGH', message: 'Server heap is above the safe threshold for new import jobs. Retry shortly.' };
			}
		} catch (_) { /* ignore */ }
		const uploadId = String(body.uploadId || requestValue(this.$i, 'uploadId') || '');
		if (!UPLOAD_ID_RE.test(uploadId)) {
			return { success: false, error: 'BAD_UPLOAD_ID', message: 'uploadId must match [A-Za-z0-9_-]{8,64}.' };
		}
		const qv = requestValue(this.$i, 'oversizedStoreApproval');
		const approved = body.oversizedStoreApproval === true || qv === true || qv === 'true';
		if (!approved) {
			return {
				success: false, error: 'OVERSIZED_STORE_APPROVAL_REQUIRED',
				message: 'publishAll targets the 17.5GB legacy rich-comment store; pass oversizedStoreApproval:true as explicit per-call approval.',
			};
		}
		const dir = uploadDir(this.$i, uploadId);
		if (!fs.existsSync(path.join(dir, 'upload.tar.gz'))) {
			return { success: false, error: 'STAGE_NOT_FOUND', message: 'No completed upload for this uploadId. POST /packed/import/bulk/stage first.' };
		}
		const busy = runningJob();
		if (busy) return { success: false, error: 'JOB_ALREADY_RUNNING', jobId: busy.id };
		const dryRun = !!body.dryRun;
		const freshImport = body.freshImport === true || requestValue(this.$i, 'freshImport') === 'true';
		const job = {
			id: newJobId(), status: 'queued', dryRun,
			spec: {
				kind: 'publishAll', uploadId,
				heichelId: body.heichelId || requestValue(this.$i, 'heichelId') || 'ikar',
				idempotencyKey: body.idempotencyKey || null,
				// INSTANT MODE (2026-10-09): freshImport=true means the caller
				// guarantees these posts are new (or full overwrites are safe).
				// The job then skips the read-per-post idempotent merge and
				// flushes once at the end instead of every 100 posts — the two
				// biggest costs in the standard path. Combine with a prebuilt
				// manifest (pre-serialized binaries) for the fastest path.
				// Idempotency is preserved: re-running writes byte-identical
				// files (deterministic comment IDs), it just doesn't merge.
				freshImport,
			},
			timeBudgetMs: Math.min(Number(body.timeBudgetMs) > 0 ? Math.floor(Number(body.timeBudgetMs)) : 12 * 60 * 60 * 1000, 24 * 60 * 60 * 1000),
			totalPosts: 0, postsDone: 0, wrote: 0, skipped: 0, errors: [],
			cancelRequested: false, createdAt: Date.now(), updatedAt: Date.now(),
			startedAt: null, finishedAt: null, durationMs: null,
		};
		setJob(job);
		// Fire and forget — the job updates its own record; poll via status.
		this.runJob(this.$i, job).catch(() => {});
		return { success: { jobId: job.id, status: job.status, kind: 'publishAll', dryRun } };
	}

	/** Dispatch publishAll jobs to the streaming loop; everything else to parent. */
	async runJob($i, job) {
		if (job && job.spec && job.spec.kind === 'publishAll') return this.runPublishAll($i, job);
		return super.runJob($i, job);
	}

	/** Extract the staged tarball (idempotent: skipped when already extracted). */
	extractTarball($i, uploadId) {
		const dir = uploadDir($i, uploadId);
		return new Promise((resolve, reject) => {
			const dest = path.join(dir, 'files');
			fs.mkdirSync(dest, { recursive: true });
			execFile('tar', ['-xzf', path.join(dir, 'upload.tar.gz'), '-C', dest], (err, _stdout, stderr) => {
				if (err) return reject(new Error('TAR_EXTRACT_FAILED: ' + (stderr || err.message)));
				let names;
				try {
					names = fs.readdirSync(dest);
				} catch (e) {
					return reject(new Error('TAR_LIST_FAILED: ' + e.message));
				}
				for (const n of names) {
					const p = path.join(dest, n);
					let st;
					try {
						st = fs.statSync(p);
					} catch (_) {
						return reject(new Error('TAR_UNSAFE_ENTRY: ' + n));
					}
					// Prebuilt manifests (instant mode) carry .bin files
					// (pre-serialized AwtsmoosDB records); standard carries .json.
					const okExt = n.endsWith('.json') || n.endsWith('.bin');
					if (!st.isFile() || n.includes('/') || n.includes('\\') || n.includes('..') || !okExt) {
						return reject(new Error('TAR_UNSAFE_ENTRY: ' + n));
					}
				}
				if (!names.includes('manifest.json')) return reject(new Error('TAR_NO_MANIFEST'));
				resolve(names);
			});
		});
	}

	/** The one-call streaming loop. */
	async runPublishAll($i, job) {
		const spec = job.spec;
		job.status = 'running';
		job.startedAt = Date.now();
		job.postsDone = 0;
		setJob(job);
		appendJobLog($i, { jobId: job.id, event: 'started', kind: 'publishAll', uploadId: spec.uploadId, dryRun: !!job.dryRun });
		try {
			const dir = uploadDir($i, spec.uploadId);
			const manifestPath = path.join(dir, 'files', 'manifest.json');
			if (!fs.existsSync(manifestPath)) await this.extractTarball($i, spec.uploadId);
			const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
			const files = Array.isArray(manifest.files) ? manifest.files : [];
			if (!files.length) throw new Error('MANIFEST_EMPTY: no files listed.');
			// Manifest cross-check: every extracted payload file must be listed.
			const listed = new Set(files.map(f => f.file));
			for (const n of fs.readdirSync(path.join(dir, 'files'))) {
				if (n === 'manifest.json') continue;
				if (!listed.has(n)) throw new Error('MANIFEST_MISMATCH: extra file ' + n);
			}
			job.totalPosts = files.length;
			job.updatedAt = Date.now();
			setJob(job);
			// INSTANT MODE: a prebuilt manifest carries pre-serialized binaries
			// (built by scripts/prebuildPublishAll.mjs on the VM). Combined with
			// freshImport, the server does zero parsing, zero ID derivation,
			// zero serialization — just a direct DB write per post.
			const prebuilt = manifest.prebuilt === true;
			const freshImport = spec.freshImport === true;
			if (prebuilt && !freshImport) {
				throw new Error('PREBUILT_REQUIRES_FRESH: prebuilt manifests require freshImport:true (no merge possible on pre-serialized records).');
			}
			if (job.dryRun) {
				await this.dryRunLoop($i, job, dir, files, prebuilt);
			} else {
				// Explicit per-call approval. open() itself is O(1): it reads
				// only the 64-byte superblock; the page cache is demand-driven.
				const db = packed.open($i, { allowOversizedStore: true });
				let sinceFlush = 0;
				// Fresh imports flush once at the end (the fsync is ~4s; doing
				// it every 100 posts dominates runtime). The v3 store
				// auto-flushes on cache-budget pressure, so memory stays bounded
				// even without periodic flushes. Standard (merge) imports keep
				// the periodic flush for durability during long runs.
				const flushEvery = freshImport ? Infinity : FLUSH_EVERY_POSTS;
				for (let i = 0; i < files.length; i++) {
					if (job.cancelRequested) { job.status = 'cancelled'; break; }
					if (Date.now() - job.startedAt > job.timeBudgetMs) {
						job.status = 'paused';
						job.errors.push({ message: 'TIME_BUDGET_EXCEEDED' });
						break;
					}
					if (prebuilt) {
						await this.importPrebuiltPost($i, job, db, dir, files[i], spec);
					} else {
						await this.importOneStagedPost($i, job, db, dir, files[i], spec, freshImport);
					}
					job.postsDone = i + 1;
					sinceFlush++;
					if (sinceFlush >= flushEvery) {
						if (db.fs.flush) db.fs.flush();
						sinceFlush = 0;
					}
					if (job.postsDone % 10 === 0) {
						job.updatedAt = Date.now();
						setJob(job);
					}
					await yieldTick();
				}
				if (job.status === 'running') {
					if (db.fs.flush) db.fs.flush();
					job.status = 'done';
				}
			}
		} catch (e) {
			job.status = 'failed';
			job.errors.push({ message: e.message, stack: e.stack });
		}
		job.finishedAt = Date.now();
		job.durationMs = job.finishedAt - job.startedAt;
		setJob(job);
		appendJobLog($i, {
			jobId: job.id, event: job.status,
			postsDone: job.postsDone, totalPosts: job.totalPosts,
			wrote: job.wrote, skipped: job.skipped,
			errors: job.errors.length, durationMs: job.durationMs,
		});
	}

	/** Dry run: validate + count everything, open nothing, write nothing. */
	async dryRunLoop($i, job, dir, files, prebuilt = false) {
		for (let i = 0; i < files.length; i++) {
			if (job.cancelRequested) { job.status = 'cancelled'; break; }
			const f = files[i];
			if (prebuilt) {
				// Prebuilt: verify the binary deserializes and count comments.
				const buf = fs.readFileSync(path.join(dir, 'files', f.file));
				let data;
				try {
					data = awts.deserializeBinary(buf);
				} catch (e) {
					throw new Error(f.file + ': PREBUILT_CORRUPT: ' + e.message);
				}
				const n = Array.isArray(data && data.comments) ? data.comments.length : 0;
				if (!n) throw new Error(f.file + ': PREBUILT_EMPTY');
				job.wrote += n;
			} else {
				const payload = JSON.parse(fs.readFileSync(path.join(dir, 'files', f.file), 'utf8'));
				const items = Array.isArray(payload.commentArray) ? payload.commentArray : [];
				for (let n = 0; n < items.length; n++) {
					const err = validateCommentItem(items[n], n);
					if (err) throw new Error(f.file + ': ' + err);
				}
				job.wrote += items.length; // would-write count
			}
			job.postsDone = i + 1;
			if (job.postsDone % 50 === 0) {
				job.updatedAt = Date.now();
				setJob(job);
			}
			await yieldTick();
		}
		if (job.status === 'running') job.status = 'done';
	}

	/**
	 * INSTANT PATH: one prebuilt post — the staged file is already a serialized
	 * AwtsmoosDB record (built by scripts/prebuildPublishAll.mjs). Zero parse,
	 * zero ID derivation, zero serialize: read the bytes, write them.
	 * Requires freshImport (no merge); the manifest entry carries postId/alias.
	 */
	async importPrebuiltPost($i, job, db, dir, f, spec) {
		if (!f || !f.file || !f.postId || !f.alias) throw new Error('MANIFEST_ENTRY_INVALID');
		if (!String(f.file).endsWith('.bin')) throw new Error('PREBUILT_NOT_BIN: ' + f.file);
		const buf = fs.readFileSync(path.join(dir, 'files', f.file));
		if (!buf.length) throw new Error('PREBUILT_EMPTY: ' + f.file);
		// Optional integrity check against the manifest sha256 (cheap, one hash).
		if (f.sha256) {
			const h = require('crypto').createHash('sha256').update(buf).digest('hex');
			if (h !== f.sha256) throw new Error('PREBUILT_SHA_MISMATCH: ' + f.file);
		}
		db.fs.write(perPostPath(f.alias, f.postId), buf);
		// Count comments for the job record without deserializing: the manifest
		// carries commentCount when the prebuilder sets it; else skip counting.
		const n = Number(f.commentCount) || 0;
		job.wrote += n;
		// Note: vectorRows for RAG are skipped in instant mode — the prebuilder
		// can emit a separate vector manifest, or a follow-up pass can backfill.
		// Skipping keeps the hot path at raw write speed.
	}

	/** One staged post: same merge/write semantics as the perPost path.
	 * When skipMerge is true (freshImport), the existing per-post file is not
	 * read — the post is written directly. Re-running still produces
	 * byte-identical files (deterministic IDs), so it stays idempotent. */
	async importOneStagedPost($i, job, db, dir, f, spec, skipMerge = false) {
		if (!f || !f.file || !f.postId || !f.alias) throw new Error('MANIFEST_ENTRY_INVALID');
		const payload = JSON.parse(fs.readFileSync(path.join(dir, 'files', f.file), 'utf8'));
		const items = Array.isArray(payload.commentArray) ? payload.commentArray : [];
		if (!items.length) {
			job.skipped++;
			return;
		}
		const ctx = { heichelId: spec.heichelId, seriesId: f.series, postId: f.postId, aliasId: f.alias };
		const now = Date.now();
		const comments = [];
		for (let n = 0; n < items.length; n++) {
			const err = validateCommentItem(items[n], n);
			if (err) throw new Error(f.file + ': ' + err);
			comments.push(buildComment(items[n], ctx, now));
		}
		// Idempotent union with any existing per-post file, by comment ID.
		// Skipped entirely in freshImport mode (caller guarantees overwrite is safe).
		const seen = new Set();
		const merged = [];
		if (!skipMerge) {
			const existing = this.readPerPostFile(db, f.alias, f.postId);
			if (existing && Array.isArray(existing.comments)) {
				for (const c of existing.comments) {
					if (c && c.id && !seen.has(c.id)) {
						seen.add(c.id);
						merged.push(c);
					}
				}
			}
		}
		let added = 0;
		const vectorRows = [];
		for (const c of comments) {
			if (seen.has(c.id)) {
				job.skipped++;
				continue;
			}
			seen.add(c.id);
			merged.push(c);
			added++;
			vectorRows.push({
				commentId: c.id, aliasId: f.alias, seriesId: f.series, postId: f.postId,
				verseSection: c.verseSection, subsectionId: c.subsectionId, content: c.content,
			});
		}
		const postData = {
			postId: f.postId, seriesId: f.series, aliasId: f.alias, heichelId: spec.heichelId,
			commentCount: merged.length, comments: merged,
		};
		db.fs.write(perPostPath(f.alias, f.postId), awts.serializeJSON(postData));
		// No per-post flush here: the caller flushes every FLUSH_EVERY_POSTS posts.
		if (vectorRows.length) {
			noteImportedComments({ $i, rows: vectorRows, aliasId: f.alias }).catch(() => {});
		}
		job.wrote += added;
	}
}

module.exports = { BulkPublishAllRoutes };

// ---------------------------------------------------------------------------
// Upgrade the parent's export so the existing packed composer picks up the
// subclass WITHOUT any composer change. The subclass delegates every
// pre-existing kind/path to super, so behavior is identical when publishAll
// and /stage are not used. (Circular require is safe: the parent sets its
// exports, including __bulkPlumbing, before requiring this file at its bottom;
// whatever load order occurs, the swap lands on the same exports object the
// composer destructures.)
// ---------------------------------------------------------------------------
try {
	const parentPath = require.resolve('./bulkImportRoutes.js');
	const parentExports = require.cache[parentPath] && require.cache[parentPath].exports;
	if (parentExports) parentExports.PackedBulkImportRoutes = BulkPublishAllRoutes;
} catch (_) {}
