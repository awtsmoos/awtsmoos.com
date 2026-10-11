#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VM client for the Hetzner tunnel (secure command channel ON production).
 * @description
 * Talks to /api/tunnel/hetzner/* on awtsmoos.com via Ed25519-signed HTTPS —
 * no SSH, no Mac, no tunnel agent needed on the VM side.
 *
 * Usage:
 *   node scripts/hetznerTunnel.mjs health
 *   node scripts/hetznerTunnel.mjs exec "systemctl --user status awtsmoos" [--timeout 60000] [--cwd /path]
 *   node scripts/hetznerTunnel.mjs readlog nginx-error [--lines 100]
 *
 * Env:
 *   AWTSMOOS_IMPORT_KEY_FILE — private key path (default ~/.awtsmoos/secure/import-signing-key)
 *   AWTSMOOS_IMPORT_API      — API base (default https://awtsmoos.com/api/social)
 *   (tunnel base is derived: https://awtsmoos.com/api/tunnel)
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const importSign = require('../geelooy/api/social/helper/routes/packed/importSign.js');

const API_BASE = (process.env.AWTSMOOS_IMPORT_API || 'https://awtsmoos.com/api/social').replace(/\/api\/social$/, '/api/tunnel');
const KEY_FILE = process.env.AWTSMOOS_IMPORT_KEY_FILE || join(homedir(), '.awtsmoos', 'secure', 'import-signing-key');

function loadPrivateKey() {
	if (!existsSync(KEY_FILE)) { console.error(`B"H signing key not found: ${KEY_FILE}`); process.exit(1); }
	return readFileSync(KEY_FILE, 'utf8');
}

function arg(name) {
	const i = process.argv.indexOf(name);
	return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
	const cmd = process.argv[2];
	const privKey = loadPrivateKey();

	if (cmd === 'health') {
		const res = await fetch(`${API_BASE}/hetzner/health`);
		console.log(JSON.stringify(await res.json(), null, 2));
		return;
	}

	const signedPost = async (route, op, fields, payloadHash) => {
		const ts = Math.floor(Date.now() / 1000);
		const sig = importSign.signPayload(privKey, { ts, op, heichelId: '', payloadHash });
		const res = await fetch(`${API_BASE}${route}`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ ts, sig, ...fields, payloadHash }),
		});
		return res.json().catch(() => ({ ok: false, error: 'BAD_RESPONSE', http: res.status }));
	};

	if (cmd === 'exec') {
		const command = process.argv[3];
		if (!command) { console.error('usage: hetznerTunnel.mjs exec "command" [--timeout ms] [--cwd dir]'); process.exit(1); }
		const cwd = arg('--cwd') || '';
		const timeoutMs = Number(arg('--timeout')) || 60000;
		const payloadHash = importSign.sha256hex(command + ':' + cwd);
		const out = await signedPost('/hetzner/exec', 'hetzner/exec', { command, cwd, timeoutMs }, payloadHash);
		if (!out.ok) { console.error('B"H exec failed:', JSON.stringify(out).slice(0, 500)); process.exit(1); }
		if (out.stdout) process.stdout.write(out.stdout);
		if (out.stderr) process.stderr.write(out.stderr);
		console.error(`\nB"H exit=${out.exitCode} timedOut=${out.timedOut} durationMs=${out.durationMs}`);
		process.exit(out.exitCode);
	}

	if (cmd === 'readlog') {
		const name = process.argv[3];
		if (!name) { console.error('usage: hetznerTunnel.mjs readlog <name> [--lines N]'); process.exit(1); }
		const lines = Number(arg('--lines')) || 100;
		const payloadHash = importSign.sha256hex(name + ':' + lines);
		const out = await signedPost('/hetzner/readlog', 'hetzner/readlog', { name, lines }, payloadHash);
		if (!out.ok) { console.error('B"H readlog failed:', JSON.stringify(out).slice(0, 500)); process.exit(1); }
		process.stdout.write(out.output || '');
		if (out.error) console.error('log error:', out.error);
		return;
	}

	console.error('usage: hetznerTunnel.mjs health | exec "cmd" | readlog <name>');
	process.exit(1);
}

main().catch(e => { console.error('B"H error:', e.message); process.exit(1); });
