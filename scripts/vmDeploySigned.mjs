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

import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { execSync } from 'node:child_process';
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

	console.log(`B"H pushing ${payload.length} file(s) to production (Ed25519-signed)...`);
	const data = await signedPost('/packed/deploy/push', { message, files: payload });
	console.log(JSON.stringify(data, null, 2));
	if (!data.success) process.exit(1);
	console.log(`\nB"H deployed ${data.written} file(s) to production.`);
}

main().catch(e => {
	console.error('B"H vmDeploySigned failed:', e.message);
	process.exit(1);
});
