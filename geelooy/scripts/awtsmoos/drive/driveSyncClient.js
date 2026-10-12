//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file driveSyncClient.js
 * @description Permanent, hardened Google Drive sync client.
 *
 * The Awtsmoos keeps what it gathers: every Drive call in this module runs
 * through one guarded gate — auth health is proven before any work, transient
 * failures retry with backoff instead of crashing, downloads are
 * checksum-verified against Drive metadata, and everything lands in a
 * permanent manifest-tracked mirror that this client NEVER deletes from.
 *
 * Why this exists: raw `hatch_gws_cli` calls are brittle. Its OAuth session is
 * managed outside this repo and expires on its own schedule; ad-hoc scripts
 * crash on the first auth hiccup with an inscrutable JSON parse error, never
 * retry a 429/5xx, and stage downloads in /tmp with no record of what
 * arrived — so interruptions silently lose files and nobody can prove what
 * is missing. This client fixes the operational layer permanently:
 *
 *   1. ensureConnected() — proves auth health first; a dead session raises a
 *      clear DriveAuthError carrying the reconnect URL instead of a traceback.
 *   2. Classified retries — 429 / 5xx / rate-limit / timeout / truncated
 *      output retry with exponential backoff + jitter; auth errors never
 *      retry; fatal errors (400/404) fail fast with the real reason.
 *   3. Verified downloads — size and md5Checksum checked against Drive
 *      metadata; mismatch retries instead of landing corrupt.
 *   4. Permanent mirror — files land under a chosen mirror root (never /tmp)
 *      with an atomic JSON manifest; verifyMirror() re-proves every file.
 *   5. Never deletes — this module exposes no delete, no trash, no cleanup.
 *      The mirror only grows.
 *
 * Usage as a library:
 *   const { createDriveSync } = require('./driveSyncClient.js');
 *   const drive = createDriveSync({ mirrorRoot: '/home/hatch/workspace/drive-corpus-2026-10-12' });
 *   await drive.ensureConnected();
 *   const inv = await drive.walkInventory('1qKm_kijAJUUqRSkLXIRHpI4WhDebJSm_');
 *   await drive.downloadAll(inv.files);
 *   const report = await drive.verifyMirror();
 *
 * Usage as a CLI:
 *   node driveSyncClient.js status
 *   node driveSyncClient.js inventory --folder <id> --out <manifest.json>
 *   node driveSyncClient.js download --folder <id> --mirror <dir>
 *   node driveSyncClient.js verify --mirror <dir>
 */

'use strict';

const { execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CLI = process.env.HATCH_GWS_CLI || 'hatch_gws_cli';
const DEFAULT_TIMEOUT_MS = 120000;
const DEFAULT_RETRIES = 5;
const BASE_BACKOFF_MS = 1500;
const MAX_BACKOFF_MS = 30000;
const PAGE_SIZE = 1000;
const MANIFEST_NAME = 'drive-mirror-manifest.json';

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

class DriveSyncError extends Error {
	constructor(message, { code = 'DRIVE_SYNC_ERROR', retryable = false, detail = null } = {}) {
		super(message);
		this.name = 'DriveSyncError';
		this.code = code;
		this.retryable = retryable;
		this.detail = detail;
	}
}

/** Auth is dead or missing. Never retried: only a fresh user consent fixes it. */
class DriveAuthError extends DriveSyncError {
	constructor(message, connectUrl = null) {
		super(message, { code: 'DRIVE_AUTH', retryable: false });
		this.name = 'DriveAuthError';
		this.connectUrl = connectUrl;
	}
}

/** The request itself is wrong (bad id, bad params). Never retried. */
class DriveFatalError extends DriveSyncError {
	constructor(message, detail = null) {
		super(message, { code: 'DRIVE_FATAL', retryable: false, detail });
		this.name = 'DriveFatalError';
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function backoffMs(attempt) {
	const exp = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** attempt);
	return Math.floor(exp * (0.5 + Math.random() * 0.5)); // jitter
}

/* ------------------------------------------------------------------ */
/* Raw CLI execution with classification                               */
/* ------------------------------------------------------------------ */

function runCliRaw(args, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
	try {
		const stdout = execFileSync(CLI, args, {
			encoding: 'utf8',
			timeout: timeoutMs,
			maxBuffer: 256 * 1024 * 1024,
			stdio: ['ignore', 'pipe', 'pipe']
		});
		return { ok: true, stdout, stderr: '' };
	} catch (err) {
		return {
			ok: false,
			stdout: err.stdout ? String(err.stdout) : '',
			stderr: err.stderr ? String(err.stderr) : '',
			timedOut: err.code === 'ETIMEDOUT',
			exitCode: err.status
		};
	}
}

function tryParseJson(text) {
	if (!text || !text.trim()) return { parsed: false };
	try {
		return { parsed: true, value: JSON.parse(text) };
	} catch {
		return { parsed: false };
	}
}

const AUTH_PATTERNS = [
	/not_connected/i, /not connected/i, /invalid_grant/i, /invalid grant/i,
	/token expired/i, /token has expired/i, /unauthorized/i, /\b401\b/,
	/needs? (re)?connect/i, /consent/i
];
const TRANSIENT_PATTERNS = [
	/rate ?limit/i, /userRateLimitExceeded/i, /rateLimitExceeded/i, /\b429\b/,
	/\b5\d\d\b/, /temporarily unavailable/i, /backend error/i, /timed out/i,
	/timeout/i, /ECONNRESET/i, /ENOTFOUND/i, /EAI_AGAIN/i, /socket hang up/i
];

function classifyFailure(raw, parsedBody) {
	const haystack = `${raw.stderr}\n${raw.stdout}`;
	const bodyText = parsedBody && parsedBody.parsed ? JSON.stringify(parsedBody.value) : '';
	const all = `${haystack}\n${bodyText}`;
	if (AUTH_PATTERNS.some(p => p.test(all))) return 'auth';
	if (raw.timedOut) return 'transient';
	if (TRANSIENT_PATTERNS.some(p => p.test(all))) return 'transient';
	// Google API error envelope
	const err = parsedBody && parsedBody.parsed && parsedBody.value && parsedBody.value.error;
	if (err) {
		const code = Number(err.code);
		if (code === 401 || code === 403 && /auth|credential|consent|grant/i.test(JSON.stringify(err))) return 'auth';
		if (code === 408 || code === 429 || (code >= 500 && code <= 599)) return 'transient';
		return 'fatal';
	}
	if (!parsedBody.parsed && raw.ok) return 'transient'; // truncated/unparseable output: retry
	return 'fatal';
}

/* ------------------------------------------------------------------ */
/* Client                                                              */
/* ------------------------------------------------------------------ */

function createDriveSync({ mirrorRoot = null, timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES } = {}) {
	const state = { statusCache: null };

	function status() {
		const raw = runCliRaw(['drive', 'status'], { timeoutMs: 30000 });
		const parsed = tryParseJson(raw.stdout);
		if (!parsed.parsed) {
			throw new DriveSyncError(
				'Drive status check returned unreadable output; the Drive CLI may be broken.',
				{ code: 'DRIVE_STATUS_UNREADABLE', retryable: true, detail: raw.stderr.slice(0, 500) }
			);
		}
		state.statusCache = parsed.value;
		return parsed.value;
	}

	function isConnected(statusValue = null) {
		const s = statusValue || state.statusCache || status();
		return !!(s && (s.status === 'connected' || s.ok === true && s.status !== 'not_connected'));
	}

	function ensureConnected() {
		const s = status();
		if (!isConnected(s)) {
			throw new DriveAuthError(
				'Google Drive is not connected. Reconnect through the provided link, then retry.',
				s.connect_url || s.connectUrl || null
			);
		}
		return s;
	}

	async function call(resource, method, params = {}, { retries: r = retries, timeoutMs: t = timeoutMs } = {}) {
		ensureConnected();
		const args = ['drive', resource, method, '--params', JSON.stringify(params)];
		let lastError = null;
		for (let attempt = 0; attempt <= r; attempt++) {
			const raw = runCliRaw(args, { timeoutMs: t });
			const parsed = tryParseJson(raw.stdout);
			if (raw.ok && parsed.parsed && !(parsed.value && parsed.value.error)) {
				return parsed.value;
			}
			const kind = classifyFailure(raw, parsed);
			if (kind === 'auth') {
				// Re-probe: maybe the session died mid-run.
				let connectUrl = null;
				try { connectUrl = status().connect_url || null; } catch { /* keep null */ }
				throw new DriveAuthError(
					'Google Drive authorization failed mid-run. Reconnect through the provided link, then retry.',
					connectUrl
				);
			}
			if (kind === 'fatal' || attempt === r) {
				const detail = (parsed.parsed ? JSON.stringify(parsed.value).slice(0, 800) : raw.stderr.slice(0, 800)) || 'no detail';
				lastError = new DriveFatalError(
					`Drive call drive.${resource}.${method} failed permanently: ${detail}`,
					detail
				);
				break;
			}
			lastError = new DriveSyncError(
				`Drive call drive.${resource}.${method} hit a transient failure (attempt ${attempt + 1}/${r + 1}); backing off.`,
				{ code: 'DRIVE_TRANSIENT', retryable: true }
			);
			await sleep(backoffMs(attempt));
		}
		throw lastError;
	}

	async function listChildren(folderId, { pageSize = PAGE_SIZE } = {}) {
		const items = [];
		let pageToken = null;
		for (;;) {
			const params = {
				q: `'${folderId}' in parents and trashed=false`,
				pageSize,
				fields: 'nextPageToken,files(id,name,mimeType,size,md5Checksum,modifiedTime,parents)'
			};
			if (pageToken) params.pageToken = pageToken;
			const res = await call('files', 'list', params);
			for (const f of res.files || []) items.push(f);
			pageToken = res.nextPageToken;
			if (!pageToken) break;
		}
		return items;
	}

	async function walkInventory(folderId) {
		const files = [];
		const folders = [];
		const errors = [];
		async function walk(id, relPath) {
			let children;
			try {
				children = await listChildren(id);
			} catch (err) {
				errors.push({ folderId: id, relPath, error: String(err && err.message || err) });
				return;
			}
			for (const f of children) {
				const name = f.name || f.id;
				if (f.mimeType === 'application/vnd.google-apps.folder') {
					const childRel = relPath ? `${relPath}/${name}` : name;
					folders.push({ id: f.id, name, relPath: childRel, modifiedTime: f.modifiedTime || null });
					await walk(f.id, childRel);
				} else {
					files.push({
						id: f.id,
						name,
						relPath: relPath ? `${relPath}/${name}` : name,
						mimeType: f.mimeType || 'application/octet-stream',
						size: Number(f.size || 0),
						md5: f.md5Checksum || null,
						modifiedTime: f.modifiedTime || null
					});
				}
			}
		}
		await walk(folderId, '');
		return { folderId, files, folders, errors, walkedAt: new Date().toISOString() };
	}

	function manifestPath() {
		if (!mirrorRoot) throw new DriveSyncError('mirrorRoot is required for manifest operations.', { code: 'NO_MIRROR' });
		return path.join(mirrorRoot, MANIFEST_NAME);
	}

	function readManifest() {
		const p = manifestPath();
		if (!fs.existsSync(p)) return { version: 1, files: {} };
		return JSON.parse(fs.readFileSync(p, 'utf8'));
	}

	function writeManifestAtomic(manifest) {
		const p = manifestPath();
		fs.mkdirSync(path.dirname(p), { recursive: true });
		const tmp = `${p}.tmp-${process.pid}`;
		fs.writeFileSync(tmp, JSON.stringify(manifest, null, 1));
		fs.renameSync(tmp, p);
	}

	function safeRelPath(relPath) {
		const normalized = path.normalize(relPath);
		if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
			throw new DriveFatalError(`Refusing unsafe path from Drive listing: ${relPath}`);
		}
		return normalized;
	}

	function fileIsVerified(localPath, entry) {
		if (!fs.existsSync(localPath)) return false;
		const st = fs.statSync(localPath);
		if (entry.size && st.size !== entry.size) return false;
		if (entry.md5) {
			const hash = crypto.createHash('md5');
			hash.update(fs.readFileSync(localPath));
			if (hash.digest('hex') !== entry.md5) return false;
		}
		return true;
	}

	async function downloadOne(file, manifest) {
		if (!mirrorRoot) throw new DriveSyncError('mirrorRoot is required for downloads.', { code: 'NO_MIRROR' });
		const rel = safeRelPath(file.relPath);
		const dest = path.join(mirrorRoot, rel);
		const key = rel.split(path.sep).join('/');
		const existing = manifest.files[key];
		if (existing && existing.verified && fileIsVerified(dest, existing)) {
			return { status: 'already-verified', relPath: key };
		}
		fs.mkdirSync(path.dirname(dest), { recursive: true });
		const tmp = `${dest}.part-${process.pid}`;
		let lastError = null;
		for (let attempt = 0; attempt <= retries; attempt++) {
			ensureConnected();
			const raw = runCliRaw(
				['drive', 'files', 'get', '--params', JSON.stringify({ fileId: file.id, alt: 'media' }), '--output', tmp],
				{ timeoutMs: Math.max(timeoutMs, 300000) }
			);
			if (raw.ok && fs.existsSync(tmp)) {
				const st = fs.statSync(tmp);
				const sizeOk = !file.size || st.size === file.size;
				let md5Ok = true;
				let md5 = null;
				if (file.md5) {
					const hash = crypto.createHash('md5');
					hash.update(fs.readFileSync(tmp));
					md5 = hash.digest('hex');
					md5Ok = md5 === file.md5;
				}
				if (sizeOk && md5Ok) {
					fs.renameSync(tmp, dest);
					manifest.files[key] = {
						id: file.id,
						name: file.name,
						mimeType: file.mimeType,
						size: st.size,
						md5,
						driveModifiedTime: file.modifiedTime,
						downloadedAt: new Date().toISOString(),
						verified: true
					};
					writeManifestAtomic(manifest);
					return { status: 'downloaded', relPath: key, bytes: st.size };
				}
				lastError = new DriveSyncError(
					`Checksum/size mismatch for ${file.name} (attempt ${attempt + 1}); retrying.`,
					{ code: 'VERIFY_MISMATCH', retryable: true }
				);
			} else {
				const kind = classifyFailure(raw, tryParseJson(raw.stdout));
				if (kind === 'auth') {
					let connectUrl = null;
					try { connectUrl = status().connect_url || null; } catch { /* keep null */ }
					throw new DriveAuthError('Google Drive authorization failed during download. Reconnect, then retry.', connectUrl);
				}
				lastError = new DriveSyncError(
					`Download of ${file.name} failed transiently (attempt ${attempt + 1}); backing off.`,
					{ code: 'DOWNLOAD_TRANSIENT', retryable: true, detail: raw.stderr.slice(0, 300) }
				);
			}
			try { fs.unlinkSync(tmp); } catch { /* ignore */ }
			if (attempt < retries) await sleep(backoffMs(attempt));
		}
		throw lastError;
	}

	async function downloadAll(files, { onProgress = null } = {}) {
		const manifest = readManifest();
		const results = { downloaded: 0, alreadyVerified: 0, failed: [], bytes: 0 };
		let done = 0;
		for (const file of files) {
			done++;
			try {
				const r = await downloadOne(file, manifest);
				if (r.status === 'downloaded') { results.downloaded++; results.bytes += r.bytes || 0; }
				else results.alreadyVerified++;
			} catch (err) {
				if (err instanceof DriveAuthError) throw err; // stop everything: session is dead
				results.failed.push({ relPath: file.relPath, id: file.id, error: String(err && err.message || err) });
			}
			if (onProgress) onProgress({ done, total: files.length, results });
		}
		return results;
	}

	async function verifyMirror() {
		const manifest = readManifest();
		const report = { total: 0, verified: 0, missing: [], corrupt: [], checkedAt: new Date().toISOString() };
		for (const [key, entry] of Object.entries(manifest.files)) {
			report.total++;
			const localPath = path.join(mirrorRoot, ...key.split('/'));
			if (!fs.existsSync(localPath)) {
				report.missing.push(key);
				continue;
			}
			if (!fileIsVerified(localPath, entry)) {
				report.corrupt.push(key);
				continue;
			}
			report.verified++;
		}
		return report;
	}

	return {
		status, isConnected, ensureConnected, call,
		listChildren, walkInventory,
		downloadOne, downloadAll, verifyMirror,
		readManifest,
		DriveSyncError, DriveAuthError, DriveFatalError
	};
}

/* ------------------------------------------------------------------ */
/* CLI                                                                 */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
	const out = { _: [] };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a.startsWith('--')) {
			const key = a.slice(2);
			const next = argv[i + 1];
			if (next && !next.startsWith('--')) { out[key] = next; i++; }
			else out[key] = true;
		} else out._.push(a);
	}
	return out;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const cmd = args._[0];
	const drive = createDriveSync({ mirrorRoot: args.mirror || null });
	try {
		if (cmd === 'status') {
			const s = drive.status();
			console.log(JSON.stringify({ connected: drive.isConnected(s), status: s.status || null }));
		} else if (cmd === 'inventory') {
			if (!args.folder || !args.out) throw new Error('usage: inventory --folder <id> --out <manifest.json>');
			const inv = await drive.walkInventory(args.folder);
			fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
			fs.writeFileSync(args.out, JSON.stringify(inv, null, 1));
			const bytes = inv.files.reduce((n, f) => n + (f.size || 0), 0);
			console.log(JSON.stringify({ files: inv.files.length, folders: inv.folders.length, bytes, errors: inv.errors.length }));
		} else if (cmd === 'download') {
			if (!args.folder || !args.mirror) throw new Error('usage: download --folder <id> --mirror <dir>');
			const d2 = createDriveSync({ mirrorRoot: path.resolve(args.mirror) });
			const inv = await d2.walkInventory(args.folder);
			console.log(JSON.stringify({ files: inv.files.length, folders: inv.folders.length, walkErrors: inv.errors.length }));
			const res = await d2.downloadAll(inv.files, {
				onProgress: ({ done, total }) => {
					if (done % 25 === 0 || done === total) console.error(`progress ${done}/${total}`);
				}
			});
			console.log(JSON.stringify(res));
			if (res.failed.length > 0) process.exitCode = 2;
		} else if (cmd === 'verify') {
			if (!args.mirror) throw new Error('usage: verify --mirror <dir>');
			const d2 = createDriveSync({ mirrorRoot: path.resolve(args.mirror) });
			console.log(JSON.stringify(await d2.verifyMirror(), null, 1));
		} else {
			throw new Error('commands: status | inventory --folder <id> --out <f> | download --folder <id> --mirror <dir> | verify --mirror <dir>');
		}
	} catch (err) {
		if (err instanceof DriveAuthError) {
			console.error(`AUTH: ${err.message}`);
			if (err.connectUrl) console.error(`Reconnect: ${err.connectUrl}`);
		} else {
			console.error(`ERROR [${err.code || 'UNKNOWN'}]: ${err.message}`);
		}
		process.exitCode = 1;
	}
}

if (require.main === module) {
	main();
}

module.exports = { createDriveSync, DriveSyncError, DriveAuthError, DriveFatalError };
