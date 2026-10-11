// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedDeployRoutes
 * @description
 * VM-direct deploy API for Awtsmoos.com production.
 *
 * WHY THIS EXISTS: the VM cannot SSH to production (egress proxy blocks port 22)
 * and has no GitHub credentials. This API lets the VM push files directly to
 * production over HTTPS, authenticated by Ed25519 request signatures — no Mac,
 * no GitHub, no shared secrets.
 *
 * Routes (mounted under /api/social by the packed composer):
 *   POST /packed/deploy/push   — write files to the production working tree
 *   GET  /packed/deploy/status — check the API is live and configured
 *   POST /packed/deploy/restart — restart the production service (MAC-SEVERANCE)
 *
 * Push body (Ed25519 signature auth, MAC-SEVERANCE Phase 2):
 *   { ts: <unix seconds>, message: <string>, files: [...], sig: <base64> }
 *   sig = Ed25519(privateKey, canonical({v:1, ts, message, files})).
 *   |now - ts| must be <= 300s; exact replays inside the window are rejected.
 *   The old shared-secret operatorKey path is GONE — removed at cutover.
 *
 * Safety:
 * - Signature auth, fail-closed. Public key baked into deploySign.js:
 *   survives restarts, auditable in git. Private key lives only on the VM.
 * - Path traversal rejected: paths must resolve inside the repo working tree.
 * - Blocked paths: .git/, node_modules/, secrets, env files, anything outside allowlist roots.
 * - Per-file size cap (5 MB) and per-request file cap (50 files).
 * - Every push is logged to the deploy log.
 *
 * NOTE: files are written directly to the working tree. Server-side Node.js
 * changes require a service restart to take effect; HTML/CSS/client-JS and
 * templates are picked up on the next request without a restart.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { requireMethod, requestValue } = require('./requestValues.js');
const {
	DEPLOY_SIGN_PUBLIC_KEYS,
	verifySignature,
	checkTimestamp,
	checkReplay,
} = require('./deploySign.js');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MAX_FILE_BYTES = 5 * 1024 * 1024;      // 5 MB per file
const MAX_FILES_PER_PUSH = 50;               // 50 files per request

// Directories that may receive pushed files. Everything else is rejected.
// Keep this tight: the deploy API is for web-facing code, not secrets.
const ALLOWED_ROOTS = [
	'geelooy/heichelos/',
	'geelooy/api/',
	'geelooy/apps/',
	'geelooy/ohr-haganuz/',
	'geelooy/awtsmoos/',
	'geelooy/scripts/',
	'geelooy/sso/',
	'geelooy/profiles/',
	'geelooy/pulse/',
	'geelooy/onboarding/',
	'geelooy/mitzvahWorld/',
	'geelooy/mikvah/',
	'geelooy/kiddush/',
	'geelooy/home/',
	'geelooy/ikar/',
	'geelooy/derech/',
	'geelooy/components/',
	'geelooy/ai/',
	'scripts/',
	'ops/',
	'index.js',
	'index.html',
];

// Basename/path-segment blocklist (defense in depth).
const BLOCKED_SEGMENTS = new Set([
	'.git', 'node_modules', '.awtsmoos', '.ssh', '.gnupg',
	'.env', '.env.local', '.env.production',
]);

function deployLogPath() {
	const dir = process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'deploy-api.log');
}

function appendDeployLog(entry) {
	try {
		const dir = path.dirname(deployLogPath());
		fs.mkdirSync(dir, { recursive: true });
		fs.appendFileSync(deployLogPath(), JSON.stringify(entry) + '\n', 'utf8');
	} catch {}
}

/** Resolve the production repo working tree. */
function repoRoot() {
	// The systemd service sets WorkingDirectory to the repo.
	// Fall back to git toplevel if available.
	try {
		const top = execFileSync('git', ['rev-parse', '--show-toplevel'], {
			cwd: process.cwd(), encoding: 'utf8', timeout: 5000,
		}).trim();
		if (top && fs.existsSync(top)) return top;
	} catch {}
	return process.cwd();
}

// ---------------------------------------------------------------------------
// Route class
// ---------------------------------------------------------------------------

class PackedDeployRoutes {
	constructor($i) {
		this.$i = $i;
	}

	routes() {
		return {
			'/packed/deploy/push': this.push.bind(this),
			'/packed/deploy/status': this.status.bind(this),
			'/packed/deploy/restart': this.restart.bind(this),
		};
	}

	// -- authorization -------------------------------------------------------
	// Ed25519 signature ONLY (MAC-SEVERANCE Phase 2, cutover complete).
	// The shared-secret operatorKey path was removed: env-var secrets get
	// wiped on restart, while the public key in deploySign.js survives every
	// restart and is auditable in git. The private key lives only on the VM.
	checkAuth() {
		const body = this.$i?.body || {};
		const files = body.files || this.$i?.$_POST?.files || [];
		const message = String(body.message ?? this.$i?.$_POST?.message ?? '');

		const sig = body.sig || requestValue(this.$i, 'sig') || '';
		if (!sig) {
			return { success: false, error: 'FORBIDDEN', message: 'Deploy auth required: Ed25519 sig.' };
		}
		const ts = body.ts ?? requestValue(this.$i, 'ts');
		const tchk = checkTimestamp(ts);
		if (!tchk.ok) {
			return { success: false, error: 'FORBIDDEN', message: `Deploy signature rejected: ${tchk.error}.` };
		}
		const vchk = verifySignature({ ts, message, files }, sig);
		if (!vchk.ok) {
			return { success: false, error: 'FORBIDDEN', message: `Deploy signature rejected: ${vchk.error}.` };
		}
		const rchk = checkReplay(String(sig), ts);
		if (!rchk.ok) {
			return { success: false, error: 'FORBIDDEN', message: `Deploy signature rejected: ${rchk.error}.` };
		}
		return null;
	}

