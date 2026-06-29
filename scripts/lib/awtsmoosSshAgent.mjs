// B"H
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const PasswordBox = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/utils/crypto/passwordBox.js');
const ROOT = process.env.AWTSMOOS_SSH_AGENT_ROOT || join(homedir(), '.awtsmoos', 'secure', 'ssh-agent');
const KEY_FILE = process.env.AWTSMOOS_SSH_AGENT_KEY_FILE || join(ROOT, 'device.key');
const BOX_FILE = process.env.AWTSMOOS_SSH_AGENT_BOX_FILE || join(ROOT, 'bh-password.box.json');

/**
 * B"H
 * The Android fallback: a tiny Awtsmoos SSH agent box. It uses the in-repo
 * ayzarim PasswordBox vessel and keeps both key and ciphertext outside git with
 * chmod 600. It exists because Termux often has no DPAPI, Keychain, or
 * libsecret, while `npm run bh` still needs to load the password later.
 */
export function descriptor() {
  return { backend: 'awtsmoos-agent-box', root: ROOT, keyFile: KEY_FILE, boxFile: BOX_FILE, encrypted: true, outsideGit: true };
}

export function save(password) {
  const clean = String(password || '');
  if (!clean) throw new Error('missing_password');
  ensureRoot();
  const key = loadOrCreateKey();
  const envelope = PasswordBox.seal({ password: clean, savedAt: new Date().toISOString() }, key);
  writeFileSync(BOX_FILE, JSON.stringify(envelope, null, 2) + '\n', 'utf8');
  safeChmod(BOX_FILE, 0o600);
  return { ok: true, ...descriptor() };
}

export function load() {
  if (!existsSync(BOX_FILE) || !existsSync(KEY_FILE)) return '';
  try {
    const key = readFileSync(KEY_FILE, 'utf8').trim();
    const envelope = JSON.parse(readFileSync(BOX_FILE, 'utf8'));
    return String(PasswordBox.open(envelope, key)?.password || '');
  } catch {
    return '';
  }
}

export function forget() {
  if (existsSync(BOX_FILE)) rmSync(BOX_FILE, { force: true });
  return { ok: true, ...descriptor(), deleted: true };
}

function ensureRoot() {
  mkdirSync(ROOT, { recursive: true });
  safeChmod(ROOT, 0o700);
}

function loadOrCreateKey() {
  ensureRoot();
  if (existsSync(KEY_FILE)) return readFileSync(KEY_FILE, 'utf8').trim();
  const key = crypto.randomBytes(32).toString('base64url');
  writeFileSync(KEY_FILE, key + '\n', 'utf8');
  safeChmod(KEY_FILE, 0o600);
  return key;
}

function safeChmod(file, mode) { try { chmodSync(file, mode); } catch {} }
