#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VM-direct deploy to Awtsmoos.com production over HTTPS.
 * @description
 * Pushes files from the VM working tree straight to production —
 * no Mac, no GitHub, no SSH. Authenticates with the deploy key
 * stored via scripts/lib/deployKeyStore.mjs.
 *
 * Usage:
 *   node scripts/vmDeploy.mjs [--message "desc"] <file1> [file2 ...]
 *   node scripts/vmDeploy.mjs --set-key          # store the deploy key securely
 *   node scripts/vmDeploy.mjs --forget-key       # remove the stored key
 *   node scripts/vmDeploy.mjs --status           # check the API is live
 *   node scripts/vmDeploy.mjs --diff             # deploy all git-modified files
 *
 * Files are repo-relative (e.g. geelooy/heichelos/post/_awtsmoos.post.html).
 * Env:
 *   AWTSMOOS_DEPLOY_KEY   — deploy key (skips secure storage)
 *   AWTSMOOS_DEPLOY_API   — API base (default https://awtsmoos.com/api/social)
 */

import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { loadDeployKey, saveDeployKey, forgetDeployKey, descriptor } from './lib/deployKeyStore.mjs';

const API_BASE = process.env.AWTSMOOS_DEPLOY_API || 'https://awtsmoos.com/api/social';
const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

async function promptSecret(label) {
	const rl = createInterface({ input, output });
	const wasRaw = input.isTTY && input.isRaw;
	if (input.isTTY) input.setRawMode(true);
	let value = '';
	output.write(label);
	await new Promise(resolvePromise => {
		const onData = char => {
			const v = String(char);
			if (v === '\u0003') process.exit(130);
			if (v === '\r' || v === '\n') {
				input.off('data', onData);
				output.write('\n');
				resolvePromise();
				return;
			}
			if (v === '\b' || v === '\u007f') value = value.slice(0, -1);
			else value += v;
		};
		input.on('data', onData);
	});
	if (input.isTTY) input.setRawMode(wasRaw || false);
	rl.close();
	return value;
}

async function main() {
	const args = process.argv.slice(2);

	if (args.includes('--set-key')) {
		const key = await promptSecret('Deploy key to save securely: ');
		const saved = saveDeployKey(key);
		console.log(JSON.stringify({ ok: true, saved: saved.boxFile }, null, 2));
		return;
	}
	if (args.includes('--forget-key')) {
		console.log(JSON.stringify(forgetDeployKey(), null, 2));
		return;
	}
	if (args.includes('--status')) {
		const res = await fetch(`${API_BASE}/packed/deploy/status`);
		console.log(JSON.stringify(await res.json(), null, 2));
		return;
	}

	const key = loadDeployKey();
	if (!key) {
		console.error('B"H deploy key not found. Run: node scripts/vmDeploy.mjs --set-key');
		console.error(`Storage: ${JSON.stringify(descriptor())}`);
		process.exit(1);
	}

	// Collect files.
	let files = args.filter(a => !a.startsWith('--'));
	const msgIdx = args.indexOf('--message');
	const message = msgIdx >= 0 && args[msgIdx + 1] ? args[msgIdx + 1] : 'B"H VM deploy';

	if (args.includes('--diff')) {
		const out = execSync('git status --porcelain', { cwd: REPO, encoding: 'utf8' });
		files = out.split('\n')
			.map(l => l.trim())
			.filter(l => l && !l.startsWith('??'))
			.map(l => l.slice(3).trim())
			.filter(Boolean);
		// Also include untracked files under allowed roots.
		const untracked = out.split('\n')
			.map(l => l.trim())
			.filter(l => l.startsWith('??'))
			.map(l => l.slice(3).trim())
			.filter(Boolean);
		files = [...files, ...untracked];
	}

	if (!files.length) {
		console.error('Usage: node scripts/vmDeploy.mjs [--message "desc"] <file1> [file2 ...]');
		console.error('   or: node scripts/vmDeploy.mjs --diff [--message "desc"]');
		process.exit(1);
	}

	// Read and encode.
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

	if (!payload.length) {
		console.error('No readable files to deploy.');
		process.exit(1);
	}

	console.log(`B"H pushing ${payload.length} file(s) to production...`);
	const res = await fetch(`${API_BASE}/packed/deploy/push`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ operatorKey: key, message, files: payload }),
	});
	const data = await res.json().catch(() => ({ success: false, error: 'BAD_RESPONSE', http: res.status }));
	console.log(JSON.stringify(data, null, 2));
	if (!data.success) process.exit(1);
	console.log(`\nB"H deployed ${data.written} file(s) to production.`);
}

main().catch(e => {
	console.error('B"H vmDeploy failed:', e.message);
	process.exit(1);
});