	/** Validate a repo-relative path. Returns {ok, absPath} or {ok:false, error}. */
	validatePath(relPath, root) {
		if (typeof relPath !== 'string' || !relPath) {
			return { ok: false, error: 'Path must be a non-empty string.' };
		}
		// Reject absolute paths, backslashes, null bytes, and traversal.
		if (path.isAbsolute(relPath) || relPath.includes('\\') || relPath.includes('\0')) {
			return { ok: false, error: `Rejected path: ${relPath}` };
		}
		const normalized = path.posix.normalize(relPath);
		if (normalized.startsWith('..') || normalized === '.' || normalized === '') {
			return { ok: false, error: `Rejected path: ${relPath}` };
		}
		// Block sensitive segments anywhere in the path.
		const segments = normalized.split('/');
		for (const seg of segments) {
			if (BLOCKED_SEGMENTS.has(seg) || seg.startsWith('.env')) {
				return { ok: false, error: `Blocked path segment: ${seg}` };
			}
		}
		// Must live under an allowed root.
		const allowed = ALLOWED_ROOTS.some(r => {
			if (r.endsWith('/')) return normalized === r.slice(0, -1) || normalized.startsWith(r);
			return normalized === r;
		});
		if (!allowed) {
			return { ok: false, error: `Path not in deployable roots: ${relPath}` };
		}
		const absPath = path.resolve(root, normalized);
		if (!absPath.startsWith(root + path.sep) && absPath !== root) {
			return { ok: false, error: `Path escapes repo: ${relPath}` };
		}
		return { ok: true, absPath, normalized };
	}

	async status() {
		return {
			success: true,
			configured: DEPLOY_SIGN_PUBLIC_KEYS.length > 0,
			auth: { signature: DEPLOY_SIGN_PUBLIC_KEYS.length > 0, sharedSecret: false },
			repo: repoRoot(),
			maxFileBytes: MAX_FILE_BYTES,
			maxFiles: MAX_FILES_PER_PUSH,
		};
	}

	// MAC-SEVERANCE: restart the production service via HTTPS.
	// This eliminates the last SSH dependency — the VM can deploy files
	// AND restart the service entirely over HTTPS, never needing the Mac.
	async restart() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;

		try {
			// Try systemd first (production), fall back gracefully
			execFileSync('systemctl', ['--user', 'restart', 'awtsmoos'], { timeout: 30000 });
			appendDeployLog({
				at: new Date().toISOString(),
				message: 'Service restart via deploy API',
				restart: true,
			});
			return {
				success: true,
				message: 'B"H service restart initiated via HTTPS. No Mac involved.',
			};
		} catch (e) {
			// If systemctl --user fails, try system-level (may need sudoers)
			try {
				execFileSync('sudo', ['systemctl', 'restart', 'awtsmoos'], { timeout: 30000 });
				appendDeployLog({
					at: new Date().toISOString(),
					message: 'Service restart via deploy API (sudo)',
					restart: true,
				});
				return {
					success: true,
					message: 'B"H service restart initiated via HTTPS (sudo). No Mac involved.',
				};
			} catch (e2) {
				return {
					success: false,
					error: 'RESTART_FAILED',
					message: `Restart failed: ${e2.message}`,
				};
			}
		}
	}

	async push() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;

		const body = this.$i?.body || {};
		const files = body.files || this.$i?.$_POST?.files || [];
		const message = String(body.message || this.$i?.$_POST?.message || '').slice(0, 500);

		if (!Array.isArray(files) || files.length === 0) {
			return { success: false, error: 'NO_FILES', message: 'files[] is required and must not be empty.' };
		}
		if (files.length > MAX_FILES_PER_PUSH) {
			return { success: false, error: 'TOO_MANY_FILES', message: `Max ${MAX_FILES_PER_PUSH} files per push.` };
		}

		const root = repoRoot();
		const written = [];
		const errors = [];

		for (let n = 0; n < files.length; n++) {
			const f = files[n] || {};
			const v = this.validatePath(f.path, root);
			if (!v.ok) {
				errors.push({ path: f.path, error: v.error });
				continue;
			}
			let buf;
			try {
				buf = Buffer.from(String(f.content || ''), 'base64');
			} catch (e) {
				errors.push({ path: f.path, error: 'Invalid base64 content.' });
				continue;
			}
			if (buf.length > MAX_FILE_BYTES) {
				errors.push({ path: f.path, error: `File exceeds ${MAX_FILE_BYTES} bytes.` });
				continue;
			}
			try {
				fs.mkdirSync(path.dirname(v.absPath), { recursive: true });
				fs.writeFileSync(v.absPath, buf);
				written.push(v.normalized);
			} catch (e) {
				errors.push({ path: f.path, error: e.message });
			}
		}

		appendDeployLog({
			at: new Date().toISOString(),
			message,
			written: written.length,
			errorCount: errors.length,
			paths: written,
			errors: errors.map(e => ({ path: e.path, error: e.error })),
		});

		if (errors.length && !written.length) {
			return { success: false, error: 'ALL_FAILED', written: [], errors };
		}
		return {
			success: true,
			written: written.length,
			paths: written,
			errors,
			message: `B"H deployed ${written.length} file(s).${errors.length ? ` ${errors.length} failed.` : ''}`,
		};
	}
}

module.exports = { PackedDeployRoutes };
