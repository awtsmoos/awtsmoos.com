// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Secure storage for the Awtsmoos.com deploy API key on the VM.
 * @description
 * The deploy key authenticates VM -> production pushes over HTTPS.
 * Stored encrypted outside git via the in-repo Awtsmoos PasswordBox
 * (same vessel as the SSH agent box), chmod 600.
 *
 * Env overrides:
 *   AWTSMOOS_DEPLOY_KEY            — use directly, skip storage (CI/testing)
 *   AWTSMOOS_DEPLOY_KEY_ROOT       — storage root (default ~/.awtsmoos/secure/deploy)
 *   AWTSMOOS_DEPLOY_KEY_FILE       — key file path
 *   AWTSMOOS_DEPLOY_KEY_BOX_FILE   — encrypted box path
 */

import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const PasswordBox = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/utils/crypto/passwordBox.js');

const ROOT = process.env.AWTSMOOS_DEPLOY_KEY_ROOT || join(homedir(), '.awtsmoos', 'secure', 'deploy');
const KEY_FILE = process.env.AWTSMOOS_DEPLOY_KEY_FILE || join(ROOT, 'device.key');
const BOX_FILE = process.env.AWTSMOOS_DEPLOY_KEY_BOX_FILE || join(ROOT, 'deploy-key.box.json');

export function descriptor() {
	return { backend: 'awtsmoos-deploy-box', root: ROOT, keyFile: KEY_FILE, boxFile: BOX_FILE, encrypted: true, outsideGit: true };
}

export function loadDeployKey() {
	if (process.env.AWTSMOOS_DEPLOY_KEY) return process.env.AWTSMOOS_DEPLOY_KEY;
	if (!existsSync(BOX_FILE) || !existsSync(KEY_FILE)) return '';
	try {
		const key = readFileSync(KEY_FILE, 'utf8').trim();
		const envelope = JSON.parse(readFileSync(BOX_FILE, 'utf8'));
		return String(PasswordBox.open(envelope, key)?.key || '');
	} catch {
		return '';
	}
}

export function saveDeployKey(key) {
	const clean = String(key || '').trim();
	if (!clean) throw new Error('missing_deploy_key');
	mkdirSync(ROOT, { recursive: true });
	try { chmodSync(ROOT, 0o700); } catch {}
	let deviceKey;
	if (existsSync(KEY_FILE)) {
		deviceKey = readFileSync(KEY_FILE, 'utf8').trim();
	} else {
		deviceKey = crypto.randomBytes(32).toString('base64url');
		writeFileSync(KEY_FILE, deviceKey + '\n', 'utf8');
		try { chmodSync(KEY_FILE, 0o600); } catch {}
	}
	const envelope = PasswordBox.seal({ key: clean, savedAt: new Date().toISOString() }, deviceKey);
	writeFileSync(BOX_FILE, JSON.stringify(envelope, null, 2) + '\n', 'utf8');
	try { chmodSync(BOX_FILE, 0o600); } catch {}
	return { ok: true, ...descriptor() };
}

export function forgetDeployKey() {
	if (existsSync(BOX_FILE)) rmSync(BOX_FILE, { force: true });
	return { ok: true, ...descriptor(), deleted: true };
}
