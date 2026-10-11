#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VM-direct signed post-import client for Awtsmoos.com production.
 * @description
 * Sends Ed25519-signed requests to /api/social/packed/import/posts/* —
 * no Mac, no tunnel, no shared secrets. Each request is authenticated with
 * the VM-only import private key (~/.awtsmoos/secure/import-signing-key,
 * chmod 600); production verifies against the public key baked into
 * geelooy/api/social/helper/routes/packed/importSign.js.
 *
 * The signature covers { v, ts, op, heichelId, payloadHash }, where
 * payloadHash binds the actual payload (sha256 of the posts JSON for inline
 * mode, of the uploadId for staged mode, of 'job:<id>' for status/cancel,
 * of 'jobs' for the job list). Server recomputes and rejects on mismatch.
 *
 * Usage:
 *   node scripts/vmImportSigned.mjs start --heichel tanach --posts /path/posts.json [--dry-run]
 *   node scripts/vmImportSigned.mjs start --heichel tanach --upload-id <id> [--dry-run]
 *   node scripts/vmImportSigned.mjs status --job <jobId>
 *   node scripts/vmImportSigned.mjs jobs
 *   node scripts/vmImportSigned.mjs cancel --job <jobId>
 *
 * Env:
 *   AWTSMOOS_IMPORT_KEY_FILE — private key path (default ~/.awtsmoos/secure/import-signing-key)
 *   AWTSMOOS_IMPORT_API      — API base (default https://awtsmoos.com/api/social)
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const importSign = require('../geelooy/api/social/helper/routes/packed/importSign.js');

const API_BASE = process.env.AWTSMOOS_IMPORT_API || 'https://awtsmoos.com/api/social';
const KEY_FILE = process.env.AWTSMOOS_IMPORT_KEY_FILE || join(homedir(), '.awtsmoos', 'secure', 'import-signing-key');

function loadPrivateKey() {
	if (!existsSync(KEY_FILE)) {
		console.error(`B"H signing key not found: ${KEY_FILE}`);
		process.exit(1);
	}
	return readFileSync(KEY_FILE, 'utf8');
}

/** payloadHash derivation — MUST match the server's checkSignatureAuth. */
function payloadHashFor(op, fields) {
	if (op === 'posts/start') {
		if (fields.uploadId) return importSign.sha256hex(String(fields.uploadId));
		return importSign.sha256hex(JSON.stringify(fields.posts));
	}
	if (op === 'posts/status' || op === 'posts/cancel') {
		return importSign.sha256hex('job:' + String(fields.job || ''));
	}
	if (op === 'posts/jobs') return importSign.sha256hex('jobs');
	throw new Error('unknown op: ' + op);
}

async function signedRequest(route, op, fields) {
	const ts = Math.floor(Date.now() / 1000);
	const heichelId = fields.heichelId || 'ikar';
	const payloadHash = payloadHashFor(op, fields);
	const sig = importSign.signPayload(loadPrivateKey(), { ts, op, heichelId, payloadHash });
	const method = route === '/packed/import/posts/start' || route === '/packed/import/posts/cancel' ? 'POST' : 'GET';
	let url = `${API_BASE}${route}`;
	const body = { ts, sig, op, heichelId, payloadHash, ...fields };
	let fetchOpts = { method, headers: { 'content-type': 'application/json' } };
	if (method === 'POST') {
		fetchOpts.body = JSON.stringify(body);
	} else {
		// GET: posts never travel in the query string.
		const { posts, ...query } = body;
		const qs = new URLSearchParams();
		for (const [k, v] of Object.entries(query)) {
			if (v !== undefined && v !== null && typeof v !== 'object') qs.set(k, String(v));
		}
		url += '?' + qs.toString();
	}
	const res = await fetch(url, fetchOpts);
	const data = await res.json().catch(() => ({ success: false, error: 'BAD_RESPONSE', http: res.status }));
	return data;
}

function arg(name) {
	const i = process.argv.indexOf(name);
	return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
	const cmd = process.argv[2];
	const heichelId = arg('--heichel') || 'ikar';
	if (cmd === 'start') {
		const postsPath = arg('--posts');
		const uploadId = arg('--upload-id');
		const dryRun = process.argv.includes('--dry-run');
		const fields = { heichelId, dryRun, op: 'posts/start' };
		if (uploadId) {
			fields.uploadId = uploadId;
		} else if (postsPath) {
			fields.posts = JSON.parse(readFileSync(postsPath, 'utf8'));
			if (!Array.isArray(fields.posts)) throw new Error('--posts file must contain a JSON array');
		} else {
			throw new Error('start needs --posts <file> or --upload-id <id>');
		}
		const out = await signedRequest('/packed/import/posts/start', 'posts/start', fields);
		console.log(JSON.stringify(out, null, 2));
	} else if (cmd === 'status') {
		const job = arg('--job');
		if (!job) throw new Error('status needs --job <id>');
		console.log(JSON.stringify(await signedRequest('/packed/import/posts/status', 'posts/status', { heichelId, job }), null, 2));
	} else if (cmd === 'jobs') {
		console.log(JSON.stringify(await signedRequest('/packed/import/posts/jobs', 'posts/jobs', { heichelId }), null, 2));
	} else if (cmd === 'cancel') {
		const job = arg('--job');
		if (!job) throw new Error('cancel needs --job <id>');
		console.log(JSON.stringify(await signedRequest('/packed/import/posts/cancel', 'posts/cancel', { heichelId, job }), null, 2));
	} else {
		console.error('usage: vmImportSigned.mjs <start|status|jobs|cancel> [options]');
		process.exit(1);
	}
}

main().catch(e => { console.error('B"H error:', e.message); process.exit(1); });
