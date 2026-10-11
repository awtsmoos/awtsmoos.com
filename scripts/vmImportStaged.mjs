#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VM staged bulk import: tarball -> chunked /stage upload -> import job.
 * @description
 * For large corpora that exceed the inline caps (100 posts / ~2MB):
 *   1. Builds upload.tar.gz from post JSON files + manifest.json
 *   2. Uploads in signed chunks to POST /packed/import/bulk/stage
 *      (each chunk carries ts/sig/op/payloadHash; signature binds the exact
 *      chunk bytes via sha256(uploadId:chunkIndex:dataB64))
 *   3. Starts the import job via signed POST /packed/import/posts/start
 *      with { uploadId }
 *
 * Usage:
 *   node scripts/vmImportStaged.mjs --heichel tanach --posts-dir /path/to/posts --pattern "*.json" [--dry-run] [--upload-id ID]
 *
 * Each *.json in posts-dir must be a single post document (or a JSON array
 * of post documents). Manifest maps file -> { postId, heichelId }.
 *
 * Env:
 *   AWTSMOOS_IMPORT_KEY_FILE — private key path (default ~/.awtsmoos/secure/import-signing-key)
 *   AWTSMOOS_IMPORT_API      — API base (default https://awtsmoos.com/api/social)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const importSign = require('../geelooy/api/social/helper/routes/packed/importSign.js');

const API_BASE = process.env.AWTSMOOS_IMPORT_API || 'https://awtsmoos.com/api/social';
const KEY_FILE = process.env.AWTSMOOS_IMPORT_KEY_FILE || join(homedir(), '.awtsmoos', 'secure', 'import-signing-key');
const CHUNK_BYTES = 1024 * 1024; // 1 MB raw per chunk

function loadPrivateKey() {
	if (!existsSync(KEY_FILE)) { console.error(`B"H signing key not found: ${KEY_FILE}`); process.exit(1); }
	return readFileSync(KEY_FILE, 'utf8');
}

function arg(name) {
	const i = process.argv.indexOf(name);
	return i >= 0 ? process.argv[i + 1] : null;
}

async function postJson(url, body) {
	const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
	return res.json().catch(() => ({ success: false, error: 'BAD_RESPONSE', http: res.status }));
}

async function main() {
	const heichelId = arg('--heichel') || 'ikar';
	const postsDir = arg('--posts-dir');
	const dryRun = process.argv.includes('--dry-run');
	if (!postsDir) throw new Error('--posts-dir required');
	const privKey = loadPrivateKey();

	// 1. Collect post documents.
	const files = readdirSync(postsDir).filter(f => f.endsWith('.json')).sort();
	if (!files.length) throw new Error('no .json files in ' + postsDir);
	const manifestFiles = [];
	// NOTE: work dir must be on persistent disk (/tmp is a small tmpfs).
	const workRoot = process.env.AWTSMOOS_IMPORT_WORKDIR || join(homedir(), 'workspace', 'bulk-import-fix', 'staging', 'work');
	mkdirSync(workRoot, { recursive: true });
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

	// 2. Tarball.
	const tarball = join(workRoot, `import-upload-${Date.now().toString(36)}.tar.gz`);
	execFileSync('tar', ['-czf', tarball, '-C', stageDir, '.']);
	const tarBytes = readFileSync(tarball);
	console.log(`B"H tarball ${(tarBytes.length / 1024 / 1024).toFixed(1)} MB`);

	// 3. Chunked signed upload.
	const uploadId = arg('--upload-id') || ('upl_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex'));
	const totalChunks = Math.ceil(tarBytes.length / CHUNK_BYTES);
	console.log(`B"H uploading ${totalChunks} chunks as ${uploadId}`);
	for (let i = 0; i < totalChunks; i++) {
		const chunk = tarBytes.subarray(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES);
		const dataB64 = chunk.toString('base64');
		const ts = Math.floor(Date.now() / 1000);
		const payloadHash = importSign.sha256hex(`${uploadId}:${i}:${dataB64}`);
		const sig = importSign.signPayload(privKey, { ts, op: 'bulk/stage', heichelId, payloadHash });
		const out = await postJson(`${API_BASE}/packed/import/bulk/stage`, {
			ts, sig, op: 'bulk/stage', heichelId, payloadHash,
			uploadId, chunkIndex: i, totalChunks, data: dataB64,
		});
		if (!out.success) {
			console.error(`B"H chunk ${i} FAILED:`, JSON.stringify(out).slice(0, 400));
			process.exit(1);
		}
		if ((i + 1) % 10 === 0 || i === totalChunks - 1) console.log(`B"H chunk ${i + 1}/${totalChunks} ok`);
	}
	console.log('B"H upload complete');

	// 4. Start the import job (signed).
	const ts = Math.floor(Date.now() / 1000);
	const payloadHash = importSign.sha256hex(uploadId);
	const sig = importSign.signPayload(privKey, { ts, op: 'posts/start', heichelId, payloadHash });
	const startOut = await postJson(`${API_BASE}/packed/import/posts/start`, {
		ts, sig, op: 'posts/start', heichelId, payloadHash, uploadId, dryRun,
	});
	console.log(JSON.stringify(startOut, null, 2));
}

main().catch(e => { console.error('B"H error:', e.message); process.exit(1); });
