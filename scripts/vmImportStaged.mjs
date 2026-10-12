#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VM staged bulk import: tarball -> chunked /stage upload -> import job -> verify.
 * @description
 * Reliable, reusable bulk importer for Awtsmoos.com post documents
 * (Yaakov 2026-10-11: bulk importer is #1 — must work for FUTURE batches too).
 *
 *   1. Builds upload.tar.gz from post JSON files + manifest.json
 *   2. Uploads in signed chunks to POST /packed/import/bulk/stage
 *      (each chunk carries ts/sig/op/payloadHash; signature binds the exact
 *      chunk bytes via sha256(uploadId:chunkIndex:dataB64))
 *   3. Starts the import job via signed POST /packed/import/posts/start
 *      with { uploadId }
 *   4. Polls GET /packed/import/posts/status to a terminal state,
 *      auto-resuming paused/interrupted jobs (idempotent content-hash
 *      skip makes re-runs safe)
 *   5. Verifies EVERY post body byte-exact: GET /packed/read per post,
 *      contentHash(live value) === contentHash(normalizePost(source doc))
 *      (HTTP 200 alone is NOT proof — bodies are compared)
 *
 * Reliability:
 * - State file <workdir>/import-state-<uploadId>.json persists across VM
 *   restarts: uploadId, tarball, uploaded chunk indexes, job ids, phase,
 *   verify progress. Re-running with the same --upload-id resumes exactly
 *   where it stopped — chunks already ACKed are never re-sent.
 * - Server-side chunk writes are idempotent (chunk-N.bin overwrite), so a
 *   re-sent chunk is harmless.
 *
 * Usage:
 *   node scripts/vmImportStaged.mjs --heichel tanach --posts-dir /path/to/posts [--upload-id ID] [--dry-run] [--verify-only] [--time-budget-ms 1200000]
 *
 * Each *.json in posts-dir must be a single post document (or a JSON array
 * of post documents). Manifest maps file -> { postId, heichelId }.
 *
 * Env:
 *   AWTSMOOS_IMPORT_KEY_FILE — private key path (default ~/.awtsmoos/secure/import-signing-key)
 *   AWTSMOOS_IMPORT_API      — API base (default https://awtsmoos.com/api/social)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const importSign = require('../geelooy/api/social/helper/routes/packed/importSign.js');
const { contentHash, normalizePost } = require('../geelooy/api/social/helper/routes/packed/postImportRoutes.js');

const API_BASE = process.env.AWTSMOOS_IMPORT_API || 'https://awtsmoos.com/api/social';
const KEY_FILE = process.env.AWTSMOOS_IMPORT_KEY_FILE || join(homedir(), '.awtsmoos', 'secure', 'import-signing-key');
const CHUNK_BYTES = 1024 * 1024; // 1 MB raw per chunk
const POLL_MS = 15000;
const OVERALL_TIMEOUT_MS = 12 * 60 * 60 * 1000;
// B"H 2026-10-11 (import-speed): chunk uploads run in parallel — the
// server's /stage route is idempotent per chunk (chunk-N.bin overwrite)
// and explicitly safe for out-of-order arrival. Default 6; override with
// --upload-concurrency N.
const UPLOAD_CONCURRENCY = Math.max(1, Number(arg('--upload-concurrency')) || Number(process.env.AWTSMOOS_UPLOAD_CONCURRENCY) || 6);

function loadPrivateKey() {
	if (!existsSync(KEY_FILE)) { console.error(`B"H signing key not found: ${KEY_FILE}`); process.exit(1); }
	return readFileSync(KEY_FILE, 'utf8');
}

function arg(name) {
	const i = process.argv.indexOf(name);
	return i >= 0 ? process.argv[i + 1] : null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// 502/503/504 from nginx (service restarting / upstream blip) are RETRYABLE:
// exponential backoff, up to ~4 minutes per call. The finalize never fails
// on a transient 502 — it waits and retries.
function retryableOut(out) {
	return !out.success && out.error === 'BAD_RESPONSE' && [502, 503, 504].includes(out.http);
}

async function postJson(url, body, tries = 6) {
	let last;
	for (let t = 0; t < tries; t++) {
		try {
			const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
			const out = await res.json().catch(() => ({ success: false, error: 'BAD_RESPONSE', http: res.status }));
			if (!retryableOut(out) || t === tries - 1) return out;
			last = out;
		} catch (e) { last = e; if (t === tries - 1) break; }
		await sleep(Math.min(5000 * Math.pow(2, t), 60000));
	}
	return { success: false, error: 'FETCH_FAILED', message: String(last && last.message || last) };
}

async function getJson(url, tries = 6) {
	let last;
	for (let t = 0; t < tries; t++) {
		try {
			const res = await fetch(url);
			const out = await res.json().catch(() => ({ success: false, error: 'BAD_RESPONSE', http: res.status }));
			if (!retryableOut(out) || t === tries - 1) return out;
			last = out;
		} catch (e) { last = e; if (t === tries - 1) break; }
		await sleep(Math.min(5000 * Math.pow(2, t), 60000));
	}
	return { success: false, error: 'FETCH_FAILED', message: String(last && last.message || last) };
}

function signedBody(privKey, op, heichelId, payloadHash, extra) {
	const ts = Math.floor(Date.now() / 1000);
	const sig = importSign.signPayload(privKey, { ts, op, heichelId, payloadHash });
	return { ts, sig, op, heichelId, payloadHash, ...extra };
}

async function main() {
	const heichelId = arg('--heichel') || 'ikar';
	const postsDir = arg('--posts-dir');
	const dryRun = process.argv.includes('--dry-run');
	const verifyOnly = process.argv.includes('--verify-only');
	const timeBudgetMs = Math.min(Number(arg('--time-budget-ms')) > 0 ? Number(arg('--time-budget-ms')) : 20 * 60 * 1000, 60 * 60 * 1000);
	const privKey = loadPrivateKey();
	const workRoot = process.env.AWTSMOOS_IMPORT_WORKDIR || join(homedir(), 'workspace', 'bulk-import-fix', 'staging', 'work');
	mkdirSync(workRoot, { recursive: true });

	let uploadId = arg('--upload-id');
	let statePath = uploadId ? join(workRoot, `import-state-${uploadId}.json`) : null;
	let state = null;
	if (statePath && existsSync(statePath)) {
		state = JSON.parse(readFileSync(statePath, 'utf8'));
		console.log(`B"H resuming state ${uploadId}: phase=${state.phase} chunks=${(state.uploadedChunks || []).length}/${state.totalChunks} jobs=${(state.jobIds || []).length}`);
	}
	if (statePath && !state) {
		console.error(`B"H --upload-id ${uploadId} has no state file at ${statePath} - refusing to mint a fresh uploadId; list ${workRoot}/import-state-*.json to find a valid id`);
		process.exit(1);
	}
	if (!state) {
		if (!postsDir) throw new Error('--posts-dir required for a new import (or pass --upload-id to resume)');
		uploadId = 'upl_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex');
		statePath = join(workRoot, `import-state-${uploadId}.json`);
		state = { uploadId, heichelId, postsDir, phase: 'staging', uploadedChunks: [], jobIds: [], createdAt: Date.now() };
	}
	const saveState = () => writeFileSync(statePath, JSON.stringify(state));

	// ---- 1. Collect + tarball (skipped on resume when tarball exists) ----
	if (!verifyOnly && (!state.tarball || !existsSync(state.tarball))) {
		const files = readdirSync(postsDir).filter(f => f.endsWith('.json')).sort();
		if (!files.length) throw new Error('no .json files in ' + postsDir);
		const manifestFiles = [];
		const stageDir = join(workRoot, 'import-stage-' + Date.now().toString(36));
		mkdirSync(stageDir, { recursive: true });
		let n = 0;
		for (const f of files) {
			const docs = JSON.parse(readFileSync(join(postsDir, f), 'utf8'));
			const arr = Array.isArray(docs) ? docs : [docs];
			for (const doc of arr) {
				const postId = doc.postId || doc.id;
				if (!postId) throw new Error(`file ${f}: post missing postId`);
				const name = `post_${String(n).padStart(5, '0')}.json`;
				writeFileSync(join(stageDir, name), JSON.stringify(doc));
				manifestFiles.push({ file: name, postId: String(postId), heichelId: doc.heichelId || heichelId });
				n++;
			}
		}
		writeFileSync(join(stageDir, 'manifest.json'), JSON.stringify({ files: manifestFiles, postCount: n }));
		console.log(`B"H staged ${n} posts from ${files.length} files`);
		const tarball = join(workRoot, `import-upload-${Date.now().toString(36)}.tar.gz`);
		// B"H 2026-10-11 (import-speed): pigz (parallel gzip) when
		// available — same .tar.gz bytes format, multi-core compression.
		// Falls back to tar's built-in serial gzip.
		let usePigz = false;
		try { execFileSync('pigz', ['--version'], { stdio: 'ignore' }); usePigz = true; } catch (_) { /* no pigz */ }
		const tTar0 = Date.now();
		if (usePigz) execFileSync('tar', ['-I', 'pigz', '-cf', tarball, '-C', stageDir, '.']);
		else execFileSync('tar', ['-czf', tarball, '-C', stageDir, '.']);
		const tarBytes = readFileSync(tarball);
		console.log(`B"H tarball ${(tarBytes.length / 1024 / 1024).toFixed(1)} MB (${usePigz ? 'pigz' : 'gzip'}, ${((Date.now() - tTar0) / 1000).toFixed(1)}s)`);
		state.stageDir = stageDir;
		state.tarball = tarball;
		state.totalChunks = Math.ceil(tarBytes.length / CHUNK_BYTES);
		state.phase = 'uploading';
		saveState();
	}

	// ---- 2. Chunked signed upload (resume: skip ACKed chunks) ----
	// B"H 2026-10-11 (import-speed): parallel chunk upload. Server-side
	// chunks are idempotent (chunk-N.bin overwrite) and order-independent;
	// the tarball is assembled only when the last chunk lands. A failed
	// chunk aborts the pool; re-running with --upload-id resumes exactly
	// at the missing chunks.
	if (!verifyOnly && state.phase !== 'done' && state.phase !== 'verifying') {
		const tarBytes = readFileSync(state.tarball);
		const totalChunks = state.totalChunks;
		const done = new Set(state.uploadedChunks || []);
		const pending = [];
		for (let i = 0; i < totalChunks; i++) if (!done.has(i)) pending.push(i);
		console.log(`B"H uploading ${totalChunks} chunks as ${uploadId} (${done.size} already ACKed, ${pending.length} to send, concurrency=${UPLOAD_CONCURRENCY})`);
		let nextChunk = 0;
		let failed = null;
		let completed = 0;
		const t0 = Date.now();
		const uploadOne = async (i) => {
			const chunk = tarBytes.subarray(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES);
			const dataB64 = chunk.toString('base64');
			const payloadHash = importSign.sha256hex(`${uploadId}:${i}:${dataB64}`);
			const out = await postJson(
				`${API_BASE}/packed/import/bulk/stage`,
				signedBody(privKey, 'bulk/stage', heichelId, payloadHash, { uploadId, chunkIndex: i, totalChunks, data: dataB64 })
			);
			if (!out.success) throw new Error(`chunk ${i} FAILED: ` + JSON.stringify(out).slice(0, 400));
			done.add(i);
			completed++;
			if (completed % 10 === 0 || completed === pending.length) {
				const el = ((Date.now() - t0) / 1000).toFixed(0);
				console.log(`B"H chunk ${completed}/${pending.length} ok (${el}s, server: ${out.success.receivedChunks}/${out.success.totalChunks})`);
				state.uploadedChunks = [...done].sort((a, b) => a - b);
				saveState();
			}
		};
		const uploader = async () => {
			while (!failed) {
				const i = pending[nextChunk++];
				if (i === undefined) break;
				try { await uploadOne(i); }
				catch (e) { failed = e; break; }
			}
		};
		await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, pending.length) }, () => uploader()));
		if (failed) {
			console.error('B"H', failed.message);
			console.error(`B"H state saved; re-run with --upload-id ${uploadId} to resume`);
			process.exit(1);
		}
		state.uploadedChunks = [...done].sort((a, b) => a - b);
		saveState();
		console.log(`B"H upload complete (${((Date.now() - t0) / 1000).toFixed(1)}s for ${pending.length} chunks)`);
		state.phase = 'starting';
		saveState();
	}

	// ---- 3+4. Start job, poll to terminal, auto-resume ----
	const startJob = async () => {
		const payloadHash = importSign.sha256hex(uploadId);
		const out = await postJson(
			`${API_BASE}/packed/import/posts/start`,
			signedBody(privKey, 'posts/start', heichelId, payloadHash, { uploadId, dryRun, timeBudgetMs })
		);
		if (!out.success) {
			console.error('B"H start FAILED:', JSON.stringify(out).slice(0, 500));
			return null;
		}
		const jobId = out.success.jobId;
		state.jobIds.push(jobId);
		state.phase = 'importing';
		saveState();
		console.log(`B"H job started: ${jobId} (${out.success.totalPosts} posts, dryRun=${dryRun})`);
		return jobId;
	};

	const jobStatus = async (jobId) => {
		const payloadHash = importSign.sha256hex('job:' + jobId);
		const ts = Math.floor(Date.now() / 1000);
		const sig = importSign.signPayload(privKey, { ts, op: 'posts/status', heichelId: '', payloadHash });
		const url = `${API_BASE}/packed/import/posts/status?job=${encodeURIComponent(jobId)}&ts=${ts}&op=posts/status&payloadHash=${payloadHash}&sig=${encodeURIComponent(sig)}`;
		return getJson(url);
	};

	if (!verifyOnly && state.phase !== 'done' && state.phase !== 'verifying') {
		let jobId = state.jobIds[state.jobIds.length - 1] || null;
		if (!jobId) jobId = await startJob();
		if (!jobId) process.exit(1);
		const t0 = Date.now();
		let restarts = 0;
		while (true) {
			if (Date.now() - t0 > OVERALL_TIMEOUT_MS) { console.error('B"H TIMEOUT 12h — state saved, resume with --upload-id ' + uploadId); process.exit(1); }
			let out;
			try { out = await jobStatus(jobId); }
			catch (e) { console.log(`poll error: ${e.message}`); await sleep(POLL_MS); continue; }
			const s = out.success || {};
			const el = Math.round((Date.now() - t0) / 1000);
			if (out.error === 'JOB_NOT_FOUND' || s.status === 'interrupted') {
				console.log(`[${el}s] job ${jobId} ${out.error || 'interrupted'} — resuming with a new job (idempotent skip)`);
				jobId = await startJob();
				if (!jobId) process.exit(1);
				if (++restarts > 50) { console.error('B"H too many restarts'); process.exit(1); }
				continue;
			}
			console.log(`[${el}s] ${s.status} done=${s.postsDone}/${s.totalPosts} wrote=${s.wrote} updated=${s.updated} skipped=${s.skipped} failed=${s.failed}`);
			if (s.errors && s.errors.length) console.log('  errors:', JSON.stringify(s.errors.slice(-3)));
			if (s.status === 'done' || s.status === 'failed' || s.status === 'cancelled') {
				if (s.status !== 'done') { console.error('B"H job ended: ' + s.status); process.exit(1); }
				break;
			}
			if (s.status === 'paused') {
				console.log(`[${el}s] job paused (time budget) — resuming with a new job (idempotent skip)`);
				jobId = await startJob();
				if (!jobId) process.exit(1);
				if (++restarts > 50) { console.error('B"H too many restarts'); process.exit(1); }
				continue;
			}
			await sleep(POLL_MS);
		}
		state.phase = 'verifying';
		saveState();
	}

	// ---- 5. Verify EVERY post body byte-exact (server-side) ----
	// The verify runs ON production as a background job: one streaming pass
	// over the core shard + native $i.db reads. The old per-post /packed/read
	// loop parsed the entire shard file per request — it 500'd and hammered
	// the server. Never verify that way again.
	if (!dryRun) {
		const startVerify = async () => {
			const payloadHash = importSign.sha256hex('verify:' + uploadId);
			const out = await postJson(
				`${API_BASE}/packed/import/posts/verify`,
				signedBody(privKey, 'posts/verify', heichelId, payloadHash, { uploadId, heichelId })
			);
			if (!out.success) {
				console.error('B"H verify start FAILED:', JSON.stringify(out).slice(0, 500));
				return null;
			}
			console.log(`B"H verify job started: ${out.success.verifyId} (${out.success.total} posts)`);
			return out.success.verifyId;
		};
		const verifyStatus = async (verifyId) => {
			const payloadHash = importSign.sha256hex('verify-status:' + verifyId);
			const ts = Math.floor(Date.now() / 1000);
			const sig = importSign.signPayload(privKey, { ts, op: 'posts/verify-status', heichelId: '', payloadHash });
			const url = `${API_BASE}/packed/import/posts/verify-status?verify=${encodeURIComponent(verifyId)}&ts=${ts}&op=posts/verify-status&payloadHash=${payloadHash}&sig=${encodeURIComponent(sig)}`;
			return getJson(url);
		};
		let verifyId = (state.verify && state.verify.verifyId) || null;
		if (!verifyId) {
			verifyId = await startVerify();
			if (!verifyId) process.exit(1);
			state.verify = { verifyId, checked: 0, ok: 0, mismatches: [] };
			saveState();
		} else {
			console.log(`B"H resuming verify job ${verifyId}`);
		}
		const t0 = Date.now();
		let vrestarts = 0;
		while (true) {
			if (Date.now() - t0 > OVERALL_TIMEOUT_MS) { console.error('B"H VERIFY TIMEOUT — resume with --upload-id ' + uploadId); process.exit(1); }
			const out = await verifyStatus(verifyId);
			const s = out.success || {};
			const el = Math.round((Date.now() - t0) / 1000);
			console.log(`[${el}s] verify ${s.status} checked=${s.checked}/${s.total} ok=${s.ok} mismatches=${s.mismatchCount}`);
			state.verify = { verifyId, checked: s.checked || 0, ok: s.ok || 0, mismatches: s.mismatches || [] };
			saveState();
			if (s.status === 'interrupted') {
				console.log(`[${el}s] verify ${verifyId} interrupted — restarting verify (read-only, idempotent)`);
				verifyId = await startVerify();
				if (!verifyId) process.exit(1);
				state.verify = { verifyId, checked: 0, ok: 0, mismatches: [] };
				saveState();
				if (++vrestarts > 50) { console.error('B"H too many verify restarts'); process.exit(1); }
				continue;
			}
			if (s.status === 'done' || s.status === 'failed' || s.status === 'cancelled') {
				if (s.status !== 'done') { console.error('B"H verify ended: ' + s.status); process.exit(1); }
				break;
			}
			await sleep(POLL_MS);
		}
		const v = state.verify;
		console.log(`B"H VERIFY COMPLETE: ${v.ok} byte-exact, ${v.mismatches.length} mismatches`);
		if (v.mismatches.length) {
			writeFileSync(join(workRoot, `verify-mismatches-${uploadId}.json`), JSON.stringify(v.mismatches, null, 2));
			console.error(`B"H ${v.mismatches.length} MISMATCHES — see verify-mismatches-${uploadId}.json`);
			process.exit(1);
		}
	}

	state.phase = 'done';
	state.finishedAt = Date.now();
	saveState();
	console.log('B"H IMPORT COMPLETE — all posts imported and byte-exact verified');
}

main().catch(e => { console.error('B"H error:', e.message); process.exit(1); });
