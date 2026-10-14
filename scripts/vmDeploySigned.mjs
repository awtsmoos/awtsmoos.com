#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VM-direct signed deploy to Awtsmoos.com production over HTTPS.
 * @description
 * Pushes files from the VM working tree straight to production — no Mac,
 * no GitHub, no SSH, no shared secrets. Each request is authenticated with
 * an Ed25519 signature from the VM-only private key
 * (~/.awtsmoos/secure/deploy-signing-key, chmod 600); production verifies
 * against the public key baked into geelooy/api/social/helper/routes/packed/deploySign.js.
 *
 * Usage:
 *   node scripts/vmDeploySigned.mjs [--message "desc"] <file1> [file2 ...]
 *   node scripts/vmDeploySigned.mjs --status    # check the API is live
 *   node scripts/vmDeploySigned.mjs --restart   # signed service restart
 *   node scripts/vmDeploySigned.mjs --diff [--message "desc"]  # deploy git-modified files
 *
 * Files are repo-relative (e.g. geelooy/heichelos/post/_awtsmoos.post.html).
 * Env:
 *   AWTSMOOS_SIGNING_KEY_FILE — private key path (default ~/.awtsmoos/secure/deploy-signing-key)
 *   AWTSMOOS_DEPLOY_API       — API base (default https://awtsmoos.com/api/social)
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { execSync, execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import deploySign from '../geelooy/api/social/helper/routes/packed/deploySign.js';

const API_BASE = process.env.AWTSMOOS_DEPLOY_API || 'https://awtsmoos.com/api/social';
const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const KEY_FILE = process.env.AWTSMOOS_SIGNING_KEY_FILE || join(homedir(), '.awtsmoos', 'secure', 'deploy-signing-key');

function loadPrivateKey() {
	if (!existsSync(KEY_FILE)) {
		console.error(`B"H signing key not found: ${KEY_FILE}`);
		process.exit(1);
	}
	return readFileSync(KEY_FILE, 'utf8');
}

/** POST a signed body { ts, message, files, sig } — never sends any secret. */
async function signedPost(route, { message, files }) {
	const ts = Math.floor(Date.now() / 1000);
	const body = { ts, message: String(message || '').slice(0, 500), files: files || [] };
	const sig = deploySign.signPayload(loadPrivateKey(), body);
	const res = await fetch(`${API_BASE}${route}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ ...body, sig }),
	});
	return res.json().catch(() => ({ success: false, error: 'BAD_RESPONSE', http: res.status }));
}

function collectFiles(args) {
	let files = args.filter(a => !a.startsWith('--'));
	const msgIdx = args.indexOf('--message');
	const message = msgIdx >= 0 && args[msgIdx + 1] ? args[msgIdx + 1] : 'B"H VM signed deploy';

	if (args.includes('--diff')) {
		const out = execSync('git status --porcelain', { cwd: REPO, encoding: 'utf8' });
		files = out.split('\n')
			.map(l => l.trim())
			.filter(l => l && !l.startsWith('??'))
			.map(l => l.slice(3).trim())
			.filter(Boolean);
		const untracked = out.split('\n')
			.map(l => l.trim())
			.filter(l => l.startsWith('??'))
			.map(l => l.slice(3).trim())
			.filter(Boolean);
		files = [...files, ...untracked];
	}

	const payload = [];
	for (const f of files) {
		const abs = resolve(REPO, f);
		const rel = relative(REPO, abs);
		if (rel.startsWith('..') || !rel) {
			console.error(`Skipping (outside repo): ${f}`);
			continue;
		}
		let buf;
		try {
			buf = readFileSync(abs);
		} catch (e) {
			console.error(`Skipping (unreadable): ${f}: ${e.message}`);
			continue;
		}
		payload.push({ path: rel.replace(/\\/g, '/'), content: buf.toString('base64') });
	}
	return { message, payload };
}

async function main() {
	const args = process.argv.slice(2);

	if (args.includes('--status')) {
		const res = await fetch(`${API_BASE}/packed/deploy/status`);
		console.log(JSON.stringify(await res.json(), null, 2));
		return;
	}

	if (args.includes('--restart')) {
		console.log('B"H sending signed restart...');
		const data = await signedPost('/packed/deploy/restart', { message: 'B"H signed service restart', files: [] });
		console.log(JSON.stringify(data, null, 2));
		if (!data.success) process.exit(1);
		return;
	}

	const { message, payload } = collectFiles(args);
	if (!payload.length) {
		console.error('Usage: node scripts/vmDeploySigned.mjs [--message "desc"] <file1> [file2 ...]');
		console.error('   or: node scripts/vmDeploySigned.mjs --diff [--message "desc"]');
		process.exit(1);
	}

	// B"H (2026-10-14, Yaakov's law): Deploy EXACTLY what is asked. No auto-add,
	// no magic. When explicit files are given (not --diff mode), skip all
	// cache-busting and auto-add logic. The deploy system must be simple and
	// reliable, not clever and broken.
	const isDiffMode = args.includes('--diff');
	if (!args.includes('--no-bust') && isDiffMode) {
		const touchesAssets = payload.some(f =>
			f.path.endsWith('.css') || f.path.endsWith('.js') || f.path.endsWith('.html')
		);
		if (touchesAssets) {
			console.log('B"H busting all caches (content-hash versions)...');
			try {
				execFileSync('node', [join(REPO, 'scripts', 'bustAllCaches.mjs'), '--write'], { cwd: REPO, stdio: 'inherit' });
				// B"H (2026-10-13): Drive images are served immutable/1-year.
				// bustAllCaches.mjs skips them — bustDriveCaches.mjs versions
				// every Drive URL from its live ETag content hash.
				console.log('B"H busting Drive image caches (ETag content hashes)...');
				execFileSync('node', [join(REPO, 'scripts', 'bustDriveCaches.mjs'), '--write'], { cwd: REPO, stdio: 'inherit' });
				// Re-read any payload files that the bust just modified
				for (const f of payload) {
					try {
						const abs = resolve(REPO, f.path);
						f.content = readFileSync(abs).toString('base64');
					} catch { /* file deleted? keep old */ }
				}
				// If bust touched any HTML files not already in payload, add them.
				// B"H 2026-10-13: fixed path parsing — the old
				// `.trim().slice(3)` ate the first path character for
				// worktree-modified files (trim removed the X status char,
				// shifting the XY prefix), silently deploying nothing.
				// Slice the 3-char "XY " prefix FIRST, then trim.
				// B"H 2026-10-13: only auto-add BUST-ONLY files — every
				// changed line must be a ?v= hash rewrite. Never sweep a
				// sibling's WIP into production on the back of a bust.
				const bustTouched = execSync('git status --porcelain', { cwd: REPO, encoding: 'utf8' })
					.split('\n')
					.map(l => {
						let p = l.slice(3);
						const arrow = p.indexOf(' -> ');
						if (arrow !== -1) p = p.slice(arrow + 4);
						p = p.trim();
						if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
						return p;
					})
					.filter(l => l.endsWith('.html') && !payload.some(f => f.path === l))
					.filter(l => {
						try {
							const d = execSync(`git diff HEAD -- ${JSON.stringify(l)}`, { cwd: REPO, encoding: 'utf8' });
							const changed = d.split('\n').filter(x => (x.startsWith('+') || x.startsWith('-')) && !x.startsWith('+++') && !x.startsWith('---'));
							return changed.length > 0 && changed.every(x => x.includes('?v='));
						} catch { return false; }
					});
				for (const extra of bustTouched) {
					try {
						const abs = resolve(REPO, extra);
						payload.push({ path: extra, content: readFileSync(abs).toString('base64') });
						console.log(`B"H auto-adding busted HTML: ${extra}`);
					} catch { /* skip */ }
				}
			} catch (e) {
				console.error(`B"H cache bust failed (continuing anyway): ${e.message}`);
			}
		}
	}

	console.log(`B"H pushing ${payload.length} file(s) to production (Ed25519-signed)...`);
	// B"H (2026-10-14, Yaakov's law): Deploy EXACTLY what is asked. No auto-add,
	// no magic. The version.json auto-stamp only runs in --diff mode, not when
	// explicit files are given. The deploy system must be simple and reliable.
	if (args.includes('--diff')) {
	try {
		const sha = execSync('git rev-parse --short HEAD', { cwd: REPO, encoding: 'utf8' }).trim();
		const buildId = `${sha}-${Date.now().toString(36)}`;
		const vPath = join(REPO, 'geelooy', 'version.json');
		const vContent = JSON.stringify({ build: buildId, time: new Date().toISOString() }) + '\n';
		writeFileSync(vPath, vContent);
		const vB64 = Buffer.from(vContent).toString('base64');
		const existing = payload.find(f => f.path === 'geelooy/version.json');
		if (existing) existing.content = vB64;
		else payload.push({ path: 'geelooy/version.json', content: vB64 });
		console.log(`B"H build version stamped: ${buildId}`);
	} catch (e) {
		console.error(`B"H version stamp failed (continuing anyway): ${e.message}`);
	}
	} // B"H 2026-10-14: close if (args.includes('--diff'))
	// B"H 2026-10-13 (Yaakov: deploys must feel instant, never "little bits"):
	// the API caps at 50 files per push. Split larger payloads into
	// sequential 50-file chunks inside this one command — one invocation,
	// no manual batching. The version stamp above already covered the whole
	// payload, so every chunk carries the same build id.
	const CHUNK = 50;
	const chunks = [];
	for (let i = 0; i < payload.length; i += CHUNK) chunks.push(payload.slice(i, i + CHUNK));
	if (chunks.length > 1) console.log(`B"H payload has ${payload.length} files — pushing in ${chunks.length} chunks of up to ${CHUNK}...`);
	let totalWritten = 0;
	let chunkIdx = 0;
	for (const files of chunks) {
		chunkIdx++;
		if (chunks.length > 1) console.log(`B"H pushing chunk ${chunkIdx}/${chunks.length} (${files.length} files)...`);
		// Retry loop: 502/503/504 (nginx/upstream blips) are retryable with
		// exponential backoff. Anything else fails fast.
		// B"H 2026-10-13: IMPORT_IN_PROGRESS is gone — the server no longer
		// blocks deploys during imports (Yaakov's absolute law: imports never
		// block anything). The retry entry is kept as a no-op guard in case an
		// old server version is ever hit, but it should never trigger.
		let data = null;
		for (let attempt = 0; attempt < 8; attempt++) {
			data = await signedPost('/packed/deploy/push', { message, files });
			const retryable = !data.success && (
				data.error === 'IMPORT_IN_PROGRESS' || // legacy; server no longer sends this
				(data.error === 'BAD_RESPONSE' && [502, 503, 504].includes(data.http))
			);
			if (!retryable) break;
			const waitMs = Math.min(15000 * Math.pow(2, attempt), 120000);
			console.log(`B"H deploy ${data.error} — retrying in ${Math.round(waitMs / 1000)}s (attempt ${attempt + 2}/8)...`);
			await new Promise(r => setTimeout(r, waitMs));
		}
		console.log(JSON.stringify(data, null, 2));
		if (!data.success) process.exit(1);
		totalWritten += data.written || 0;
	}
	console.log(`\nB"H deployed ${totalWritten} file(s) to production.`);
}

main().catch(e => {
	console.error('B"H vmDeploySigned failed:', e.message);
	process.exit(1);
});
