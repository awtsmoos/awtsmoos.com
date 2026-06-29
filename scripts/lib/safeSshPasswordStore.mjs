// B"H
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import * as AgentBox from './awtsmoosSshAgent.mjs';

const SERVICE = process.env.AWTSMOOS_BH_SECRET_SERVICE || 'awtsmoos.com.bh.ssh.password';
const ACCOUNT = process.env.AWTSMOOS_BH_SECRET_ACCOUNT || 'root@awtsmoos.com';
const STORE_DIR = join(homedir(), '.awtsmoos', 'secure');
const DPAPI_FILE = process.env.AWTSMOOS_BH_SECRET_FILE || join(STORE_DIR, 'bh-ssh-password.dpapi.txt');

/**
 * B"H
 * The secret first seeks the native palace: Windows DPAPI, macOS Keychain, or
 * libsecret. On Android/Termux, where those palaces usually do not exist, it
 * falls back to the custom Awtsmoos SSH agent box built from ayzarim crypto.
 */
export function secretDescriptor() {
  if (forceAgent()) return AgentBox.descriptor();
  if (process.platform === 'win32') return { backend: 'windows-dpapi-file', path: DPAPI_FILE, account: ACCOUNT };
  if (process.platform === 'darwin') return { backend: 'macos-keychain', service: SERVICE, account: ACCOUNT };
  if (hasCommand('secret-tool')) return { backend: 'libsecret', service: SERVICE, account: ACCOUNT };
  return AgentBox.descriptor();
}

export function loadPassword() {
  if (process.env.AWTSMOOS_SSH_PASSWORD) return process.env.AWTSMOOS_SSH_PASSWORD;
  const descriptor = secretDescriptor();
  if (descriptor.backend === 'windows-dpapi-file') return loadWindowsDpapi();
  if (descriptor.backend === 'macos-keychain') return loadMacosKeychain();
  if (descriptor.backend === 'libsecret') return loadLibsecret();
  if (descriptor.backend === 'awtsmoos-agent-box') return AgentBox.load();
  return '';
}

export function savePassword(password) {
  const clean = String(password || '');
  if (!clean) throw new Error('missing_password');
  const descriptor = secretDescriptor();
  if (descriptor.backend === 'windows-dpapi-file') return saveWindowsDpapi(clean);
  if (descriptor.backend === 'macos-keychain') return saveMacosKeychain(clean);
  if (descriptor.backend === 'libsecret') return saveLibsecret(clean);
  if (descriptor.backend === 'awtsmoos-agent-box') return AgentBox.save(clean);
  throw new Error('no_secret_backend_available');
}

export function deletePassword() {
  const descriptor = secretDescriptor();
  if (descriptor.backend === 'windows-dpapi-file') {
    if (existsSync(DPAPI_FILE)) rmSync(DPAPI_FILE, { force: true });
    return { ok: true, backend: descriptor.backend, deleted: true, path: DPAPI_FILE };
  }
  if (descriptor.backend === 'macos-keychain') {
    spawnSync('security', ['delete-generic-password', '-s', SERVICE, '-a', ACCOUNT], { stdio: 'ignore' });
    return { ok: true, backend: descriptor.backend, deleted: true };
  }
  if (descriptor.backend === 'libsecret') {
    spawnSync('secret-tool', ['clear', 'service', SERVICE, 'account', ACCOUNT], { stdio: 'ignore' });
    return { ok: true, backend: descriptor.backend, deleted: true };
  }
  if (descriptor.backend === 'awtsmoos-agent-box') return AgentBox.forget();
  return { ok: true, backend: descriptor.backend, deleted: false };
}

function saveWindowsDpapi(password) {
  mkdirSync(dirname(DPAPI_FILE), { recursive: true });
  const script = '$p=[Console]::In.ReadToEnd(); ConvertTo-SecureString -String $p -AsPlainText -Force | ConvertFrom-SecureString';
  const run = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { input: password, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`windows_dpapi_save_failed: ${run.stderr || run.stdout}`);
  writeFileSync(DPAPI_FILE, run.stdout.trim() + '\n', 'utf8');
  try { chmodSync(DPAPI_FILE, 0o600); } catch {}
  return { ok: true, backend: 'windows-dpapi-file', path: DPAPI_FILE };
}

function loadWindowsDpapi() {
  if (!existsSync(DPAPI_FILE)) return '';
  const cipher = readFileSync(DPAPI_FILE, 'utf8').trim();
  if (!cipher) return '';
  const script = '$s=[Console]::In.ReadToEnd(); $sec=$s | ConvertTo-SecureString; $b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec); try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }';
  const run = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { input: cipher, encoding: 'utf8' });
  return run.status === 0 ? run.stdout.replace(/\r?\n$/, '') : '';
}

function saveMacosKeychain(password) {
  const run = spawnSync('security', ['add-generic-password', '-U', '-s', SERVICE, '-a', ACCOUNT, '-w', password], { encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`macos_keychain_save_failed: ${run.stderr || run.stdout}`);
  return { ok: true, backend: 'macos-keychain' };
}

function loadMacosKeychain() {
  const run = spawnSync('security', ['find-generic-password', '-s', SERVICE, '-a', ACCOUNT, '-w'], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.replace(/\r?\n$/, '') : '';
}

function saveLibsecret(password) {
  const run = spawnSync('secret-tool', ['store', '--label=Awtsmoos BH SSH', 'service', SERVICE, 'account', ACCOUNT], { input: password, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`libsecret_save_failed: ${run.stderr || run.stdout}`);
  return { ok: true, backend: 'libsecret' };
}

function loadLibsecret() {
  const run = spawnSync('secret-tool', ['lookup', 'service', SERVICE, 'account', ACCOUNT], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.replace(/\r?\n$/, '') : '';
}

function hasCommand(command) {
  const run = spawnSync(process.platform === 'win32' ? 'where' : 'command', process.platform === 'win32' ? [command] : ['-v', command], { shell: process.platform !== 'win32', stdio: 'ignore' });
  return run.status === 0;
}
function forceAgent() { return String(process.env.AWTSMOOS_BH_SECRET_BACKEND || '').toLowerCase() === 'awtsmoos-agent-box'; }
